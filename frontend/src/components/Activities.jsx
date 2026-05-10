import { useState, useEffect } from 'react'
import { api } from '../api'

const ACTIVITY_ICONS = ['📅', '🎤', '💬', '📐', '📖', '🏆', '🎯', '📝']

export default function Activities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPublicActivities()
      .then(data => setActivities(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-frame">
        <div className="section-heading">
          <div className="eyebrow">Studio Life</div>
          <h2>活动不只是"办过"，而是有连续性的学习现场。</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="page-frame">
      <div className="section-heading">
        <div className="eyebrow">Studio Life</div>
        <h2>活动不只是"办过"，而是有连续性的学习现场。</h2>
        <p>
          我们刻意把活动设计成不同强度的入口。有人先从讨论班加入，
          有人先因为竞赛训练留下，最后在这里找到适合自己的长期节奏。
        </p>
      </div>

      {activities.length > 0 ? (
        <div className="activity-stage">
          <div className="activity-stage__feature surface-card surface-card--contrast">
            <span className="surface-label">What It Feels Like</span>
            <h3>有点学术，有点热闹，但不会让人觉得自己必须先足够厉害才能出现。</h3>
            <p>
              真正有吸引力的社团现场，应该既有锋利的内容，也有允许人慢慢长出来的耐心。
            </p>
          </div>

          <div className="activity-stage__grid">
            {activities.map((item) => (
              <article key={item.id} className="activity-card surface-card">
                <span className="activity-card__period">{item.icon || '📅'} {item.period || '定期活动'}</span>
                <h3>{item.title}</h3>
                <p>{item.description || '暂无介绍。'}</p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="activity-stage">
          <div className="activity-stage__feature surface-card surface-card--contrast">
            <span className="surface-label">Studio Life</span>
            <h3>活动正在筹备中</h3>
            <p>协会正在规划新的活动安排，敬请期待。</p>
          </div>
        </div>
      )}
    </div>
  )
}