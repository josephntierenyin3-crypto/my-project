import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'goodday_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helpers to match SQLite-style usage (async)
const db = {
  async get(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  },
  async all(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return Array.isArray(rows) ? rows : [];
  },
  async run(sql, params = []) {
    const [result] = await pool.execute(sql, params);
    return { lastInsertRowid: result.insertId, changes: result.affectedRows };
  },
};

const UTF8MB4 = ' DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

/** Ensure drivers table exists (creates if missing). */
export async function ensureDriversTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      license_no VARCHAR(50),
      phone VARCHAR(30),
      email VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )${UTF8MB4}
  `);
}

/** Ensure buses table exists (creates if missing). */
export async function ensureBusesTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS buses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bus_number VARCHAR(50) NOT NULL UNIQUE,
      plate_no VARCHAR(30),
      capacity INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )${UTF8MB4}
  `);
}

/** Ensure booking_settings table exists and uses utf8mb4 (fixes "Incorrect string value" for symbols like ₵). */
export async function ensureBookingSettingsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS booking_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )${UTF8MB4}
  `);
  await pool.execute(`
    ALTER TABLE booking_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `).catch(() => {});
}

/** Ensure trips table exists (bus + driver + date/time schedule). */
export async function ensureTripsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS trips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bus_id INT NOT NULL,
      driver_id INT NOT NULL,
      scheduled_at DATETIME NOT NULL,
      expected_arrival_at DATETIME NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled',
      max_capacity INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )${UTF8MB4}
  `).catch(() => {});
}

/** Ensure admin_tasks table exists (admin-assigned tasks visible to users). */
export async function ensureAdminTasksTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      due_date DATE NULL,
      assigned_to INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )${UTF8MB4}
  `).catch(() => {});
}

/** Ensure bookings table exists (user submissions visible to admin). */
export async function ensureBookingsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      trip_id INT NULL,
      passenger_name VARCHAR(255) NOT NULL,
      bus_number VARCHAR(50) NOT NULL,
      car_reg VARCHAR(50),
      eta_minutes INT DEFAULT 0,
      passengers INT DEFAULT 0,
      amount DECIMAL(12,2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      task_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )${UTF8MB4}
  `);
  await pool.execute('ALTER TABLE bookings ADD COLUMN trip_id INT NULL').catch(() => {});
  await pool.execute('ALTER TABLE bookings ADD COLUMN destination VARCHAR(255) NULL').catch(() => {});
  await pool.execute('ALTER TABLE bookings ADD COLUMN start_journey VARCHAR(255) NULL').catch(() => {});
}

/** Ensure all optional tables exist and have correct charset. */
export async function ensureAllTables() {
  await ensureDriversTable();
  await ensureBusesTable();
  await ensureBookingSettingsTable();
  await ensureBookingsTable();
  await ensureTripsTable();
  await ensureAdminTasksTable();
}

export default db;
