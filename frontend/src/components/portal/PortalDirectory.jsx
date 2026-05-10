import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function PortalDirectory() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.admin.members.list()
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m =>
    !search || m.user?.nickname?.includes(search) || m.department?.includes(search) || m.grade?.includes(search)
  )

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>加载中...</p></div>
  }

  return (
    <div>
      <div className="section-heading section-heading--compact">
        <div className="eyebrow">Member Directory</div>
        <h2>成员通讯录</h2>
        <p>让协会成员之间更容易找到彼此，建立学术协作与人际连接。</p>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', minHeight: 44, borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(31,42,68,0.08)', maxWidth: 400, marginBottom: 28 }}>
        <span style={{ color: 'var(--text-soft)' }}>⌕</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名、部门、年级..." style={{ width: '100%', background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', fontSize: '0.9rem' }} />
      </label>

      {filtered.length > 0 ? (
        <div className="member-grid">
          {filtered.map(item => (
            <article key={item.id} className="member-card">
              <div className="member-card__avatar">
                {item.user?.nickname?.slice(0, 1) || 'M'}
              </div>
              <div className="member-card__body">
                <h4>{item.user?.nickname || '成员'}</h4>
                {item.department && <span>{item.department}</span>}
                {item.grade && <span style={{ display: 'inline-block', marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: 'rgba(188,108,37,0.08)', color: 'var(--accent)', fontSize: '0.78rem' }}>{item.grade}</span>}
                {item.bio && <p>{item.bio}</p>}
                {item.achievement && <p style={{ marginTop: 8, fontSize: '0.84rem', color: 'var(--accent-cool)' }}>🏆 {item.achievement}</p>}
                {item.user?.email && (
                  <a href={`mailto:${item.user.email}`} style={{ display: 'block', marginTop: 8, color: 'var(--accent)', fontSize: '0.84rem' }}>
                    {item.user.email}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state surface-card">
          {search ? '未找到匹配的成员。' : '暂无成员信息，管理员会在后台添加成员展示。'}
        </div>
      )}
    </div>
  )
}
