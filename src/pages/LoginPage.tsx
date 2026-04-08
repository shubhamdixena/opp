import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Hexagon } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px', textDecoration: 'none' }}>
          <div className="nav-logomark">
            <Hexagon style={{ width: '14px', height: '14px', fill: 'white', stroke: 'white' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.3px' }}>
            Meridi<span style={{ color: 'var(--terra)' }}>an</span>
          </span>
        </Link>

        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', letterSpacing: '-.4px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '28px' }}>
            Log in to access your saved opportunities
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: 'var(--red-bg)',
                border: '1px solid var(--red)',
                borderRadius: 'var(--r)',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--red)',
                lineHeight: 1.5
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text2)',
                  marginBottom: '6px'
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '14px',
                  color: 'var(--text)',
                  background: 'var(--warm-white)',
                  border: '1.5px solid var(--border2)',
                  borderRadius: 'var(--r)',
                  outline: 'none',
                  fontFamily: 'var(--sans)',
                  transition: 'border-color .15s, box-shadow .15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--terra)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(158, 90, 71, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text2)',
                  marginBottom: '6px'
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: '14px',
                  color: 'var(--text)',
                  background: 'var(--warm-white)',
                  border: '1.5px solid var(--border2)',
                  borderRadius: 'var(--r)',
                  outline: 'none',
                  fontFamily: 'var(--sans)',
                  transition: 'border-color .15s, box-shadow .15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--terra)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(158, 90, 71, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border2)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--text3)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--terra)', fontWeight: 600, textDecoration: 'none' }}>
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
