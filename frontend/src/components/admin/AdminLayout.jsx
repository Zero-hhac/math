import { useMemo } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../api/AdminAuth'

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: '总览', note: 'Overview' },
  { path: '/admin/competitions', label: '竞赛', note: 'Competitions' },
  { path: '/admin/news', label: '动态', note: 'Newsroom' },
  { path: '/admin/activities', label: '活动', note: 'Activities' },
  { path: '/admin/members', label: '成员', note: 'People' },
  { path: '/admin/documents', label: '资料', note: 'Documents' },
  { path: '/admin/users', label: '账号', note: 'Accounts', superAdminOnly: true },
  { path: '/admin/contacts', label: '留言', note: 'Inbox' },
]

export default function AdminLayout() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  const visibleItems = useMemo(() => {
    const isSuperAdmin = user?.role === 'super_admin'
    return NAV_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__mark">∑</span>
          <div>
            <strong>Math Association</strong>
            <p>Editorial Control Room</p>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `admin-sidebar__link ${isActive ? 'active' : ''}`}
            >
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user-card">
            <span>当前登录</span>
            <strong>{user?.username || 'admin'}</strong>
          </div>
          <button className="button button--ghost button--full" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar__frame">
            <div>
              <div className="eyebrow">Back Office</div>
              <h1>协会内容管理台</h1>
            </div>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
