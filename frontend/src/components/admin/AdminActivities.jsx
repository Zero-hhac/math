import { useMemo, useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock, AdminModal } from './AdminShared'

const VISLabels = { public: '公开(首页+会员)', members: '仅会员', both: '首页+会员' }
const EMPTY_FORM = { title: '', description: '', period: '', icon: '📅', sort_order: 0, is_published: true, visibility: 'public', publish_at: '' }

export default function AdminActivities() {
  const [data, setData] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const result = await api.admin.activities.list()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      setNotice({ type: 'error', title: '活动列表加载失败', message: error.message || '请稍后重试。' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [item.title, item.description, item.period]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    )
  }, [data, query])

  const openNew = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      ...EMPTY_FORM,
      title: item.title || '',
      description: item.description || '',
      period: item.period || '',
      icon: item.icon || '📅',
      sort_order: item.sort_order || 0,
      is_published: item.is_published !== false,
      visibility: item.visibility || 'public',
      publish_at: item.publish_at ? item.publish_at.slice(0, 16) : '',
    })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(EMPTY_FORM) }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title) { setNotice({ type: 'error', title: '请填写标题', message: '活动标题为必填项。' }); return }
    setSaving(true)
    setNotice(null)
    const payload = {
      title: form.title,
      description: form.description,
      period: form.period,
      icon: form.icon,
      sort_order: Number(form.sort_order) || 0,
      is_published: form.is_published,
      visibility: form.visibility,
      publish_at: form.publish_at || null,
    }
    try {
      if (editItem) {
        await api.admin.activities.update(editItem.id, payload)
        setNotice({ type: 'success', title: '活动已更新', message: `已保存「${form.title}」。` })
      } else {
        await api.admin.activities.create(payload)
        setNotice({ type: 'success', title: '活动已新增', message: `已创建「${form.title}」。` })
      }
      closeModal()
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '保存失败', message: error.message || '请检查输入后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`确定删除「${title}」吗？`)) return
    try {
      await api.admin.activities.delete(id)
      setNotice({ type: 'success', title: '活动已删除', message: `「${title}」已移除。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  const handleTogglePublish = async (item) => {
    try {
      await api.admin.activities.update(item.id, { ...item, is_published: !item.is_published })
      setNotice({ type: 'success', title: item.is_published ? '已下架' : '已发布', message: `「${item.title}」${item.is_published ? '已设为不公开' : '已公开发布'}。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '操作失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) return <AdminLoadingBlock label="正在载入活动列表..." />

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Activities"
        title="活动管理"
        description="管理协会活动信息，可设置展示范围（首页/会员）和定时发布。"
        meta={[
          { label: '全部活动', value: data.length },
          { label: '已发布', value: data.filter((d) => d.is_published).length },
          { label: '筛选结果', value: filtered.length },
        ]}
        actions={
          <>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索活动标题、描述" />
            <button className="button button--primary" onClick={openNew}>新增活动</button>
          </>
        }
      />

      <AdminNotice notice={notice} />

      <section className="admin-panel">
        {filtered.length > 0 ? (
          <div className="admin-collection">
            {filtered.map((item) => (
              <article key={item.id} className="admin-record-card">
                <div className="admin-record-card__head">
                  <div>
                    <h3>{item.icon} {item.title}</h3>
                    <p>{item.period || '未设置周期'}</p>
                  </div>
                  <div className="admin-record-card__meta">
                    <span className="admin-badge">{VISLabels[item.visibility] || item.visibility}</span>
                    <span className={`admin-badge ${item.is_published ? '' : 'admin-badge--dim'}`}>{item.is_published ? '已发布' : '草稿'}</span>
                  </div>
                </div>
                <p className="admin-record-card__desc">{item.description || '暂无描述。'}</p>
                {item.publish_at && (
                  <div className="admin-record-card__stats">
                    <span>定时发布: {new Date(item.publish_at).toLocaleString('zh-CN')}</span>
                  </div>
                )}
                <div className="admin-record-card__actions">
                  <button className="button button--ghost" onClick={() => openEdit(item)}>编辑</button>
                  <button className="button button--ghost" onClick={() => handleTogglePublish(item)}>
                    {item.is_published ? '下架' : '发布'}
                  </button>
                  <button className="button button--danger" onClick={() => handleDelete(item.id, item.title)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState title={data.length ? '没有匹配结果' : '暂无活动'} description={data.length ? '换个关键词试试。' : '先创建第一个活动。'} />
        )}
      </section>

      {showModal && (
        <AdminModal
          eyebrow={editItem ? 'Edit activity' : 'Create activity'}
          title={editItem ? '编辑活动' : '新增活动'}
          subtitle="设置展示范围，可同时显示在首页和会员中心，或仅限会员查看。"
          onClose={closeModal}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__section">
              <h4>基本信息</h4>
              <label>标题<input name="title" value={form.title} onChange={handleChange} required /></label>
              <label>周期/频次<input name="period" value={form.period} onChange={handleChange} placeholder="如：每周、每月、期中" /></label>
              <label>图标<input name="icon" value={form.icon} onChange={handleChange} style={{ width: 80 }} /></label>
              <label>描述<textarea name="description" value={form.description} onChange={handleChange} /></label>
            </div>
            <div className="admin-form__section">
              <h4>展示与发布</h4>
              <label>
                展示范围
                <select name="visibility" value={form.visibility} onChange={handleChange}>
                  <option value="public">公开（首页+会员中心）</option>
                  <option value="members">仅会员中心</option>
                  <option value="both">首页+会员中心</option>
                </select>
              </label>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
                立即发布
              </label>
              <label>
                定时发布时间（可选，留空则按「立即发布」开关决定）
                <input type="datetime-local" name="publish_at" value={form.publish_at} onChange={handleChange} />
              </label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModal}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '保存中...' : '保存活动'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}