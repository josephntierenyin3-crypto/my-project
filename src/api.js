const API = '/api'

function getToken() {
  return localStorage.getItem('planner_token')
}

function setToken(token) {
  localStorage.setItem('planner_token', token)
}

function clearToken() {
  localStorage.removeItem('planner_token')
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (includeAuth && token) h.Authorization = `Bearer ${token}`
  return h
}

export async function register(email, password, name) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ email, password, name }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  return data
}

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

export async function getMe() {
  const res = await fetch(`${API}/auth/me`, { headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Not authenticated')
  return data
}

// --- Data (tasks, meetings, expenses, settings) - persist in database and stay in browser ---

export async function apiGetTasks() {
  const res = await fetch(`${API}/tasks`, { headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load tasks')
  return data.tasks || []
}

export async function apiSaveTask(task) {
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      id: task.id,
      text: task.text,
      completed: task.completed,
      dueDate: task.dueDate,
      priority: task.priority || 'medium',
      reminderSent: task.reminderSent,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to save task')
  return data
}

export async function apiUpdateTask(id, patch) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(patch),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to update task')
  return data
}

export async function apiDeleteTask(id) {
  const res = await fetch(`${API}/tasks/${id}`, { method: 'DELETE', headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to delete task')
  return data
}

export async function apiGetMeetings() {
  const res = await fetch(`${API}/meetings`, { headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load meetings')
  return data.meetings || []
}

export async function apiSaveMeeting(meeting) {
  const res = await fetch(`${API}/meetings`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      location: meeting.location,
      notes: meeting.notes,
      notificationSent: meeting.notificationSent,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to save meeting')
  return data
}

export async function apiDeleteMeeting(id) {
  const res = await fetch(`${API}/meetings/${id}`, { method: 'DELETE', headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to delete meeting')
  return data
}

export async function apiGetExpenses() {
  const res = await fetch(`${API}/expenses`, { headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load expenses')
  return data.expenses || []
}

export async function apiSaveExpense(expense) {
  const res = await fetch(`${API}/expenses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to save expense')
  return data
}

export async function apiDeleteExpense(id) {
  const res = await fetch(`${API}/expenses/${id}`, { method: 'DELETE', headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to delete expense')
  return data
}

export async function apiGetSettings() {
  const res = await fetch(`${API}/settings`, { headers: headers() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to load settings')
  return { budgetLimit: data.budgetLimit ?? '' }
}

export async function apiSaveSettings(settings) {
  const res = await fetch(`${API}/settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(settings),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Failed to save settings')
  return data
}

export { getToken, setToken, clearToken }
