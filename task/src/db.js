/**
 * IndexedDB database: plannerdb
 * Stores: tasks, meetings, expenses, settings (budget limit, etc.)
 * Data persists until user clears site data or explicitly deletes.
 */

const DB_NAME = 'plannerdb'
const DB_VERSION = 1
const STORES = ['tasks', 'meetings', 'expenses', 'settings']

const LEGACY_KEYS = {
  tasks: 'planner-tasks',
  meetings: 'planner-meetings',
  expenses: 'planner-expenses',
  budgetLimit: 'planner-budget-limit',
  legacyTasks: 'todo-tasks',
}

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, name === 'settings' ? { keyPath: 'id' } : { keyPath: 'id' })
        }
      })
    }
  })
  return dbPromise
}

function getStore(storeName, mode = 'readonly') {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName))
}

function getAll(storeName) {
  return getStore(storeName).then((store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  })
}

function putAll(storeName, items, keyPath = 'id') {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      store.clear()
      if (Array.isArray(items) && items.length > 0) {
        items.forEach((item) => store.put(item))
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  })
}

function putOne(storeName, item) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      store.put(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  })
}

// --- Public API ---

export async function getTasks() {
  const rows = await getAll('tasks')
  return Array.isArray(rows) ? rows : []
}

export async function saveTasks(tasks) {
  if (!Array.isArray(tasks)) return
  await putAll('tasks', tasks)
}

export async function getMeetings() {
  const rows = await getAll('meetings')
  return Array.isArray(rows) ? rows : []
}

export async function saveMeetings(meetings) {
  if (!Array.isArray(meetings)) return
  await putAll('meetings', meetings)
}

export async function updateMeeting(meeting) {
  if (!meeting || !meeting.id) return
  await putOne('meetings', meeting)
}

export async function getExpenses() {
  const rows = await getAll('expenses')
  return Array.isArray(rows) ? rows : []
}

export async function saveExpenses(expenses) {
  if (!Array.isArray(expenses)) return
  await putAll('expenses', expenses)
}

export async function getSettings() {
  const rows = await getAll('settings')
  const first = Array.isArray(rows) && rows.length ? (rows.find((r) => r?.id === 'default') || rows[0]) : null
  return { budgetLimit: first?.budgetLimit ?? '' }
}

export async function saveSettings(settings) {
  const data = { id: 'default', ...settings }
  await putOne('settings', data)
}

/** Migrate from localStorage into plannerdb (only if DB is empty) */
export async function migrateFromLocalStorage() {
  const [tasks, meetings, expenses, settings] = await Promise.all([
    getTasks(),
    getMeetings(),
    getExpenses(),
    getSettings(),
  ])
  const hasData = tasks.length > 0 || meetings.length > 0 || expenses.length > 0
  if (hasData) return { tasks, meetings, expenses, budgetLimit: settings?.budgetLimit ?? '' }

  const budgetLimit = (() => {
    try {
      const raw = localStorage.getItem(LEGACY_KEYS.budgetLimit)
      return raw != null ? String(JSON.parse(raw)) : ''
    } catch (_) {
      return ''
    }
  })()

  let migratedTasks = []
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.tasks)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) migratedTasks = parsed
    }
  } catch (_) {}
  if (migratedTasks.length === 0) {
    try {
      const raw = localStorage.getItem(LEGACY_KEYS.legacyTasks)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          migratedTasks = parsed.map((t) => ({
            id: t.id || crypto.randomUUID(),
            text: t.text || '',
            completed: !!t.completed,
            dueDate: t.dueDate || null,
            priority: t.priority || 'medium',
            reminderSent: !!t.reminderSent,
          }))
        }
      }
    } catch (_) {}
  } else {
    migratedTasks = migratedTasks.map((t) => ({
      ...t,
      reminderSent: t.reminderSent === true,
    }))
  }

  let migratedMeetings = []
  try {
    const raw = localStorage.getItem(LEGACY_KEYS.meetings)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        migratedMeetings = parsed.map((m) => ({
          ...m,
          notificationSent: m.notificationSent === true,
          id: m.id || crypto.randomUUID(),
        }))
      }
    }
  } catch (_) {}

  let migratedExpenses = []
  try {
    const raw = localStorage.getItem('planner-expenses')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) migratedExpenses = parsed
    }
  } catch (_) {}

  await saveTasks(migratedTasks)
  await saveMeetings(migratedMeetings)
  await saveExpenses(migratedExpenses)
  await saveSettings({ budgetLimit })

  return {
    tasks: migratedTasks,
    meetings: migratedMeetings,
    expenses: migratedExpenses,
    budgetLimit,
  }
}

export async function loadAll() {
  const migrated = await migrateFromLocalStorage()
  return migrated
}
