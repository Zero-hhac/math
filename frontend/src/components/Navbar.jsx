import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '协会' },
  { id: 'competitions', label: '竞赛' },
  { id: 'timeline', label: '节奏' },
  { id: 'activities', label: '活动' },
  { id: 'resources', label: '资源' },
  { id: 'news', label: '动态' },
  { id: 'contact', label: '加入' },
]

export default function Navbar({ activeSection, scrollTo }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleJump = (id) => {
    setMenuOpen(false)
    scrollTo(id)
  }

  const goAdmin = () => {
    setMenuOpen(false)
    navigate('/admin/login')
  }

  return (
    <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav__inner">
        <button className="site-nav__brand" onClick={() => handleJump('hero')}>
          <span className="site-nav__brand-mark">∑</span>
          <span>
            <strong>Math Association</strong>
            <em>Proof. Pattern. Possibility.</em>
          </span>
        </button>

        <nav className={`site-nav__menu ${menuOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`site-nav__link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleJump(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button className="site-nav__link" onClick={goAdmin}>
            管理后台
          </button>
        </nav>

        <div className="site-nav__actions">
          <button className="site-nav__cta" onClick={() => handleJump('contact')}>
            申请加入
          </button>
          <button className="site-nav__cta" onClick={goAdmin} style={{ marginLeft: 8 }}>
            管理
          </button>
          <button
            className={`site-nav__toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="切换导航"
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
