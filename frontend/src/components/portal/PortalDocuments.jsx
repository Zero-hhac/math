import { useState, useEffect } from 'react'
import { api } from '../../api'

export default function PortalDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.admin.documents.list({ page_size: 50 })
      .then(data => setDocs(Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d => !search || d.title?.includes(search) || d.description?.includes(search))

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /><p>加载中...</p></div>
  }

  return (
    <div>
      <div className="section-heading section-heading--compact">
        <div className="eyebrow">Internal Documents</div>
        <h2>内部文档</h2>
        <p>协会内部文件、会议纪要与制度文档——让信息在组织内有序流动。</p>
      </div>

      {/* Search */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', minHeight: 44, borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(31,42,68,0.08)', maxWidth: 400, marginBottom: 28 }}>
        <span style={{ color: 'var(--text-soft)' }}>⌕</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文档标题..." style={{ width: '100%', background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', fontSize: '0.9rem' }} />
      </label>

      {filtered.length > 0 ? (
        <div className="competition-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          {filtered.map(doc => (
            <article key={doc.id} className="competition-card">
              <div className="competition-card__top">
                <span className="competition-card__icon">📄</span>
                <div>
                  <h3>{doc.title}</h3>
                  <p>{doc.file_type || '文档'} {doc.file_size ? `· ${(doc.file_size / 1024).toFixed(0)} KB` : ''}</p>
                </div>
              </div>
              <p className="competition-card__desc">{doc.description || '暂无描述。'}</p>
              <div className="competition-card__meta">
                <span>{doc.uploader?.nickname || '协会'}</span>
                <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('zh-CN') : ''}</span>
              </div>
              {doc.file_path && (
                <a href={doc.file_path} className="button button--primary" download style={{ marginTop: 14, display: 'inline-flex' }}>下载文件</a>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state surface-card">
          {search ? '未找到匹配的文档，换个关键词试试。' : '暂无内部文档，管理员会在后台添加。'}
        </div>
      )}
    </div>
  )
}
