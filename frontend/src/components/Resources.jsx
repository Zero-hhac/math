import { useState, useEffect } from 'react'
import { api } from '../api'

const RESOURCES = [
  {
    title: 'MIT / 3Blue1Brown 课程线',
    category: 'Visual Learning',
    text: '适合在"概念卡住"时换一种理解方式，尤其适合线代与微积分。',
    link: 'https://ocw.mit.edu/',
  },
  {
    title: '竞赛与题库平台',
    category: 'Practice Loop',
    text: '把做题、补题与复盘串起来，形成可持续推进的训练闭环。',
    link: 'https://codeforces.com/',
  },
  {
    title: '问答社区与讨论空间',
    category: 'Community',
    text: '当问题超出课堂语境时，社区能帮助你看到更大的解法视野。',
    link: 'https://math.stackexchange.com/',
  },
]

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileTypeChip(fileType) {
  if (!fileType) return '文档'
  const ext = String(fileType).toLowerCase().replace(/^\./, '')
  const map = { pdf: 'PDF', doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', ppt: 'PPT', pptx: 'PPT', zip: '压缩包', rar: '压缩包', txt: '文本' }
  return map[ext] || ext.toUpperCase()
}

export default function Resources() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPublicDocuments({ page_size: 20 })
      .then(data => {
        const list = Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : [])
        setDocs(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-frame">
      <div className="section-heading">
        <div className="eyebrow">Curated Resources</div>
        <h2>资源不追求多，而追求把人送到下一步。</h2>
        <p>
          比起一口气扔出几十个链接，我们更想提供几条真正能用、能坚持、能形成方法感的资源路线。
        </p>
      </div>

      {docs.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: 20, fontFamily: "'Noto Serif SC', serif" }}>📄 协会文档资料</h3>
          <div className="competition-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {docs.map(doc => (
              <article key={doc.id} className="competition-card">
                <div className="competition-card__top">
                  <span className="competition-card__icon">📄</span>
                  <div>
                    <h3>{doc.title}</h3>
                    <p>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(50,74,116,0.08)', color: 'var(--accent-cool)', fontSize: '0.78rem', marginRight: 8 }}>{fileTypeChip(doc.file_type)}</span>
                      {doc.file_size ? formatFileSize(doc.file_size) : ''}
                    </p>
                  </div>
                </div>
                <p className="competition-card__desc">{doc.description || '暂无描述。'}</p>
                <div className="competition-card__meta">
                  <span>{doc.uploader?.nickname || '协会'}</span>
                  <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('zh-CN') : ''}</span>
                </div>
                {doc.file_path && (
                  <a href={doc.file_path} download className="button button--primary" style={{ marginTop: 14, display: 'inline-flex' }}>下载文件</a>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {!loading && docs.length === 0 && (
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: 40 }}>暂无公开文档，会员登录后可查阅更多内部资料。</p>
      )}

      <h3 style={{ fontSize: '1.1rem', marginBottom: 20, fontFamily: "'Noto Serif SC', serif" }}>🔗 外部学习资源</h3>
      <div className="resource-grid">
        {RESOURCES.map((item) => (
          <a
            key={item.title}
            className="resource-card surface-card"
            href={item.link}
            target="_blank"
            rel="noreferrer"
          >
            <span className="surface-label">{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <span className="resource-card__link">打开资源</span>
          </a>
        ))}
      </div>
    </div>
  )
}