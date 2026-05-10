import { useMemo, useState } from 'react'

function parseTags(tags) {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function difficultyLabel(level = 0) {
  return '★'.repeat(level) + '☆'.repeat(Math.max(0, 5 - level))
}

export default function Competitions({ competitions }) {
  const [selected, setSelected] = useState(null)

  const categories = useMemo(() => {
    const all = competitions.map((item) => item.category).filter(Boolean)
    return [...new Set(all)].slice(0, 4)
  }, [competitions])

  return (
    <div className="page-frame">
      <div className="section-heading">
        <div className="eyebrow">Competition Atlas</div>
        <h2>竞赛不该是一张生硬表格，而该是一张可探索的地图。</h2>
        <p>
          我们把每项赛事拆解为时间、强度、参赛对象和备赛提示，
          让初学者也能快速判断什么适合自己，老成员也能更方便对照规划。
        </p>
      </div>

      {categories.length > 0 && (
        <div className="tag-ribbon">
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      )}

      <div className="competition-grid">
        {competitions.map((competition) => {
          const tags = parseTags(competition.tags)
          return (
            <article
              key={competition.id}
              className="competition-card"
              onClick={() => setSelected(competition)}
            >
              <div className="competition-card__top">
                <span className="competition-card__icon">{competition.icon || '∫'}</span>
                <div>
                  <h3>{competition.name}</h3>
                  <p>{competition.short_name || competition.category || '数学竞赛'}</p>
                </div>
              </div>

              <div className="competition-card__meta">
                <span>{competition.time || '时间待更新'}</span>
                <span>{difficultyLabel(competition.difficulty)}</span>
              </div>

              <p className="competition-card__desc">
                {competition.description?.split('\n')[0] || '点击查看完整介绍、奖项设置与备赛建议。'}
              </p>

              <div className="competition-card__tags">
                {tags.length > 0 ? tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>) : <span>查看详情</span>}
              </div>
            </article>
          )
        })}
      </div>

      {selected && (
        <div className="dialog-backdrop" onClick={() => setSelected(null)}>
          <div className="dialog-card" onClick={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setSelected(null)}>
              关闭
            </button>

            <div className="dialog-header">
              <span className="dialog-header__icon">{selected.icon || '∑'}</span>
              <div>
                <div className="eyebrow">Competition Detail</div>
                <h3>{selected.name}</h3>
                <p>{selected.short_name || selected.category || '赛事详情'}</p>
              </div>
            </div>

            <div className="dialog-grid">
              <div className="dialog-section">
                <h4>比赛简介</h4>
                <p>{selected.description || '暂无详细介绍。'}</p>
              </div>
              <div className="dialog-section">
                <h4>关键信息</h4>
                <div className="info-list">
                  <div><span>主办方</span><strong>{selected.organizer || '待补充'}</strong></div>
                  <div><span>比赛时间</span><strong>{selected.time || '待补充'}</strong></div>
                  <div><span>比赛频次</span><strong>{selected.frequency || '待补充'}</strong></div>
                  <div><span>参赛对象</span><strong>{selected.participants || '待补充'}</strong></div>
                  <div><span>比赛形式</span><strong>{selected.format || '待补充'}</strong></div>
                  <div><span>难度级别</span><strong>{difficultyLabel(selected.difficulty)}</strong></div>
                </div>
              </div>
              <div className="dialog-section">
                <h4>奖项设置</h4>
                <p>{selected.prize || '暂无奖项说明。'}</p>
              </div>
              <div className="dialog-section">
                <h4>备赛建议</h4>
                <p>{selected.prep_tips || '建议结合协会讲座、题目训练与历年题复盘同步准备。'}</p>
              </div>
            </div>

            {selected.website && (
              <a className="button button--primary dialog-link" href={selected.website} target="_blank" rel="noreferrer">
                打开官网
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
