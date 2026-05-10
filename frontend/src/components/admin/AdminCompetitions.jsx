import { useMemo, useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock, AdminModal } from './AdminShared'

const EMPTY_FORM = {
  name: '',
  short_name: '',
  organizer: '',
  time: '',
  frequency: '',
  participants: '',
  description: '',
  difficulty: 3,
  website: '',
  icon: '🏆',
  category: '数学基础',
  tags: '[]',
  prize: '',
  prep_tips: '',
  format: '',
}

export default function AdminCompetitions() {
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
      const result = await api.admin.competitions.list()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      setNotice({ type: 'error', title: '竞赛列表加载失败', message: error.message || '请稍后重试。' })
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
      [item.name, item.short_name, item.organizer, item.category, item.time]
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
    setForm({ ...EMPTY_FORM, ...item, tags: item.tags || '[]' })
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
      const payload = { ...form, difficulty: Number(form.difficulty) || 3 }
      if (editItem) {
        await api.admin.competitions.update(editItem.id, payload)
        setNotice({ type: 'success', title: '竞赛已更新', message: `已保存「${payload.name}」的新内容。` })
      } else {
        await api.admin.competitions.create(payload)
        setNotice({ type: 'success', title: '竞赛已新增', message: `已创建「${payload.name}」。` })
      }
      closeModal()
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '保存失败', message: error.message || '请检查输入后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定删除「${name}」吗？`)) return

    try {
      await api.admin.competitions.delete(id)
      setNotice({ type: 'success', title: '竞赛已删除', message: `「${name}」已从列表移除。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) {
    return <AdminLoadingBlock label="正在载入竞赛数据..." />
  }

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Competitions"
        title="竞赛管理"
        description="把赛事做成结构化档案，前台展示会稳定很多。"
        meta={[
          { label: '全部记录', value: data.length },
          { label: '筛选结果', value: filtered.length },
        ]}
        actions={
          <>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索竞赛名称、主办方、分类" />
            <button className="button button--primary" onClick={openNew}>
              新增竞赛
            </button>
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
                    <h3>{item.name}</h3>
                    <p>{item.short_name || item.category || '竞赛档案'}</p>
                  </div>
                  <span className="admin-badge">{'★'.repeat(item.difficulty)}{'☆'.repeat(Math.max(0, 5 - item.difficulty))}</span>
                </div>
                <div className="admin-record-card__meta">
                  <span>{item.organizer || '主办方待补充'}</span>
                  <span>{item.time || '时间待补充'}</span>
                </div>
                <p className="admin-record-card__desc">{item.description || '暂无简介。'}</p>
                <div className="admin-record-card__actions">
                  <button className="button button--ghost" onClick={() => openEdit(item)}>编辑</button>
                  <button className="button button--danger" onClick={() => handleDelete(item.id, item.name)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title={data.length ? '没有匹配结果' : '暂无竞赛记录'}
            description={data.length ? '换个关键词试试，或者新增一条竞赛。' : '先创建第一条竞赛档案。'}
          />
        )}
      </section>

      {showModal && (
        <AdminModal
          eyebrow={editItem ? 'Edit competition' : 'Create competition'}
          title={editItem ? '编辑竞赛' : '新增竞赛'}
          subtitle="建议优先把时间、分类、简介和备赛建议补完整。"
          onClose={closeModal}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__section">
              <h4>基础信息</h4>
              <div className="admin-form__grid">
                <label>竞赛名称<input name="name" value={form.name} onChange={handleChange} required /></label>
                <label>简称<input name="short_name" value={form.short_name} onChange={handleChange} /></label>
                <label>主办方<input name="organizer" value={form.organizer} onChange={handleChange} /></label>
                <label>比赛时间<input name="time" value={form.time} onChange={handleChange} /></label>
                <label>频次<input name="frequency" value={form.frequency} onChange={handleChange} /></label>
                <label>参赛对象<input name="participants" value={form.participants} onChange={handleChange} /></label>
                <label>难度<input name="difficulty" type="number" min="1" max="5" value={form.difficulty} onChange={handleChange} /></label>
                <label>分类<input name="category" value={form.category} onChange={handleChange} /></label>
                <label>官网<input name="website" value={form.website} onChange={handleChange} /></label>
                <label>图标<input name="icon" value={form.icon} onChange={handleChange} /></label>
              </div>
            </div>

            <div className="admin-form__section">
              <h4>内容描述</h4>
              <label>简介<textarea name="description" value={form.description} onChange={handleChange} /></label>
              <label>奖项设置<textarea name="prize" value={form.prize} onChange={handleChange} /></label>
              <label>备赛建议<textarea name="prep_tips" value={form.prep_tips} onChange={handleChange} /></label>
              <label>比赛形式<input name="format" value={form.format} onChange={handleChange} /></label>
            </div>

            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModal}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '保存中...' : '保存竞赛'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
