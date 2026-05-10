import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../api/AdminAuth'
import { api } from '../../api'

const TYPE_LABELS = { question_bank: '题库', lecture: '讲义', video: '视频', book: '书籍' }
const TYPE_ICONS = { question_bank: '📝', lecture: '📖', video: '🎬', book: '📕' }

const PERKS = [
  { icon: '🎓', title: '学术支持', desc: '数学讨论班、专题报告、一对一导师指导——让学习不孤单。' },
  { icon: '🏅', title: '竞赛训练', desc: '系统化的竞赛培训，从入门到进阶，助力每一位参赛者。' },
  { icon: '📚', title: '资源共享', desc: '题库、讲义、视频教程——协会沉淀的每一份资料都向你开放。' },
]

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileTypeChip(fileType) {
  if (!fileType) return '文档'
  const ext = String(fileType).toLowerCase().replace(/^\./, '')
  return ext.length <= 5 ? ext.toUpperCase() : '文档'
}

export default function PortalLayout() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [docs, setDocs] = useState([])
  const [resources, setResources] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    Promise.all([
      api.admin.documents.list({ page_size: 100 }).catch(() => ({ list: [] })),
      api.admin.resources.list({ page_size: 100 }).catch(() => ({ list: [] })),
      api.admin.members.list().catch(() => []),
    ]).then(([d, r, m]) => {
      const docsList = Array.isArray(d?.list) ? d.list : (Array.isArray(d) ? d : [])
      const resList = Array.isArray(r?.list) ? r.list : (Array.isArray(r) ? r : [])
      const memList = Array.isArray(m?.list) ? m.list : (Array.isArray(m) ? m : [])
      setDocs(docsList.filter(x => x.is_published !== false))
      setResources(resList.filter(x => x.is_published !== false))
      setMembers(memList)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const ids = ['dashboard', 'documents', 'resources', 'directory', 'promo']
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [loading])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const displayName = user?.nickname || user?.username || '同学'

  const NAV = [
    { id: 'dashboard', label: '总览' },
    { id: 'documents', label: '文档' },
    { id: 'resources', label: '资源' },
    { id: 'directory', label: '通讯录' },
    { id: 'promo', label: '加入我们' },
  ]

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /><p>加载中...</p></div>

  return (
    <div className="site-shell">
      <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="site-nav__inner">
          <Link to="/" className="site-nav__brand">
            <span className="site-nav__brand-mark">∑</span>
            <span><strong>Math Association</strong><em>{displayName} · 会员中心</em></span>
          </Link>
          <nav className="site-nav__menu" style={{ display: 'flex', gap: 8 }}>
            {NAV.map(item => (
              <button key={item.id} className={`site-nav__link ${activeSection === item.id ? 'active' : ''}`} onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="site-nav__actions">
            <Link to="/" className="site-nav__cta">返回首页</Link>
            <button className="site-nav__cta" onClick={handleLogout}>退出</button>
          </div>
        </div>
      </header>

      <main className="site-main">
        {/* Section 1: Hero Dashboard */}
        <section id="dashboard" className="page-section hero-anchor">
          <div className="page-frame">
            <div className="portal-hero">
              <div className="portal-hero__inner">
                <div className="portal-hero__copy">
                  <span className="portal-hero__badge">{isAdmin ? '管理员' : '会员'} · 已登录</span>
                  <h2>欢迎回来，<em>{displayName}</em></h2>
                  <p>这里是数学协会会员中心。在这里你可以查阅协会内部文档、浏览学习资源、了解成员动向——我们希望它不只是一个「内部页面」，而是像一本打开的笔记本，让你随时感受到协会正在发生的事。</p>
                </div>
                <div className="portal-stats">
                  <div className="portal-stat">
                    <div className="portal-stat__icon">📂</div>
                    <span className="portal-stat__value">{docs.length}</span>
                    <span className="portal-stat__label"><strong>内部文档</strong>份可查阅文件</span>
                  </div>
                  <div className="portal-stat">
                    <div className="portal-stat__icon">📚</div>
                    <span className="portal-stat__value">{resources.length}</span>
                    <span className="portal-stat__label"><strong>学习资源</strong>题库 · 讲义 · 视频</span>
                  </div>
                  <div className="portal-stat">
                    <div className="portal-stat__icon">👥</div>
                    <span className="portal-stat__value">{members.length}</span>
                    <span className="portal-stat__label"><strong>协会成员</strong>位同仁</span>
                  </div>
                  <div className="portal-stat">
                    <div className="portal-stat__icon">{isAdmin ? '🛡️' : '🎓'}</div>
                    <span className="portal-stat__value" style={{ fontSize: '1.2rem', marginTop: 6 }}>
                      {isAdmin ? '管理员' : '会员'}
                    </span>
                    <span className="portal-stat__label"><strong>当前角色</strong>{user?.username}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Documents */}
        <section id="documents" className="page-section">
          <div className="page-frame">
            <div className="section-heading">
              <div className="eyebrow">Internal Documents</div>
              <h2>内部文档</h2>
              <p>协会章程、会议纪要、年度报告——让信息在组织内有结构地流动。</p>
            </div>
            {docs.length > 0 ? (
              <div className="portal-doc-grid">
                {docs.map(doc => (
                  <article key={doc.id} className="portal-doc-card">
                    <div className="portal-doc-card__head">
                      <div className="portal-doc-card__icon">📄</div>
                      <div className="portal-doc-card__title">
                        <h3>{doc.title}</h3>
                        <div className="portal-doc-card__meta">
                          <span className="portal-doc-card__chip">{fileTypeChip(doc.file_type)}</span>
                          {doc.file_size ? <span>{formatFileSize(doc.file_size)}</span> : null}
                        </div>
                      </div>
                    </div>
                    {doc.description && <p className="portal-doc-card__desc">{doc.description}</p>}
                    <div className="portal-doc-card__footer">
                      <span>{doc.created_at ? new Date(doc.created_at).toLocaleDateString('zh-CN') : '未知日期'}</span>
                      {doc.file_path && (
                        <a href={doc.file_path} className="portal-doc-card__link" download rel="noreferrer">
                          下载文件 <span aria-hidden>→</span>
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <div className="portal-empty__icon">📭</div>
                <p>暂无内部文档，等管理员上传后会显示在这里。</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Resources */}
        <section id="resources" className="page-section">
          <div className="page-frame">
            <div className="section-heading">
              <div className="eyebrow">Learning Resources</div>
              <h2>学习资源</h2>
              <p>竞赛题库、讲义资料与视频教程——让每一次学习都落在扎实的内容上。</p>
            </div>
            {resources.length > 0 ? (
              <div className="portal-resource-grid">
                {resources.map(r => (
                  <article key={r.id} className="portal-resource-card">
                    <div className="portal-resource-card__head">
                      <span className="portal-resource-card__type" data-type={r.resource_type}>
                        {TYPE_ICONS[r.resource_type] || '📌'} {TYPE_LABELS[r.resource_type] || '资料'}
                      </span>
                      {r.difficulty > 0 && (
                        <span className="portal-resource-card__stars">
                          {'★'.repeat(r.difficulty)}{'☆'.repeat(5 - r.difficulty)}
                        </span>
                      )}
                    </div>
                    <h3>{r.title}</h3>
                    <p>{r.description || '暂无描述。'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <div className="portal-empty__icon">📚</div>
                <p>资源库正在建设中，敬请期待。</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 4: Member Directory */}
        <section id="directory" className="page-section">
          <div className="page-frame">
            <div className="section-heading">
              <div className="eyebrow">Member Directory</div>
              <h2>成员通讯录</h2>
              <p>让志同道合的人更容易找到彼此——协作、交流、共同成长。</p>
            </div>
            {members.length > 0 ? (
              <div className="portal-member-grid">
                {members.map(item => (
                  <article key={item.id} className="portal-member-card">
                    <div className="portal-member-card__avatar">
                      {(item.user?.nickname || 'M').slice(0, 1)}
                    </div>
                    <div className="portal-member-card__body">
                      <h4>
                        {item.user?.nickname || '成员'}
                        {item.grade && <span className="portal-member-card__grade">{item.grade}</span>}
                      </h4>
                      {item.department && (
                        <div className="portal-member-card__dept">{item.department}</div>
                      )}
                      {item.achievement && (
                        <p className="portal-member-card__achievement">🏆 {item.achievement}</p>
                      )}
                      {item.skills && (
                        <div className="portal-member-card__skills">
                          {item.skills.split(',').slice(0, 4).map(s => (
                            <span key={s}>{s.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <div className="portal-empty__icon">👥</div>
                <p>暂无成员信息。</p>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Promotional / CTA */}
        <section id="promo" className="page-section" style={{ paddingBottom: 140 }}>
          <div className="page-frame">
            <div className="portal-cta">
              <div className="portal-cta__inner">
                <span className="portal-cta__eyebrow">Why Math Matters</span>
                <h2>数学不只是一种技能，<br />它是一套理解世界的语言。</h2>
                <p>
                  我们在这里聚集，不是为了把数学做成冷冰冰的题库，而是为了在竞赛、讨论、建模和长期训练中，
                  找到一种看待复杂问题的清晰视角。协会提供的不仅是资源，更是一个愿意和你一起思考的社群。
                </p>
                <div className="portal-cta__actions">
                  <Link to="/" className="button button--primary">返回首页</Link>
                  {isAdmin && <Link to="/admin" className="button button--ghost">进入管理后台</Link>}
                </div>
              </div>
            </div>

            <div className="portal-perks">
              {PERKS.map(p => (
                <div key={p.title} className="portal-perk">
                  <div className="portal-perk__icon">{p.icon}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
