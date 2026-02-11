import mysql from 'mysql2/promise'

const DB_NAME = process.env.DB_NAME || 'plannerdb'

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

const pool = mysql.createPool(poolConfig)

/**
 * Ensure plannerdb exists (create if missing). Call before first query if you get ER_BAD_DB_ERROR.
 */
export async function ensureDatabase() {
  const conn = await mysql.createConnection({
    host: poolConfig.host,
    port: poolConfig.port,
    user: poolConfig.user,
    password: poolConfig.password,
  })
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``)
  } finally {
    await conn.end()
  }
}

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export default pool
