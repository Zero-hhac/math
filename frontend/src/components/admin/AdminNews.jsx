import { useMemo, useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock, AdminModal } from './AdminShared'

const EMPTY_FORM = { title: '', content: '', summary: '', cover_image: '', type: 'news', is_published: true, visibility: 'public', publish_at: '' }

export default function AdminNews() {
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
      const result = await api.admin.news.list()
      setData(Array.isArray(result?.list) ? result.list : (Array.isArray(result) ? result : []))
    } catch (error) {
      setNotice({ type: 'error', title: '动态列表加载失败', message: error.message || '请稍后重试。' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [item.title, item.summary, item.content]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword))
    )
  }, [data, query])

  const openNew = () => {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ ...EMPTY_FORM, ...item })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)

    try {
      if (editItem) {
        await api.admin.news.update(editItem.id, form)
        setNotice({ type: 'success', title: '动态已更新', message: `已保存「${form.title}」。` })
      } else {
        await api.admin.news.create(form)
        setNotice({ type: 'success', title: '动态已新增', message: `已创建「${form.title}」。` })
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
      await api.admin.news.delete(id)
      setNotice({ type: 'success', title: '动态已删除', message: `「${title}」已移除。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) {
    return <AdminLoadingBlock label="正在载入动态内容..." />
  }

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Newsroom"
        title="动态管理"
        description="摘要、标题和日期会直接影响前台内容的节奏感。"
        meta={[
          { label: '全部动态', value: data.length },
          { label: '筛选结果', value: filtered.length },
        ]}
        actions={
          <>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索标题、摘要、日期" />
            <button className="button button--primary" onClick={openNew}>
              新增动态
            </button>
          </>
        }
      />

      <AdminNotice notice={notice} />

      <section className="admin-panel">
        {filtered.length > 0 ? (
          <div className="admin-collection admin-collection--news">
            {filtered.map((item) => (
              <article key={item.id} className="admin-record-card admin-record-card--news">
                <div className="admin-record-card__head">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : '日期待补充'}</p>
                  </div>
                  <div className="admin-record-card__meta">
                    <span className="admin-badge">{item.visibility === 'members' ? '仅会员' : item.visibility === 'both' ? '首页+会员' : '公开'}</span>
                    <span className={`admin-badge ${item.is_published ? '' : 'admin-badge--dim'}`}>{item.is_published ? '已发布' : '草稿'}</span>
                  </div>
                </div>
                <p className="admin-record-card__desc">{item.summary || item.content || '暂无内容摘要。'}</p>
                <div className="admin-record-card__actions">
                  <button className="button button--ghost" onClick={() => openEdit(item)}>编辑</button>
                  <button className="button button--danger" onClick={() => handleDelete(item.id, item.title)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title={data.length ? '没有匹配结果' : '暂无新闻记录'}
            description={data.length ? '换个关键词试试。' : '先创建第一条动态。'}
          />
        )}
      </section>

      {showModal && (
        <AdminModal
          eyebrow={editItem ? 'Edit update' : 'Create update'}
          title={editItem ? '编辑动态' : '新增动态'}
          subtitle="建议摘要控制在两三句话内，这样前台会更利落。"
          onClose={closeModal}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__section">
              <h4>发布信息</h4>
              <label>标题<input name="title" value={form.title} onChange={handleChange} required /></label>
              <div className="admin-form__grid">
                <label>封面图 URL<input name="cover_image" value={form.cover_image} onChange={handleChange} /></label>
              </div>
            </div>
            <div className="admin-form__section">
              <h4>内容编辑</h4>
              <label>摘要<textarea name="summary" value={form.summary} onChange={handleChange} /></label>
              <label>正文<textarea name="content" value={form.content} onChange={handleChange} /></label>
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
                定时发布时间（可选）
                <input type="datetime-local" name="publish_at" value={form.publish_at} onChange={handleChange} />
              </label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModal}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '保存中...' : '保存动态'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
