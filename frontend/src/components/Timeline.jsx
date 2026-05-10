function getMonthNumber(time = '') {
  const match = time.match(/(\d{1,2})月/)
  return match ? Number(match[1]) : null
}

function getSeason(month) {
  if (!month) return '待定'
  if (month <= 3) return '春季'
  if (month <= 6) return '初夏'
  if (month <= 9) return '盛夏'
  return '秋冬'
}

export default function Timeline({ competitions }) {
  const mapped = competitions
    .map((item) => ({ ...item, month: getMonthNumber(item.time) }))
    .sort((a, b) => (a.month || 99) - (b.month || 99))

  const groups = mapped.reduce((acc, item) => {
    const season = getSeason(item.month)
    acc[season] = acc[season] || []
    acc[season].push(item)
    return acc
  }, {})

  const orderedSeasons = ['春季', '初夏', '盛夏', '秋冬', '待定'].filter((season) => groups[season]?.length)

  return (
    <div className="page-frame">
      <div className="section-heading">
        <div className="eyebrow">Annual Rhythm</div>
        <h2>把全年训练节奏排开，你会更知道什么时候该冲、什么时候该蓄力。</h2>
        <p>
          时间线不是为了显得完整，而是帮助成员把不同赛事放进真实学期与假期里，
          让“准备”从一句空话变成可以安排的动作。
        </p>
      </div>

      <div className="timeline-board">
        {orderedSeasons.length > 0 ? (
          orderedSeasons.map((season) => (
            <section key={season} className="timeline-column surface-card">
              <div className="timeline-column__head">
                <span className="eyebrow">{season}</span>
                <h3>{season}赛程</h3>
              </div>
              <div className="timeline-column__list">
                {groups[season].map((item) => (
                  <article key={item.id} className="timeline-event">
                    <div className="timeline-event__month">{item.month ? `${item.month}月` : '待定'}</div>
                    <div className="timeline-event__body">
                      <h4>{item.name}</h4>
                      <p>{item.short_name || item.category || '数学竞赛'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="empty-state surface-card">暂无赛事时间线数据。</div>
        )}
      </div>
    </div>
  )
}
