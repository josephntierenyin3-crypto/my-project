import express from 'express';
import cors from 'cors';
import db, { ensureAllTables } from './db-mysql.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure drivers, buses, booking_settings exist and use utf8mb4 on startup
ensureAllTables().catch((e) => console.warn('ensureAllTables:', e.message));

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// ----- Auth -----
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password required' });
    }
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    const user = await db.get('SELECT id, username, email, role FROM users WHERE id = ?', [result.lastInsertRowid]);
    res.json({ success: true, user: { ...user, name: user.username } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await db.get('SELECT id, username, email, password, role FROM users WHERE email = ?', [email]);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (role && user.role !== role) {
      return res.status(401).json({ error: `Account is registered as ${user.role}. Select correct role.` });
    }
    res.json({
      success: true,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.username },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Workspaces -----
app.get('/api/workspaces', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const rows = await db.all('SELECT * FROM workspaces WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/workspaces', async (req, res) => {
  try {
    const { userId, name, description } = req.body;
    if (!userId || !name) return res.status(400).json({ error: 'userId and name required' });
    const result = await db.run('INSERT INTO workspaces (user_id, name, description) VALUES (?, ?, ?)', [userId, name, description || '']);
    const row = await db.get('SELECT * FROM workspaces WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/workspaces/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.run('UPDATE workspaces SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?', [name, description, req.params.id]);
    const row = await db.get('SELECT * FROM workspaces WHERE id = ?', [req.params.id]);
    res.json(row || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/workspaces/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE workspace_id = ?)', [req.params.id]);
    await db.run('DELETE FROM projects WHERE workspace_id = ?', [req.params.id]);
    await db.run('DELETE FROM workspaces WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Projects -----
app.get('/api/projects', async (req, res) => {
  try {
    const workspaceId = req.query.workspaceId;
    if (!workspaceId) return res.status(400).json({ error: 'workspaceId required' });
    const rows = await db.all('SELECT * FROM projects WHERE workspace_id = ? ORDER BY created_at DESC', [workspaceId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { workspaceId, name, description } = req.body;
    if (!workspaceId || !name) return res.status(400).json({ error: 'workspaceId and name required' });
    const result = await db.run('INSERT INTO projects (workspace_id, name, description) VALUES (?, ?, ?)', [workspaceId, name, description || '']);
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/projects/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.run('UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?', [name, description, req.params.id]);
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json(row || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM tasks WHERE project_id = ?', [req.params.id]);
    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Tasks -----
app.get('/api/tasks', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    const workspaceId = req.query.workspaceId;
    const userId = req.query.userId;
    if (projectId) {
      const rows = await db.all('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
      return res.json(rows);
    }
    if (workspaceId) {
      const rows = await db.all(
        'SELECT t.* FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.workspace_id = ? ORDER BY t.created_at DESC',
        [workspaceId]
      );
      return res.json(rows);
    }
    if (userId) {
      const rows = await db.all('SELECT * FROM tasks WHERE assignee_id = ? ORDER BY created_at DESC', [userId]);
      return res.json(rows);
    }
    return res.status(400).json({ error: 'projectId, workspaceId, or userId required' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { projectId, title, description, status, priority, due_date, assignee_id } = req.body;
    if (!projectId || !title) return res.status(400).json({ error: 'projectId and title required' });
    const result = await db.run(
      'INSERT INTO tasks (project_id, title, description, status, priority, due_date, assignee_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [projectId, title, description || '', status || 'todo', priority || 'medium', due_date || null, assignee_id || null]
    );
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { title, description, status, priority, due_date, assignee_id } = req.body;
    await db.run(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = ?,
        assignee_id = ?
      WHERE id = ?`,
      [title, description, status, priority, due_date ?? null, assignee_id ?? null, req.params.id]
    );
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(row || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Public (for user dashboard: drivers, buses, booking settings) -----
app.get('/api/drivers', async (req, res) => {
  try {
    const rows = await db.all('SELECT id, name, license_no, phone, email, status FROM drivers ORDER BY name').catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/buses', async (req, res) => {
  try {
    const rows = await db.all('SELECT id, bus_number, plate_no, capacity, status FROM buses ORDER BY bus_number').catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/booking-settings', async (req, res) => {
  try {
    const rows = await db.all('SELECT setting_key, setting_value FROM booking_settings').catch(() => []);
    const obj = (rows || []).reduce((acc, r) => ({ ...acc, [r.setting_key]: r.setting_value }), {});
    res.json(obj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Trips (bus + driver + date/time; stop booking when reached) -----
app.get('/api/trips', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT t.*, b.bus_number, b.plate_no, b.capacity as bus_capacity,
             d.name as driver_name, d.phone as driver_phone,
             (SELECT COUNT(*) FROM bookings bk WHERE bk.trip_id = t.id) as booking_count
      FROM trips t
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      ORDER BY t.scheduled_at DESC
    `).catch(() => []);
    const withCapacity = (rows || []).map(r => {
      const cap = Number(r.max_capacity || r.bus_capacity || 0) || 30;
      const count = Number(r.booking_count || 0);
      return {
        ...r,
        max_capacity: cap,
        booking_count: count,
        available_seats: Math.max(0, cap - count),
      };
    });
    res.json(withCapacity);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const { bus_id, driver_id, scheduled_at, expected_arrival_at, max_capacity } = req.body;
    if (!bus_id || !driver_id || !scheduled_at || !expected_arrival_at) {
      return res.status(400).json({ error: 'bus_id, driver_id, scheduled_at, expected_arrival_at required' });
    }
    const bus = await db.get('SELECT capacity FROM buses WHERE id = ?', [bus_id]);
    const cap = max_capacity != null ? Number(max_capacity) : (Number(bus?.capacity) > 0 ? bus.capacity : 30);
    const result = await db.run(
      `INSERT INTO trips (bus_id, driver_id, scheduled_at, expected_arrival_at, status, max_capacity)
       VALUES (?, ?, ?, ?, 'scheduled', ?)`,
      [bus_id, driver_id, scheduled_at, expected_arrival_at, cap]
    ).catch((e) => { throw e; });
    const row = await db.get(`
      SELECT t.*, b.bus_number, d.name as driver_name
      FROM trips t
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = ?
    `, [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/trips/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });
    await db.run('UPDATE trips SET status = ? WHERE id = ?', [status, req.params.id]);
    const row = await db.get(`
      SELECT t.*, b.bus_number, d.name as driver_name
      FROM trips t
      LEFT JOIN buses b ON t.bus_id = b.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = ?
    `, [req.params.id]);
    res.json(row || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Admin tasks (admin creates; user sees and updates status) -----
app.get('/api/admin-tasks', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT at.*, u.username as assigned_name
      FROM admin_tasks at
      LEFT JOIN users u ON at.assigned_to = u.id
      ORDER BY at.created_at DESC
    `).catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin-tasks/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });
    await db.run('UPDATE admin_tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    const row = await db.get('SELECT * FROM admin_tasks WHERE id = ?', [req.params.id]);
    res.json(row || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Bookings (user create + list; shared with admin) -----
app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, tripId, passengerName, busNumber, carReg, etaMinutes, passengers, amount, taskId, destination, start_journey } = req.body;
    if (!userId || !passengerName || !busNumber) {
      return res.status(400).json({ error: 'userId, passengerName, and busNumber required' });
    }
    if (tripId) {
      const trip = await db.get('SELECT status, max_capacity FROM trips WHERE id = ?', [tripId]);
      if (!trip) return res.status(400).json({ error: 'Trip not found' });
      if (trip.status === 'reached' || trip.status === 'completed') {
        return res.status(400).json({ error: 'This trip has reached. No more bookings accepted.' });
      }
      const count = await db.get('SELECT COUNT(*) as c FROM bookings WHERE trip_id = ?', [tripId]);
      const cap = Number(trip.max_capacity || 0);
      if (cap > 0 && (count?.c || 0) >= cap) {
        return res.status(400).json({ error: 'Trip is at capacity.' });
      }
    }
    const result = await db.run(
      `INSERT INTO bookings (user_id, trip_id, passenger_name, bus_number, car_reg, eta_minutes, passengers, amount, status, task_id, destination, start_journey)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [userId, tripId || null, passengerName, busNumber, carReg || '', Number(etaMinutes) || 0, Number(passengers) || 0, Number(amount) || 0, taskId || null, destination || null, start_journey || null]
    ).catch((e) => { throw e; });
    if (taskId) {
      await db.run('UPDATE tasks SET status = ? WHERE id = ?', ['done', taskId]).catch(() => {});
    }
    const row = await db.get('SELECT * FROM bookings WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const rows = await db.all(
      'SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    ).catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Admin (overview & lists) -----
app.get('/api/admin/stats', async (req, res) => {
  try {
    const users = await db.get('SELECT COUNT(*) as count FROM users');
    const workspaces = await db.get('SELECT COUNT(*) as count FROM workspaces');
    const projects = await db.get('SELECT COUNT(*) as count FROM projects');
    const tasks = await db.get('SELECT COUNT(*) as count FROM tasks');
    const drivers = await db.get('SELECT COUNT(*) as count FROM drivers').catch(() => ({ count: 0 }));
    const buses = await db.get('SELECT COUNT(*) as count FROM buses').catch(() => ({ count: 0 }));
    const bookings = await db.get('SELECT COUNT(*) as count FROM bookings').catch(() => ({ count: 0 }));
    const revenue = await db.get(`SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE status = 'approved'`).catch(() => ({ total: 0 }));
    res.json({
      users: users?.count ?? 0,
      workspaces: workspaces?.count ?? 0,
      projects: projects?.count ?? 0,
      tasks: tasks?.count ?? 0,
      drivers: drivers?.count ?? 0,
      buses: buses?.count ?? 0,
      bookings: bookings?.count ?? 0,
      revenue: Number(revenue?.total ?? 0),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const rows = await db.all('SELECT id, username, email, role, created_at FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/workspaces', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT w.*, u.username as owner_name
      FROM workspaces w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/tasks', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT t.*, p.name as project_name, w.name as workspace_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN workspaces w ON p.workspace_id = w.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT b.*, u.username as user_name, u.email as user_email
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `).catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });
    await db.run('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    const row = await db.get('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(row || {});
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Drivers -----
app.get('/api/admin/drivers', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM drivers ORDER BY created_at DESC').catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/drivers', async (req, res) => {
  try {
    const { name, license_no, phone, email, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Driver name required' });
    const result = await db.run(
      'INSERT INTO drivers (name, license_no, phone, email, status) VALUES (?, ?, ?, ?, ?)',
      [name, license_no || '', phone || '', email || '', status || 'active']
    ).catch((e) => { throw e; });
    const row = await db.get('SELECT * FROM drivers WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Buses -----
app.get('/api/admin/buses', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM buses ORDER BY created_at DESC').catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/buses', async (req, res) => {
  try {
    const { bus_number, plate_no, capacity, status } = req.body;
    if (!bus_number) return res.status(400).json({ error: 'Bus number required' });
    const result = await db.run(
      'INSERT INTO buses (bus_number, plate_no, capacity, status) VALUES (?, ?, ?, ?)',
      [bus_number, plate_no || '', capacity || 0, status || 'active']
    ).catch((e) => { throw e; });
    const row = await db.get('SELECT * FROM buses WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Booking Settings -----
app.get('/api/admin/booking-settings', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM booking_settings').catch(() => []);
    const obj = (rows || []).reduce((acc, r) => ({ ...acc, [r.setting_key]: r.setting_value }), {});
    res.json(obj);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin/booking-settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Setting key required' });
    await db.run(
      'INSERT INTO booking_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP',
      [key, value]
    ).catch((e) => { throw e; });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Admin: create admin tasks (reflects for user) -----
app.get('/api/admin/admin-tasks', async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT at.*, u.username as assigned_name
      FROM admin_tasks at
      LEFT JOIN users u ON at.assigned_to = u.id
      ORDER BY at.created_at DESC
    `).catch(() => []);
    res.json(rows || []);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/admin-tasks', async (req, res) => {
  try {
    const { title, description, due_date, assigned_to } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const result = await db.run(
      'INSERT INTO admin_tasks (title, description, status, due_date, assigned_to) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', 'pending', due_date || null, assigned_to || null]
    ).catch((e) => { throw e; });
    const row = await db.get('SELECT * FROM admin_tasks WHERE id = ?', [result.lastInsertRowid]);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ----- Admin: analytics / financial (pie chart data + table) -----
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const bookings = await db.all('SELECT * FROM bookings').catch(() => []);
    const currency = (await db.get('SELECT setting_value FROM booking_settings WHERE setting_key = ?', ['currency']))?.setting_value || '₵';

    const bookingStatusPie = [
      { name: 'Pending', value: bookings.filter(b => (b.status || 'pending') === 'pending').length },
      { name: 'Approved', value: bookings.filter(b => (b.status || '') === 'approved').length },
    ].filter(d => d.value > 0);

    const byBus = {};
    bookings.forEach(b => {
      const key = b.bus_number || 'Unknown';
      byBus[key] = (byBus[key] || 0) + Number(b.amount || 0);
    });
    const revenueByBusPie = Object.entries(byBus).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

    const approvedTotal = bookings.filter(b => (b.status || '') === 'approved').reduce((s, b) => s + Number(b.amount || 0), 0);
    const pendingTotal = bookings.filter(b => (b.status || 'pending') === 'pending').reduce((s, b) => s + Number(b.amount || 0), 0);

    const financialDetails = (bookings || []).map(b => ({
      id: b.id,
      passenger_name: b.passenger_name,
      bus_number: b.bus_number,
      amount: Number(b.amount || 0),
      status: b.status || 'pending',
      created_at: b.created_at,
    }));

    res.json({
      currency,
      bookingStatusPie,
      revenueByBusPie,
      totalRevenue: approvedTotal,
      totalPending: pendingTotal,
      financialDetails,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
