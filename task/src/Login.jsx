import { useState } from 'react'
import { login } from './api'
import './Auth.css'

export default function Login({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email.trim(), password)
      if (data.token) {
        const { setToken } = await import('./api')
        setToken(data.token)
      }
      onSuccess(data.user)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="auth-error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className="btn-primary btn-auth" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="auth-switch">
        Don’t have an account?{' '}
        <button type="button" className="auth-link" onClick={onSwitchToRegister}>
          Create account
        </button>
      </p>
    </div>
  )
}
