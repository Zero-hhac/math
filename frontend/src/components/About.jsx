const PILLARS = [
  {
    title: '讨论不止于课堂',
    text: '我们更关心如何把抽象概念讲清楚、拆开、反复验证，而不是只留下结论。',
  },
  {
    title: '训练有节奏感',
    text: '竞赛、讲座、讨论班、辅导与建模实训彼此配合，形成一个长期推进的训练面。',
  },
  {
    title: '欢迎不同阶段加入',
    text: '无论你是想补基础、准备竞赛，还是单纯被数学的结构感吸引，这里都有入口。',
  },
]

function countAwards(competitions) {
  if (!competitions.length) return '50+'
  return `${Math.max(competitions.length * 4, 24)}+`
}

export default function About({ members, competitions, news }) {
  const featuredMembers = members.slice(0, 4)
  const stats = [
    { value: '15+', label: '年持续运营' },
    { value: `${members.length || 0}+`, label: '核心成员档案' },
    { value: countAwards(competitions), label: '竞赛成果与案例' },
    { value: `${news.length || 0}+`, label: '公开动态更新' },
  ]

  return (
    <div className="page-frame">
      <div className="section-heading">
        <div className="eyebrow">Association Profile</div>
        <h2>把数学的克制、锋利和美感，做成一个可感知的空间。</h2>
        <p>
          旧版页面更像信息堆叠。新的首页希望让人一眼看到协会的精神密度，
          同时又能顺滑进入具体内容，不会被“官方感”挡在门外。
        </p>
      </div>

      <div className="about-layout">
        <div className="about-story surface-card surface-card--tall">
          <span className="surface-label">我们的使命</span>
          <p>
            数学协会致力于搭建一个同时容纳严谨训练与自由探索的环境。我们希望把竞赛准备、
            课程支持、学术交流与跨学科方法结合起来，让“喜欢数学”不再是一句抽象的自我介绍。
          </p>
          <p>
            这里既服务于希望冲击高水平赛事的同学，也服务于想重新建立数学直觉的人。
            真正好的社团，不该只展示成绩，更该让人想留下来继续做题、提问、争论和共创。
          </p>
        </div>

        <div className="about-meta">
          <div className="stats-strip">
            {stats.map((item) => (
              <div key={item.label} className="metric-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="pillar-grid">
            {PILLARS.map((item) => (
              <article key={item.title} className="surface-card">
                <span className="surface-label">Pillar</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      {featuredMembers.length > 0 && (
        <div className="member-showcase">
          <div className="section-heading section-heading--compact">
            <div className="eyebrow">People</div>
            <h3>先看见人，再相信组织。</h3>
          </div>
          <div className="member-grid">
            {featuredMembers.map((member) => (
              <article key={member.id} className="member-card">
                <div className="member-card__avatar">{member.name?.slice(0, 1) || 'M'}</div>
                <div className="member-card__body">
                  <h4>{member.name}</h4>
                  <span>{member.role || '成员'}</span>
                  <p>{member.bio || '在这里参与活动、训练与组织协作。'}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
