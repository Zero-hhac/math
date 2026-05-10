import { useMemo, useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock, AdminModal } from './AdminShared'

const ROLE_LABELS = { super_admin: '超级管理员', admin: '管理员', member: '会员' }
const ROLE_OPTIONS = ['member', 'admin', 'super_admin']

const EMPTY_FORM = { username: '', password: '', nickname: '', email: '', phone: '', role: 'member' }

export default function AdminUsers() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)

  const PAGE_SIZE = 20

  const load = async (pageNum) => {
    setLoading(true)
    try {
      const result = await api.admin.users.list({ page: pageNum, page_size: PAGE_SIZE, role: roleFilter || undefined })
      setData(Array.isArray(result.list) ? result.list : [])
      setTotal(result.total || 0)
      setTotalPages(Math.ceil((result.total || 0) / PAGE_SIZE))
    } catch (error) {
      setNotice({ type: 'error', title: '用户列表加载失败', message: error.message || '请稍后重试。' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page) }, [page, roleFilter])

  useEffect(() => { setPage(1) }, [roleFilter])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [item.username, item.nickname, item.email, item.phone]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    )
  }, [data, query])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setShowCreateModal(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      username: item.username || '',
      password: '',
      nickname: item.nickname || '',
      email: item.email || '',
      phone: item.phone || '',
      role: item.role || 'member',
    })
    setShowEditModal(true)
  }

  const openPassword = (item) => {
    setEditItem(item)
    setPwdForm({ newPassword: '', confirmPassword: '' })
    setShowPwdModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setShowPwdModal(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
    setPwdForm({ newPassword: '', confirmPassword: '' })
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handlePwdChange = (event) => {
    const { name, value } = event.target
    setPwdForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!form.username || !form.password || !form.nickname) {
      setNotice({ type: 'error', title: '请填写必填项', message: '用户名、密码、昵称为必填。' })
      return
    }
    setSaving(true)
    setNotice(null)

    try {
      await api.admin.users.create({
        username: form.username,
        password: form.password,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        role: form.role,
      })
      setNotice({ type: 'success', title: '用户已创建', message: `账号「${form.username}」创建成功。` })
      closeModals()
      load(page)
    } catch (error) {
      setNotice({ type: 'error', title: '创建失败', message: error.message || '请检查输入后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)

    try {
      await api.admin.users.update(editItem.id, {
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        role: form.role,
      })
      setNotice({ type: 'success', title: '用户已更新', message: `账号「${form.username}」已更新。` })
      closeModals()
      load(page)
    } catch (error) {
      setNotice({ type: 'error', title: '更新失败', message: error.message || '请检查输入后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (pwdForm.newPassword.length < 6) {
      setNotice({ type: 'error', title: '密码太短', message: '密码至少需要6位。' })
      return
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setNotice({ type: 'error', title: '密码不匹配', message: '两次输入的密码不一致。' })
      return
    }
    setSaving(true)
    setNotice(null)

    try {
      await api.admin.users.resetPassword(editItem.id, pwdForm.newPassword)
      setNotice({ type: 'success', title: '密码已重置', message: `账号「${editItem.username}」的密码已更新。` })
      closeModals()
    } catch (error) {
      setNotice({ type: 'error', title: '重置失败', message: error.message || '请稍后重试。' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 1 ? 0 : 1
    const action = newStatus === 0 ? '拉黑' : '解除拉黑'
    if (!window.confirm(`确定${action}用户「${item.username}」吗？${newStatus === 0 ? '该用户将无法登录。' : '该用户将恢复登录权限。'}`)) return

    try {
      await api.admin.users.update(item.id, { status: newStatus })
      setNotice({ type: 'success', title: `${action}操作完成`, message: `用户「${item.username}」已${action}。` })
      load(page)
    } catch (error) {
      setNotice({ type: 'error', title: '操作失败', message: error.message || '请稍后重试。' })
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`确定删除用户「${item.username}」吗？此操作不可恢复。`)) return
    try {
      await api.admin.users.delete(item.id)
      setNotice({ type: 'success', title: '用户已删除', message: `「${item.username}」已移除。` })
      load(page)
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) return <AdminLoadingBlock label="正在载入用户列表..." />

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Account Manager"
        title="账号管理"
        description="管理所有用户账号，可创建新账号、修改信息、调整角色、拉黑/恢复及重置密码。"
        meta={[
          { label: '用户总数', value: total },
          { label: '当前页', value: filtered.length },
          { label: '已拉黑', value: data.filter((u) => u.status === 0).length },
        ]}
        actions={
          <>
            <select className="button button--ghost" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ minWidth: '100px' }}>
              <option value="">全部角色</option>
              <option value="super_admin">超级管理员</option>
              <option value="admin">管理员</option>
              <option value="member">会员</option>
            </select>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索用户名、昵称、邮箱" />
            <button className="button button--primary" onClick={openCreate}>注册账号</button>
          </>
        }
      />

      <AdminNotice notice={notice} />

      <section className="admin-panel">
        {filtered.length > 0 ? (
          <>
            <div className="admin-collection">
              {filtered.map((item) => (
                <article key={item.id} className="admin-record-card">
                  <div className="admin-record-card__head">
                    <div className="admin-persona">
                      <div className={`admin-persona__avatar ${item.status === 0 ? 'admin-persona__avatar--dim' : ''}`}>
                        {item.nickname ? item.nickname.slice(0, 1) : 'U'}
                      </div>
                      <div>
                        <h3>{item.nickname || item.username}</h3>
                        <p>@{item.username}</p>
                      </div>
                    </div>
                    <div className="admin-record-card__meta">
                      <span className={`admin-badge admin-badge--role ${item.role === 'super_admin' ? 'admin-badge--super' : ''}`}>
                        {ROLE_LABELS[item.role] || item.role}
                      </span>
                      <span className={`admin-badge ${item.status === 0 ? 'admin-badge--danger' : 'admin-badge--active'}`}>
                        {item.status === 0 ? '已拉黑' : '正常'}
                      </span>
                    </div>
                  </div>
                  <div className="admin-record-card__stats">
                    {item.email && <span>邮箱: {item.email}</span>}
                    {item.phone && <span>电话: {item.phone}</span>}
                    <span>注册: {item.created_at ? new Date(item.created_at).toLocaleDateString('zh-CN') : '-'}</span>
                  </div>
                  <div className="admin-record-card__actions">
                    <button className="button button--ghost" onClick={() => openEdit(item)}>编辑</button>
                    <button className="button button--ghost" onClick={() => openPassword(item)}>重置密码</button>
                    <button
                      className={`button ${item.status === 0 ? 'button--primary' : 'button--warning'}`}
                      onClick={() => handleToggleStatus(item)}
                    >
                      {item.status === 0 ? '解除拉黑' : '拉黑'}
                    </button>
                    <button className="button button--danger" onClick={() => handleDelete(item)}>删除</button>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination">
                <button className="button button--ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</button>
                <span>第 {page} / {totalPages} 页（共 {total} 条）</span>
                <button className="button button--ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</button>
              </div>
            )}
          </>
        ) : (
          <AdminEmptyState
            title={total ? '没有匹配结果' : '暂无用户账号'}
            description={total ? '换个关键词试试。' : '先注册第一个账号。'}
          />
        )}
      </section>

      {showCreateModal && (
        <AdminModal eyebrow="Register account" title="注册新账号" subtitle="为他人创建账号，设置初始密码和角色。" onClose={closeModals}>
          <form className="admin-form" onSubmit={handleCreate}>
            <div className="admin-form__section">
              <h4>基本信息 *</h4>
              <div className="admin-form__grid">
                <label>用户名<input name="username" value={form.username} onChange={handleChange} required placeholder="登录使用" /></label>
                <label>密码<input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="至少6位" /></label>
              </div>
              <label>昵称<input name="nickname" value={form.nickname} onChange={handleChange} required placeholder="显示名称" /></label>
            </div>
            <div className="admin-form__section">
              <h4>联系信息（选填）</h4>
              <div className="admin-form__grid">
                <label>邮箱<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
                <label>电话<input name="phone" value={form.phone} onChange={handleChange} /></label>
              </div>
            </div>
            <div className="admin-form__section">
              <h4>账号权限</h4>
              <label>
                角色
                <select name="role" value={form.role} onChange={handleChange}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModals}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '创建中...' : '注册账号'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {showEditModal && (
        <AdminModal eyebrow="Edit account" title="编辑用户信息" subtitle={`编辑 ${editItem?.username} 的资料与权限。`} onClose={closeModals}>
          <form className="admin-form" onSubmit={handleEdit}>
            <div className="admin-form__section">
              <h4>基本信息</h4>
              <label>用户名（不可修改）<input value={form.username} disabled /></label>
              <label>昵称<input name="nickname" value={form.nickname} onChange={handleChange} required /></label>
            </div>
            <div className="admin-form__section">
              <h4>联系信息</h4>
              <div className="admin-form__grid">
                <label>邮箱<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
                <label>电话<input name="phone" value={form.phone} onChange={handleChange} /></label>
              </div>
            </div>
            <div className="admin-form__section">
              <h4>账号权限</h4>
              <label>
                角色
                <select name="role" value={form.role} onChange={handleChange}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModals}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      {showPwdModal && (
        <AdminModal eyebrow="Reset password" title={`重置密码 - ${editItem?.username}`} subtitle="输入新密码，至少6位。" onClose={closeModals}>
          <form className="admin-form" onSubmit={handleResetPassword}>
            <div className="admin-form__section">
              <label>新密码<input name="newPassword" type="password" value={pwdForm.newPassword} onChange={handlePwdChange} required placeholder="至少6位" /></label>
              <label>确认密码<input name="confirmPassword" type="password" value={pwdForm.confirmPassword} onChange={handlePwdChange} required placeholder="再次输入" /></label>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="button button--ghost" onClick={closeModals}>取消</button>
              <button type="submit" className="button button--primary" disabled={saving}>
                {saving ? '重置中...' : '确认重置'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
