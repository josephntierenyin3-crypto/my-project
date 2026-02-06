import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

const DB_NAME = process.env.DB_NAME || 'goodday_db';

async function run() {
  console.log('Connecting to MySQL...');
  let conn = await mysql.createConnection({ ...config, multipleStatements: true });

  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database "${DB_NAME}" created or already exists.`);
    await conn.query(`USE \`${DB_NAME}\``);

    const sql = readFileSync(join(__dirname, 'database.sql'), 'utf8');
    // Remove comments and split by semicolon, keep only CREATE/INSERT statements
    const statements = sql
      .replace(/--[^\n]*/g, '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && (s.toUpperCase().startsWith('CREATE') || s.toUpperCase().startsWith('INSERT')));

    for (const stmt of statements) {
      if (!stmt) continue;
      try {
        await conn.query(stmt);
        if (stmt.toUpperCase().startsWith('CREATE TABLE')) console.log('  Table created.');
        if (stmt.toUpperCase().startsWith('CREATE INDEX')) console.log('  Index created.');
        if (stmt.toUpperCase().startsWith('INSERT')) console.log('  Admin user inserted.');
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_KEYNAME') {
          console.log('  (already exists, skipped)');
        } else {
          throw e;
        }
      }
    }

    console.log('Setup complete. Database is ready.');
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
