import { useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminNotice, AdminEmptyState, AdminLoadingBlock } from './AdminShared'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const [statsData, contactData] = await Promise.all([api.admin.stats(), api.admin.contacts()])
      setStats(statsData)
      setContacts(Array.isArray(contactData) ? contactData.slice(0, 6) : [])
    } catch (err) {
      setError(err.message || '后台总览加载失败。')
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (!stats && !error) {
    return <AdminLoadingBlock label="正在载入后台总览..." />
  }

  const statItems = stats
    ? [
        { label: '竞赛条目', value: stats.competitions, note: 'Competition records' },
        { label: '动态数量', value: stats.news, note: 'Published news' },
        { label: '成员档案', value: stats.members, note: 'People profiles' },
        { label: '留言收件', value: stats.contacts, note: 'Inbox items' },
      ]
    : []

  const unreadCount = contacts.filter((item) => !item.is_read).length

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Overview"
        title="后台总览"
        description="先看全局状态，再决定今天优先维护哪一类内容。"
        meta={[
          { label: '未读留言', value: unreadCount },
          { label: '最近刷新', value: '实时请求' },
        ]}
        actions={
          <button className="button button--ghost" onClick={load}>
            刷新数据
          </button>
        }
      />

      {error && (
        <AdminNotice
          notice={{
            type: 'error',
            title: '加载失败',
            message: error,
          }}
        />
      )}

      {stats && (
        <>
          <div className="admin-metric-grid">
            {statItems.map((item) => (
              <article key={item.label} className="admin-metric-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </article>
            ))}
          </div>

          <section className="admin-panel">
            <div className="admin-panel__head">
              <h3>最近留言</h3>
              <p>这里会优先显示最近的咨询与报名内容，方便你快速处理。</p>
            </div>

            {contacts.length > 0 ? (
              <div className="admin-inbox">
                {contacts.map((contact) => (
                  <article key={contact.id} className={`admin-message ${!contact.is_read ? 'unread' : ''}`}>
                    <div className="admin-message__avatar">{contact.name?.slice(0, 1) || 'M'}</div>
                    <div className="admin-message__body">
                      <div className="admin-message__head">
                        <strong>{contact.name}</strong>
                        <span>{contact.created_at?.slice(0, 16)?.replace('T', ' ') || '新留言'}</span>
                      </div>
                      <p className="admin-message__meta">{contact.email}</p>
                      <p>{contact.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <AdminEmptyState title="暂无留言" description="新的表单提交会出现在这里。" />
            )}
          </section>
        </>
      )}
    </div>
  )
}
