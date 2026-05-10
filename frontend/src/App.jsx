import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './api/AdminAuth'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Competitions from './components/Competitions'
import Timeline from './components/Timeline'
import Activities from './components/Activities'
import Resources from './components/Resources'
import News from './components/News'
import Contact from './components/Contact'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminCompetitions from './components/admin/AdminCompetitions'
import AdminNews from './components/admin/AdminNews'
import AdminMembers from './components/admin/AdminMembers'
import AdminContacts from './components/admin/AdminContacts'
import AdminDocuments from './components/admin/AdminDocuments'
import AdminUsers from './components/admin/AdminUsers'
import AdminActivities from './components/admin/AdminActivities'
import PortalLayout from './components/portal/PortalLayout'
import { api } from './api'

const SECTION_IDS = ['hero', 'about', 'competitions', 'timeline', 'activities', 'resources', 'news', 'contact']

  function LoadingScreen({ label = '加载中...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>{label}</p>
    </div>
  )
}

function UserApp() {
  const [competitions, setCompetitions] = useState([])
  const [news, setNews] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    Promise.all([api.getCompetitions(), api.getNews(), api.getMembers()])
      .then(([competitionData, newsData, memberData]) => {
        setCompetitions(Array.isArray(competitionData) ? competitionData : [])
        setNews(Array.isArray(newsData?.list) ? newsData.list : (Array.isArray(newsData) ? newsData : []))
        setMembers(Array.isArray(memberData) ? memberData : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const navHeight = 88
        let current = 'hero'
        for (const id of SECTION_IDS) {
          const el = document.getElementById(id)
          if (!el) continue
          const rect = el.getBoundingClientRect()
          if (rect.top <= navHeight + 120) {
            current = id
          }
        }
        setActiveSection(current)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <div className="site-shell">
      <Navbar activeSection={activeSection} scrollTo={scrollTo} />
      <main className="site-main">
        <section id="hero" className="page-section hero-anchor">
          <Hero scrollTo={scrollTo} competitions={competitions} news={news} members={members} />
        </section>
        <section id="about" className="page-section">
          <About members={members} competitions={competitions} news={news} />
        </section>
        <section id="competitions" className="page-section">
          <Competitions competitions={competitions} />
        </section>
        <section id="timeline" className="page-section">
          <Timeline competitions={competitions} />
        </section>
        <section id="activities" className="page-section">
          <Activities />
        </section>
        <section id="resources" className="page-section">
          <Resources />
        </section>
        <section id="news" className="page-section">
          <News news={news} />
        </section>
        <section id="contact" className="page-section page-section-contact">
          <Contact />
        </section>
      </main>
    </div>
  )
}

function AdminRoute({ children }) {
  const { user, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="" />
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (user.role !== 'admin' && user.role !== 'super_admin') return <Navigate to="/portal" replace />

  return children
}

function SuperAdminRoute({ children }) {
  const { user, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="" />
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  if (user.role !== 'super_admin') return <Navigate to="/admin/dashboard" replace />

  return children
}

function PortalRoute({ children }) {
  const { user, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="" />
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />

  return children
}

function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="competitions" element={<AdminCompetitions />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="activities" element={<AdminActivities />} />
        <Route path="members" element={<AdminMembers />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="users" element={<SuperAdminRoute><AdminUsers /></SuperAdminRoute>} />
        <Route path="contacts" element={<AdminContacts />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/" element={<UserApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/portal" element={
            <PortalRoute><PortalLayout /></PortalRoute>
          } />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
