import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change-me'

function explainDbError(err, fallback) {
  // Common MySQL errors (so the UI shows a useful message)
  const code = err?.code
  if (code === 'ER_BAD_DB_ERROR') return 'Database not found. Create/Select plannerdb in phpMyAdmin and run database/schema.sql.'
  if (code === 'ER_NO_SUCH_TABLE') return 'Table missing. Run database/schema.sql in phpMyAdmin to create the users table.'
  if (code === 'ER_ACCESS_DENIED_ERROR') return 'MySQL access denied. Check DB_USER / DB_PASSWORD in .env.'
  if (code === 'ECONNREFUSED') return 'Cannot connect to MySQL. Make sure MySQL is running (XAMPP/WAMP) and DB_HOST/DB_PORT are correct.'
  if (code === 'ETIMEDOUT') return 'MySQL connection timed out. Check DB_HOST/DB_PORT/firewall.'
  return fallback
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' })
    }
    const trimmedEmail = String(email).trim().toLowerCase()
    const trimmedName = String(name).trim()
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const password_hash = await bcrypt.hash(password, 10)
    await query(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [trimmedEmail, password_hash, trimmedName]
    )
    const users = await query('SELECT id, email, name, created_at FROM users WHERE email = ?', [trimmedEmail])
    const user = users[0]
    if (!user) {
      return res.status(500).json({ error: 'Registration failed (user not found after insert)' })
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, token })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already registered' })
    }
    console.error(err)
    res.status(500).json({ error: explainDbError(err, 'Registration failed') })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const trimmedEmail = String(email).trim().toLowerCase()
    const users = await query('SELECT id, email, name, password_hash FROM users WHERE email = ?', [trimmedEmail])
    const user = users[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: explainDbError(err, 'Login failed') })
  }
})

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.userId
    next()
  } catch (_) {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await query('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.userId])
    const user = users[0]
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export { authMiddleware }
export default router
