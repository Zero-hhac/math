import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../api/AdminAuth'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await login(username, password)
      const role = userData.user?.role
      if (role === 'admin' || role === 'super_admin') {
        navigate(from, { replace: true })
      } else {
        navigate('/portal', { replace: true })
      }
    } catch (err) {
      setError(err.message || '登录失败，请检查用户名和密码。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__hero">
        <div className="eyebrow">Admin Access</div>
        <h1>进入协会管理后台</h1>
        <p>新的前端已经换了气质，后台也应该同样克制、清晰、顺手。</p>
      </div>

      <form className="admin-login__card" onSubmit={handleSubmit}>
        <div className="admin-login__brand">
          <span>∑</span>
          <div>
            <strong>Math Association</strong>
            <p>Content Control</p>
          </div>
        </div>

        <label>
          用户名
          <input value={username} onChange={(event) => setUsername(event.target.value)} required autoFocus />
        </label>

        <label>
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {error && <div className="form-feedback error">{error}</div>}

        <button className="button button--primary button--full" type="submit" disabled={loading}>
          {loading ? '登录中...' : '进入后台'}
        </button>
      </form>
    </div>
  )
}
