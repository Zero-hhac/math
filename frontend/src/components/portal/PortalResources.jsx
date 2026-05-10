import { useState, useEffect } from 'react'
import { api } from '../../api'

const TYPE_LABELS = { question_bank: '题库', lecture: '讲义', video: '视频', book: '书籍' }
const TYPE_ICONS = { question_bank: '📝', lecture: '📖', video: '🎬', book: '📕' }

export default function PortalResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    api.admin.resources.list()
      .then(data => setResources(Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = resources.filter(r => {
    if (search && !r.title?.includes(search) && !r.description?.includes(search)) return false
    if (filterType && r.resource_type !== filterType) return false
    return true
  })

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>加载中...</p></div>
  }

  return (
    <div>
      <div className="section-heading section-heading--compact">
        <div className="eyebrow">Learning Resources</div>
        <h2>学习资源</h2>
        <p>竞赛题库、讲义资料与视频教程——让每一份学习投入都落在扎实的内容上。</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', minHeight: 44, borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(31,42,68,0.08)', minWidth: 300 }}>
          <span style={{ color: 'var(--text-soft)' }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索资源标题..." style={{ width: '100%', background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', fontSize: '0.9rem' }} />
        </label>
        <div className="tag-ribbon" style={{ marginBottom: 0 }}>
          <span onClick={() => setFilterType('')} style={{ cursor: 'pointer', background: !filterType ? 'rgba(188,108,37,0.16)' : undefined }}>全部</span>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <span key={k} onClick={() => setFilterType(k)} style={{ cursor: 'pointer', background: filterType === k ? 'rgba(188,108,37,0.16)' : undefined }}>{v}</span>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="resource-grid">
          {filtered.map(r => (
            <article key={r.id} className="surface-card resource-card">
              <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{TYPE_ICONS[r.resource_type] || '📌'}</div>
              <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(50,74,116,0.08)', color: 'var(--accent-cool)', fontSize: '0.78rem' }}>{TYPE_LABELS[r.resource_type] || '资料'}</span>
                {r.difficulty > 0 && <span style={{ color: 'var(--text-soft)', fontSize: '0.78rem' }}>{'★'.repeat(r.difficulty)}{'☆'.repeat(5 - r.difficulty)}</span>}
              </div>
              <h3 style={{ fontSize: '0.98rem', marginBottom: 8 }}>{r.title}</h3>
              <p style={{ color: 'var(--text-soft)', fontSize: '0.86rem', lineHeight: 1.5 }}>{r.description || r.content || '暂无描述。'}</p>
              {r.file_url && (
                <a href={r.file_url} className="resource-card__link" target="_blank" rel="noreferrer">查看详情 →</a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state surface-card">
          {search || filterType ? '未找到匹配的学习资源。' : '暂无学习资源，管理员会在后台添加。'}
        </div>
      )}
    </div>
  )
}
