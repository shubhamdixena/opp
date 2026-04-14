import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Hexagon } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('admin-logged-in', 'true')
    navigate('/admin/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f4f3f0 0%, #fafaf8 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 24px 60px rgba(0,0,0,.08)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--terra)',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Hexagon style={{ width: '24px', height: '24px', fill: 'white', stroke: 'white' }} />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '8px',
            letterSpacing: '-.4px'
          }}>
            Opportunity For You Admin
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text4)' }}>
            Sign in to manage opportunities
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text2)',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--border2)',
                borderRadius: 'var(--r)',
                fontSize: '14px',
                fontFamily: 'var(--sans)',
                color: 'var(--text)',
                transition: 'border-color .15s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--terra)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text2)',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid var(--border2)',
                borderRadius: 'var(--r)',
                fontSize: '14px',
                fontFamily: 'var(--sans)',
                color: 'var(--text)',
                transition: 'border-color .15s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--terra)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border2)'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: '14px'
            }}
          >
            Sign In
          </button>

          <p style={{
            fontSize: '12px',
            color: 'var(--text4)',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            Demo credentials: any email/password works
          </p>
        </form>
      </div>
    </div>
  )
}
