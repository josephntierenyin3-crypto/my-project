import { useState } from 'react'
import { register } from './api'
import './Auth.css'

export default function Register({ onSuccess, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const data = await register(email.trim(), password, name.trim())
      if (data.token) {
        const { setToken } = await import('./api')
        setToken(data.token)
      }
      onSuccess(data.user)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <p className="auth-error">{error}</p>}
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Your name"
          />
        </label>
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
          Password (min 6 characters)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </label>
        <button type="submit" className="btn-primary btn-auth" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="auth-link" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </div>
  )
}
