import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import dataRoutes from './routes/data.js'
import { query } from './db.js'
import { runMigrations } from './migrate.js'

const app = express()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api', dataRoutes)

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/health/db', async (req, res) => {
  try {
    await query('SELECT 1')
    const t = await query(`SHOW TABLES LIKE 'users'`)
    res.json({ ok: true, db: true, usersTable: Array.isArray(t) && t.length > 0 })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, db: false, code: err?.code || 'UNKNOWN' })
  }
})

// List all tables and row counts so you can see what's in the database
app.get('/api/health/tables', async (req, res) => {
  try {
    const tables = await query(`SHOW TABLES`)
    const dbName = process.env.DB_NAME || 'plannerdb'
    const tableNames = tables.map((r) => Object.values(r)[0])
    const counts = {}
    for (const name of tableNames) {
      const rows = await query(`SELECT COUNT(*) as c FROM \`${name}\``)
      counts[name] = rows[0]?.c ?? 0
    }
    res.json({
      database: dbName,
      tables: tableNames,
      rowCounts: counts,
      message: `View these tables in phpMyAdmin: select database "${dbName}" in the left sidebar, then click each table and "Browse".`,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: err?.message, code: err?.code })
  }
})

runMigrations()
  .then(() => {
    const dbName = process.env.DB_NAME || 'plannerdb'
    console.log('Database migrations: OK')
    console.log(`Database: ${dbName} (view tables in phpMyAdmin or open http://localhost:${PORT}/api/health/tables)`)
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Database migrations failed:', err?.code || err)
    process.exit(1)
  })
