function Stat({ value, label }) {
  return (
    <div className="hero-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function Hero({ scrollTo, competitions, news, members }) {
  const highlights = [
    { label: '竞赛数据库', value: `${competitions.length || 0}+` },
    { label: '协会成员', value: `${members.length || 0}+` },
    { label: '近期动态', value: `${news.length || 0}+` },
  ]

  const featuredCompetitions = competitions.slice(0, 3)

  return (
    <div className="hero">
      <div className="hero-orb hero-orb--amber" />
      <div className="hero-orb hero-orb--blue" />
      <div className="hero-grid page-frame">
        <div className="hero-copy">
          <div className="eyebrow">数学协会 · 学术共同体 / since 2010</div>
          <h1>
            把抽象的公式，
            <br />
            变成有现场感的成长路径。
          </h1>
          <p className="hero-lead">
            这是一个围绕竞赛、讨论、建模与长期训练建立起来的数学社群。
            我们不把数学做成冷冰冰的信息墙，而是把它呈现成一条值得投入的路径。
          </p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={() => scrollTo('competitions')}>
              浏览竞赛地图
            </button>
            <button className="button button--ghost" onClick={() => scrollTo('about')}>
              认识协会气质
            </button>
          </div>
          <div className="hero-stats">
            {highlights.map((item) => (
              <Stat key={item.label} value={item.value} label={item.label} />
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel__card hero-panel__card--large">
            <div className="hero-panel__label">协会定位</div>
            <h3>不是“通知栏”，而是一个会激发人行动的数学品牌首页。</h3>
            <p>
              在同一个空间里看见竞赛节奏、学习资源、成员画像与真实活动，
              才能让新同学知道这里不是静态资料库，而是一个正在发生的群体。
            </p>
          </div>

          <div className="hero-panel__row">
            <div className="hero-panel__card">
              <div className="hero-panel__label">训练关键词</div>
              <ul className="hero-list">
                <li>竞赛准备</li>
                <li>讲座与讨论班</li>
                <li>建模实训</li>
              </ul>
            </div>

            <div className="hero-panel__card">
              <div className="hero-panel__label">当前关注</div>
              <div className="signal-stack">
                {featuredCompetitions.length > 0 ? (
                  featuredCompetitions.map((item) => (
                    <div key={item.id} className="signal-item">
                      <span>{item.icon || '△'}</span>
                      <div>
                        <strong>{item.short_name || item.name}</strong>
                        <p>{item.time || '全年持续关注'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="signal-item signal-item--empty">
                    <div>
                      <strong>等待数据接入</strong>
                      <p>竞赛内容加载后会在这里显示。</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
