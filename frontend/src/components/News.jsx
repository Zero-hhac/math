function formatDate(dateStr) {
  if (!dateStr) return '日期待更新'
  try { return new Date(dateStr).toLocaleDateString('zh-CN') } catch { return dateStr }
}

export default function News({ news }) {
  const [featured, ...rest] = news

  return (
    <div className="page-frame">
      <div className="section-heading">
        <div className="eyebrow">Latest Notes</div>
        <h2>动态区也应该有编辑感，而不只是公告列表。</h2>
        <p>
          有内容、有节奏、有摘要，页面的可信度和氛围就会完全不同。
          这里保留了信息更新能力，但呈现方式更像一份正在编辑中的刊物。
        </p>
      </div>

      {featured ? (
        <div className="news-layout">
          <article className="news-feature surface-card surface-card--contrast">
            <span className="surface-label">Featured Update</span>
            <div className="news-feature__date">{formatDate(featured.created_at)}</div>
            <h3>{featured.title}</h3>
            <p>{featured.summary || featured.content || '暂无摘要。'}</p>
          </article>

          <div className="news-list">
            {rest.length > 0 ? (
              rest.map((item) => (
                <article key={item.id} className="news-item surface-card">
                  <div className="news-item__date">{formatDate(item.created_at)}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.summary || item.content || '暂无摘要。'}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state surface-card">当前只有一条动态，更多更新会显示在这里。</div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state surface-card">暂无新闻数据。</div>
      )}
    </div>
  )
}
