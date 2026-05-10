import { useMemo, useState, useEffect } from 'react'
import { api } from '../../api'
import { AdminToolbar, AdminSearch, AdminNotice, AdminEmptyState, AdminLoadingBlock } from './AdminShared'

export default function AdminContacts() {
  const [data, setData] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const result = await api.admin.contacts()
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      setNotice({ type: 'error', title: '留言列表加载失败', message: error.message || '请稍后重试。' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const unreadCount = data.filter((item) => !item.is_read).length

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return data
    return data.filter((item) =>
      [item.name, item.email, item.phone, item.message]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword))
    )
  }, [data, query])

  const handleMarkRead = async (id) => {
    try {
      await api.admin.markRead(id)
      setNotice({ type: 'success', title: '状态已更新', message: '这条留言已标记为已读。' })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '操作失败', message: error.message || '请稍后重试。' })
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`确定删除来自「${name}」的留言吗？`)) return

    try {
      await api.admin.deleteContact(id)
      setNotice({ type: 'success', title: '留言已删除', message: `已移除 ${name} 的留言。` })
      load()
    } catch (error) {
      setNotice({ type: 'error', title: '删除失败', message: error.message || '请稍后重试。' })
    }
  }

  if (loading) {
    return <AdminLoadingBlock label="正在载入留言列表..." />
  }

  return (
    <div className="admin-page">
      <AdminToolbar
        eyebrow="Inbox"
        title="留言管理"
        description="这一页更像收件箱，优先处理未读咨询与报名意向。"
        meta={[
          { label: '全部留言', value: data.length },
          { label: '未读数量', value: unreadCount },
        ]}
        actions={
          <>
            <AdminSearch value={query} onChange={setQuery} placeholder="搜索姓名、邮箱、手机号、留言内容" />
            <button className="button button--ghost" onClick={load}>
              刷新
            </button>
          </>
        }
      />

      <AdminNotice notice={notice} />

      <section className="admin-panel">
        {filtered.length > 0 ? (
          <div className="admin-inbox">
            {filtered.map((item) => (
              <article key={item.id} className={`admin-message ${!item.is_read ? 'unread' : ''}`}>
                <div className="admin-message__avatar">{item.name?.slice(0, 1) || 'M'}</div>
                <div className="admin-message__body">
                  <div className="admin-message__head">
                    <strong>{item.name}</strong>
                    <span>{item.created_at?.slice(0, 16)?.replace('T', ' ') || '刚刚'}</span>
                  </div>
                  <p className="admin-message__meta">
                    {item.email}
                    {item.phone ? ` · ${item.phone}` : ''}
                  </p>
                  <p>{item.message}</p>
                </div>
                <div className="admin-message__actions">
                  {!item.is_read && (
                    <button className="button button--ghost" onClick={() => handleMarkRead(item.id)}>
                      标记已读
                    </button>
                  )}
                  <button className="button button--danger" onClick={() => handleDelete(item.id, item.name)}>
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AdminEmptyState
            title={data.length ? '没有匹配结果' : '暂无留言记录'}
            description={data.length ? '换个关键词试试。' : '新的表单提交会显示在这里。'}
          />
        )}
      </section>
    </div>
  )
}
