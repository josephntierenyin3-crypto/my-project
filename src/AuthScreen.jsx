import { useState } from 'react'
import Login from './Login'
import Register from './Register'
import './Auth.css'
import ParticleBackground from './components/ParticleBackground'

export default function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState('login')

  function handleAuth(user) {
    onAuth(user)
  }

  return (
    <div className="auth-screen">
      <div className="bg-layer" aria-hidden>
        <ParticleBackground density={55} linkDistance={140} opacity={0.22} />
      </div>
      <div className="auth-panel">
        <div className="auth-wrapper">
          <h1 className="auth-title">Welcome to Executive Planner</h1>
          <p className="auth-subtitle">Please login with your credential</p>
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
