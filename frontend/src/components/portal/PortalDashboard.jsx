import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useAdminAuth } from '../../api/AdminAuth'

export default function PortalDashboard() {
  const { user } = useAdminAuth()
  const [stats, setStats] = useState({})

  useEffect(() => {
    api.admin.stats().then(data => setStats(data)).catch(() => {})
  }, [])

  const cards = [
    { to: '/portal/documents', icon: '📄', title: '内部文档', desc: '查阅协会内部文件与会议纪要，掌握协会运作脉络', stat: stats.documents, label: '份文档' },
    { to: '/portal/resources', icon: '📚', title: '学习资源', desc: '竞赛题库、讲义资料与视频教程，系统提升数学能力', stat: stats.resources, label: '份资料' },
    { to: '/portal/directory', icon: '👥', title: '成员通讯录', desc: '查看协会成员的联系方式，建立学术协作网络', stat: stats.members, label: '位成员' },
  ]

  return (
    <div>
      <div className="section-heading section-heading--compact">
        <div className="eyebrow">Member Portal</div>
        <h2>欢迎回来，{user?.nickname || user?.username}</h2>
        <p>这里是数学协会会员中心，你可以访问协会内部资料与学习资源。</p>
      </div>

      {/* Stats strip */}
      <div className="stats-strip" style={{ marginBottom: 42 }}>
        {cards.map(card => (
          <div key={card.to} className="metric-card">
            <span>{card.title}</span>
            <strong>{card.stat ?? '—'}</strong>
            <span>{card.label}</span>
          </div>
        ))}
        <div className="metric-card">
          <span>当前身份</span>
          <strong>{user?.role === 'admin' || user?.role === 'super_admin' ? '管理员' : '会员'}</strong>
          <span>角色</span>
        </div>
      </div>

      {/* Entry cards */}
      <div className="pillar-grid">
        {cards.map(card => (
          <Link key={card.to} to={card.to} style={{ textDecoration: 'none' }}>
            <div className="surface-card surface-card--tall" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '2rem', marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: 10, color: 'var(--text)' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', lineHeight: 1.6 }}>{card.desc}</p>
              <div className="resource-card__link" style={{ marginTop: 16 }}>进入 →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
