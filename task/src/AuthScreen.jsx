import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import './Auth.css'

export default function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState('login')

  function handleAuth(user) {
    onAuth(user)
  }

  return (
    <div className="auth-screen">
      <div className="auth-panel">
        <div className="auth-hero-bg" aria-hidden>
          <img src="/auth-hero.svg" alt="" className="auth-hero-img" />
          <div className="auth-hero-overlay">
            <h1 className="auth-hero-title">Executive Planner</h1>
            <p className="auth-hero-sub">
              Log in or create an account. Your data is saved in the database and
              in this browser.
            </p>
          </div>
        </div>
        <div className="auth-wrapper">
          <div className="auth-tabs">
            <button
              type="button"
              className={tab === 'login' ? 'active' : ''}
              onClick={() => setTab('login')}
            >
              Log in
            </button>
            <button
              type="button"
              className={tab === 'register' ? 'active' : ''}
              onClick={() => setTab('register')}
            >
              Create account
            </button>
          </div>
          <div className="auth-card-wrap">
            {tab === 'login' ? (
              <Login
                onSuccess={handleAuth}
                onSwitchToRegister={() => setTab('register')}
              />
            ) : (
              <Register
                onSuccess={handleAuth}
                onSwitchToLogin={() => setTab('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
