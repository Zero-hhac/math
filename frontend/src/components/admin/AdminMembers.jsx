import { useMemo, useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock, AdminModal } from './AdminShared'

const EMPTY_FORM = { user_id: '', nick: '', bio: '', achievement: '', department: '', grade: '', skills: '', is_public: true }

export default function AdminMembers() {
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
      const result = await api.admin.members.list()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      setNotice({ type: 'error', title: '成员列表加载失败', message: error.message || '请稍后重试。' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [item.user?.nickname, item.user?.username, item.department, item.bio]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    )
  }, [data, query])

  const openNew = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true) }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      user_id: item.user_id?.toString() || '',
      nick: item.user?.nickname || '',
      bio: item.bio || '',
      achievement: item.achievement || '',
      department: item.department || '',
      grade: item.grade || '',
      skills: item.skills || '',
      is_public: item.is_public !== false,
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
    if (!form.user_id) { setNotice({ type: 'error', title: '请选择关联用户', message: '需要先有用户账号才能创建成员展示。' }); return }
    setSaving(true)
    setNotice(null)

    const payload = {
      user_id: Number(form.user_id),
      bio: form.bio,
      achievement: form.achievement,
      department: form.department,
      grade: form.grade,
      skills: form.skills,
      is_public: form.is_public,
    }

    try {
      if (editItem) {
        await api.admin.members.update(editItem.id, payload)
        setNotice({ type: 'success', title: '成员已更新', message: '已保存。' })
      } else {
        await api.admin.members.create(payload)
        setNotice({ type: 'success', title: '成员已新增', message: '已创建。' })
      }
      closeModal()
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '保存失败', message: error.message || '请检查输入后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const item = data.find(d => d.id === id)
    if (!window.confirm(`确定删除「${item?.user?.nickname || '该成员'}」的展示吗？`)) return
    try {
      await api.admin.members.delete(id)
      setNotice({ type: 'success', title: '已删除', message: '成员展示已移除。' })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) return <AdminLoadingBlock label="正在载入成员资料..." />

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="People"
        title="成员管理"
        description="成员展示关联已有用户账号，可设置是否在前台公开。"
        meta={[{ label: '成员总数', value: data.length }, { label: '筛选结果', value: filtered.length }]}
        actions={
          <>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索姓名、部门、简介" />
            <button className="button button--primary" onClick={openNew}>新增展示</button>
          </>
        }
      />

      <AdminNotice notice={notice} />

      <section className="admin-panel">
        {filtered.length > 0 ? (
          <div className="admin-collection">
            {filtered.map((item) => (
              <article key={item.id} className="admin-record-card">
                <div className="admin-persona">
                  <div className="admin-persona__avatar">{item.user?.nickname?.slice(0, 1) || 'M'}</div>
                  <div>
                    <h3>{item.user?.nickname || '未知'}</h3>
                    <p>{item.department || '未设置部门'}</p>
                  </div>
                </div>
                <div className="admin-record-card__meta">
                  {item.grade && <span>{item.grade}</span>}
                  <span className={`admin-badge ${!item.is_public ? 'admin-badge--dim' : ''}`}>{item.is_public ? '公开' : '隐藏'}</span>
                </div>
                <p className="admin-record-card__desc">{item.bio || item.achievement || '暂无简介。'}</p>
                <div className="admin-record-card__actions">
                  <button className="button button--ghost" onClick={() => openEdit(item)}>编辑</button>
                  <button className="button button--danger" onClick={() => handleDelete(item.id)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState title={data.length ? '没有匹配结果' : '暂无成员资料'} description={data.length ? '换个关键词试试。' : '先创建第一条成员展示。'} />
        )}
      </section>

      {showModal && (
        <AdminModal
          eyebrow={editItem ? 'Edit member' : 'Create member'}
          title={editItem ? '编辑成员展示' : '新增成员展示'}
          subtitle="成员展示需关联已有用户账号。先在用户管理中创建账号，再添加展示。"
          onClose={closeModal}
        >
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form__section">
              <h4>关联用户 *</h4>
              <label>用户 ID<input name="user_id" type="number" value={form.user_id} onChange={handleChange} required placeholder="填写用户的数字 ID" /></label>
            </div>
            <div className="admin-form__section">
              <h4>展示信息</h4>
              <div className="admin-form__grid">
                <label>部门/角色<input name="department" value={form.department} onChange={handleChange} /></label>
                <label>年级<input name="grade" value={form.grade} onChange={handleChange} /></label>
              </div>
              <label>技能标签（逗号分隔）<input name="skills" value={form.skills} onChange={handleChange} placeholder="数学分析, 竞赛, 建模" /></label>
              <label>个人简介<textarea name="bio" value={form.bio} onChange={handleChange} /></label>
              <label>成就/荣誉<textarea name="achievement" value={form.achievement} onChange={handleChange} /></label>
              <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} />
                在前台公开显示
              </label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModal}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '保存中...' : '保存成员'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
