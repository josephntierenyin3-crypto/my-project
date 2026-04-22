import { ensureDatabase, query } from './db.js'

/**
 * Creates database (if missing) and all tables. Run on server start so the app works without phpMyAdmin.
 */
export async function runMigrations() {
  console.log('Ensuring database exists...')
  await ensureDatabase()

  console.log('Creating/updating tables...')
  // Users (login / create account)
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  console.log('  users: OK')

  // Tasks (per user)
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      text VARCHAR(1000) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      due_date DATE NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      reminder_sent TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  console.log('  tasks: OK')

  // Meetings (per user)
  await query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(500) NOT NULL,
      date DATE NOT NULL,
      time VARCHAR(10) NOT NULL,
      duration INT NOT NULL DEFAULT 60,
      location VARCHAR(500) NULL,
      notes TEXT NULL,
      notification_sent TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  console.log('  meetings: OK')

  // Expenses (per user)
  await query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      description VARCHAR(500) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  console.log('  expenses: OK')

  // User settings (budget limit per user)
  await query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INT PRIMARY KEY,
      budget_limit VARCHAR(50) NOT NULL DEFAULT '',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  console.log('  user_settings: OK')

  // System reference: expense categories (used by Budget & Expenses)
  await query(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  await query(`
    INSERT IGNORE INTO expense_categories (name, sort_order) VALUES
    ('Travel', 1),
    ('Meals & Entertainment', 2),
    ('Office Supplies', 3),
    ('Technology', 4),
    ('Consulting', 5),
    ('Marketing', 6),
    ('Other', 7);
  `)
  console.log('  expense_categories: OK (inserted)')

  // System reference: task priorities (used by Tasks)
  await query(`
    CREATE TABLE IF NOT EXISTS task_priorities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      value VARCHAR(20) NOT NULL UNIQUE,
      label VARCHAR(50) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  await query(`
    INSERT IGNORE INTO task_priorities (value, label, sort_order) VALUES
    ('high', 'High', 1),
    ('medium', 'Medium', 2),
    ('low', 'Low', 3);
  `)
  console.log('  task_priorities: OK (inserted)')

  // System metadata (one row to record that DB was set up)
  await query(`
    CREATE TABLE IF NOT EXISTS system_metadata (
      id INT PRIMARY KEY DEFAULT 1,
      schema_version INT NOT NULL DEFAULT 1,
      seeded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  await query(`
    INSERT IGNORE INTO system_metadata (id, schema_version) VALUES (1, 1);
  `)
  console.log('  system_metadata: OK')

  // Verify the users table exists
  const rows = await query(`SHOW TABLES LIKE 'users'`)
  if (!Array.isArray(rows) || rows.length === 0) {
    const err = new Error('users table still missing after migration')
    err.code = 'USERS_TABLE_MISSING'
    throw err
  }
  console.log('All tables created and system data inserted.')
}

