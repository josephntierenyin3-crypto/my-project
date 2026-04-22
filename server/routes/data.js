import express from 'express'
import { query } from '../db.js'
import { authMiddleware } from './auth.js'

const router = express.Router()

router.use(authMiddleware)

function rowToTask(r) {
  if (!r) return null
  return {
    id: r.id,
    text: r.text,
    completed: !!r.completed,
    dueDate: r.due_date || null,
    priority: r.priority || 'medium',
    reminderSent: !!r.reminder_sent,
  }
}

function rowToMeeting(r) {
  if (!r) return null
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    time: r.time,
    duration: r.duration,
    location: r.location || null,
    notes: r.notes || null,
    notificationSent: !!r.notification_sent,
  }
}

function rowToExpense(r) {
  if (!r) return null
  return {
    id: r.id,
    description: r.description,
    amount: parseFloat(r.amount),
    category: r.category,
    date: r.date,
  }
}

// --- Tasks ---
router.get('/tasks', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, text, completed, due_date, priority, reminder_sent FROM tasks WHERE user_id = ? ORDER BY created_at ASC',
      [req.userId]
    )
    res.json({ tasks: rows.map(rowToTask) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load tasks' })
  }
})

router.post('/tasks', async (req, res) => {
  try {
    const { id, text, completed, dueDate, priority, reminderSent } = req.body
    if (!id || !text) return res.status(400).json({ error: 'id and text required' })
    await query(
      'INSERT INTO tasks (id, user_id, text, completed, due_date, priority, reminder_sent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, text, completed ? 1 : 0, dueDate || null, priority || 'medium', reminderSent ? 1 : 0]
    )
    res.status(201).json({ task: rowToTask({ id, text, completed, due_date: dueDate, priority, reminder_sent: reminderSent }) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save task' })
  }
})

router.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { text, completed, dueDate, priority, reminderSent } = req.body
    await query(
      'UPDATE tasks SET text = ?, completed = ?, due_date = ?, priority = ?, reminder_sent = ? WHERE id = ? AND user_id = ?',
      [text ?? '', completed ? 1 : 0, dueDate || null, priority || 'medium', reminderSent ? 1 : 0, id, req.userId]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update task' })
  }
})

router.delete('/tasks/:id', async (req, res) => {
  try {
    await query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.userId])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete task' })
  }
})

router.post('/tasks/sync', async (req, res) => {
  try {
    const { tasks } = req.body
    if (!Array.isArray(tasks)) return res.status(400).json({ error: 'tasks array required' })
    await query('DELETE FROM tasks WHERE user_id = ?', [req.userId])
    for (const t of tasks) {
      await query(
        'INSERT INTO tasks (id, user_id, text, completed, due_date, priority, reminder_sent) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [t.id, req.userId, t.text || '', t.completed ? 1 : 0, t.dueDate || null, t.priority || 'medium', t.reminderSent ? 1 : 0]
      )
    }
    res.json({ tasks: tasks.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to sync tasks' })
  }
})

// --- Meetings ---
router.get('/meetings', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, title, date, time, duration, location, notes, notification_sent FROM meetings WHERE user_id = ? ORDER BY date, time',
      [req.userId]
    )
    res.json({ meetings: rows.map(rowToMeeting) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load meetings' })
  }
})

router.post('/meetings', async (req, res) => {
  try {
    const { id, title, date, time, duration, location, notes, notificationSent } = req.body
    if (!id || !title) return res.status(400).json({ error: 'id and title required' })
    await query(
      'INSERT INTO meetings (id, user_id, title, date, time, duration, location, notes, notification_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, title, date || new Date().toISOString().slice(0, 10), time || '09:00', duration || 60, location || null, notes || null, notificationSent ? 1 : 0]
    )
    res.status(201).json({ meeting: rowToMeeting({ id, title, date, time, duration, location, notes, notification_sent: notificationSent }) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save meeting' })
  }
})

router.delete('/meetings/:id', async (req, res) => {
  try {
    await query('DELETE FROM meetings WHERE id = ? AND user_id = ?', [req.params.id, req.userId])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete meeting' })
  }
})

router.post('/meetings/sync', async (req, res) => {
  try {
    const { meetings } = req.body
    if (!Array.isArray(meetings)) return res.status(400).json({ error: 'meetings array required' })
    await query('DELETE FROM meetings WHERE user_id = ?', [req.userId])
    for (const m of meetings) {
      await query(
        'INSERT INTO meetings (id, user_id, title, date, time, duration, location, notes, notification_sent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [m.id, req.userId, m.title, m.date, m.time, m.duration || 60, m.location || null, m.notes || null, m.notificationSent ? 1 : 0]
      )
    }
    res.json({ meetings: meetings.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to sync meetings' })
  }
})

// --- Expenses ---
router.get('/expenses', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, description, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC',
      [req.userId]
    )
    res.json({ expenses: rows.map(rowToExpense) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load expenses' })
  }
})

router.post('/expenses', async (req, res) => {
  try {
    const { id, description, amount, category, date } = req.body
    if (!id || !description || amount == null) return res.status(400).json({ error: 'id, description, amount required' })
    await query(
      'INSERT INTO expenses (id, user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.userId, description, amount, category || 'Other', date || new Date().toISOString().slice(0, 10)]
    )
    res.status(201).json({ expense: rowToExpense({ id, description, amount, category, date }) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save expense' })
  }
})

router.delete('/expenses/:id', async (req, res) => {
  try {
    await query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.userId])
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete expense' })
  }
})

router.post('/expenses/sync', async (req, res) => {
  try {
    const { expenses } = req.body
    if (!Array.isArray(expenses)) return res.status(400).json({ error: 'expenses array required' })
    await query('DELETE FROM expenses WHERE user_id = ?', [req.userId])
    for (const e of expenses) {
      await query(
        'INSERT INTO expenses (id, user_id, description, amount, category, date) VALUES (?, ?, ?, ?, ?, ?)',
        [e.id, req.userId, e.description, e.amount, e.category || 'Other', e.date]
      )
    }
    res.json({ expenses: expenses.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to sync expenses' })
  }
})

// --- Settings (budget) ---
router.get('/settings', async (req, res) => {
  try {
    const rows = await query('SELECT budget_limit FROM user_settings WHERE user_id = ?', [req.userId])
    const budgetLimit = rows[0] ? String(rows[0].budget_limit || '') : ''
    res.json({ budgetLimit })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load settings' })
  }
})

router.put('/settings', async (req, res) => {
  try {
    const { budgetLimit } = req.body
    await query(
      'INSERT INTO user_settings (user_id, budget_limit) VALUES (?, ?) ON DUPLICATE KEY UPDATE budget_limit = ?',
      [req.userId, budgetLimit != null ? String(budgetLimit) : '', budgetLimit != null ? String(budgetLimit) : '']
    )
    res.json({ budgetLimit: budgetLimit != null ? String(budgetLimit) : '' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save settings' })
  }
})

export default router
