import { useState, useCallback, useMemo, useEffect } from 'react'
import './App.css'
import * as db from './db.js'
import { requestPermission, checkAndNotify } from './notifications.js'
import {
  getToken,
  clearToken,
  getMe,
  apiGetTasks,
  apiSaveTask,
  apiUpdateTask,
  apiDeleteTask,
  apiGetMeetings,
  apiSaveMeeting,
  apiDeleteMeeting,
  apiGetExpenses,
  apiSaveExpense,
  apiDeleteExpense,
  apiGetSettings,
  apiSaveSettings,
} from './api'
import AuthScreen from './AuthScreen'

function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(str) {
  if (!str) return ''
  const [h, m] = str.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

const PRIORITIES = [
  { value: 'high', label: 'High', class: 'priority-high' },
  { value: 'medium', label: 'Medium', class: 'priority-medium' },
  { value: 'low', label: 'Low', class: 'priority-low' },
]

const EXPENSE_CATEGORIES = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Technology',
  'Consulting',
  'Marketing',
  'Other',
]

const NAV_ITEMS = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'budget', label: 'Budget & Expenses' },
]

function IconSchedule() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function IconMeetings() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconTasks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
function IconBudget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

const NAV_ICONS = { schedule: IconSchedule, meetings: IconMeetings, tasks: IconTasks, budget: IconBudget }

function App() {
  const [authCheckDone, setAuthCheckDone] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('schedule')
  const [scheduleDate, setScheduleDate] = useState(todayStr())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const [tasks, setTasks] = useState([])
  const [meetings, setMeetings] = useState([])
  const [expenses, setExpenses] = useState([])
  const [budgetLimit, setBudgetLimitState] = useState('')

  useEffect(() => {
    if (!getToken()) {
      setUser(null)
      setAuthCheckDone(true)
      return
    }
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setAuthCheckDone(true))
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    Promise.all([
      apiGetTasks().catch(() => null),
      apiGetMeetings().catch(() => null),
      apiGetExpenses().catch(() => null),
      apiGetSettings().catch(() => null),
    ])
      .then(([tasksFromApi, meetingsFromApi, expensesFromApi, settingsRes]) => {
        if (cancelled) return
        const budgetLimit = settingsRes?.budgetLimit != null ? String(settingsRes.budgetLimit) : ''
        if (tasksFromApi != null && meetingsFromApi != null && expensesFromApi != null) {
          setTasks(Array.isArray(tasksFromApi) ? tasksFromApi : [])
          setMeetings(Array.isArray(meetingsFromApi) ? meetingsFromApi : [])
          setExpenses(Array.isArray(expensesFromApi) ? expensesFromApi : [])
          setBudgetLimitState(budgetLimit)
          db.saveTasks(tasksFromApi || []).catch(() => {})
          db.saveMeetings(meetingsFromApi || []).catch(() => {})
          db.saveExpenses(expensesFromApi || []).catch(() => {})
          db.saveSettings({ budgetLimit }).catch(() => {})
          setLoading(false)
        } else {
          db.loadAll().then((data) => {
            if (cancelled) return
            setTasks(Array.isArray(data.tasks) ? data.tasks : [])
            setMeetings(Array.isArray(data.meetings) ? data.meetings : [])
            setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
            setBudgetLimitState(data.budgetLimit != null ? String(data.budgetLimit) : '')
            setLoading(false)
          }).catch(() => {
            if (!cancelled) setLoading(false)
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          db.loadAll().then((data) => {
            if (cancelled) return
            setTasks(Array.isArray(data.tasks) ? data.tasks : [])
            setMeetings(Array.isArray(data.meetings) ? data.meetings : [])
            setExpenses(Array.isArray(data.expenses) ? data.expenses : [])
            setBudgetLimitState(data.budgetLimit != null ? String(data.budgetLimit) : '')
            setLoading(false)
          }).catch(() => setLoading(false))
        }
      })
    return () => { cancelled = true }
  }, [user])

  const [notificationPermission, setNotificationPermission] = useState(
    () => (typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
  )

  useEffect(() => {
    if (typeof Notification !== 'undefined') setNotificationPermission(Notification.permission)
    requestPermission().then((p) => {
      if (typeof Notification !== 'undefined') setNotificationPermission(Notification.permission)
    })
    const t = setTimeout(() => checkAndNotify(), 2000)
    const id = setInterval(() => checkAndNotify(), 60 * 1000)
    return () => {
      clearTimeout(t)
      clearInterval(id)
    }
  }, [])

  const handleEnableNotifications = useCallback(() => {
    requestPermission().then((p) => {
      if (typeof Notification !== 'undefined') setNotificationPermission(p || Notification.permission)
    })
  }, [])

  const handleLogout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const setBudgetLimit = useCallback((v) => {
    setBudgetLimitState(v)
    db.saveSettings({ budgetLimit: v }).catch(() => {})
    apiSaveSettings({ budgetLimit: v }).catch(() => {})
  }, [])

  const [taskInput, setTaskInput] = useState('')
  const [taskDue, setTaskDue] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')
  const [taskFilter, setTaskFilter] = useState('all')

  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState(todayStr())
  const [meetingTime, setMeetingTime] = useState('09:00')
  const [meetingDuration, setMeetingDuration] = useState('60')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')

  const [expenseDesc, setExpenseDesc] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0])
  const [expenseDate, setExpenseDate] = useState(todayStr())

  const addTask = useCallback(() => {
    const text = taskInput.trim()
    if (!text) return
    const newTask = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      dueDate: taskDue || null,
      priority: taskPriority,
      reminderSent: false,
    }
    setTasks((prev) => {
      const next = [...prev, newTask]
      db.saveTasks(next).catch(() => {})
      apiSaveTask(newTask).catch(() => {})
      return next
    })
    setTaskInput('')
    setTaskDue('')
    setTaskPriority('medium')
  }, [taskInput, taskDue, taskPriority])

  const toggleTask = useCallback((id) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
      const updated = next.find((t) => t.id === id)
      if (updated) apiUpdateTask(id, { ...updated }).catch(() => {})
      db.saveTasks(next).catch(() => {})
      return next
    })
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id)
      db.saveTasks(next).catch(() => {})
      apiDeleteTask(id).catch(() => {})
      return next
    })
  }, [])

  const clearCompletedTasks = useCallback(() => {
    setTasks((prev) => {
      const toRemove = prev.filter((t) => t.completed)
      const next = prev.filter((t) => !t.completed)
      toRemove.forEach((t) => apiDeleteTask(t.id).catch(() => {}))
      db.saveTasks(next).catch(() => {})
      return next
    })
  }, [])

  const addMeeting = useCallback(() => {
    const title = meetingTitle.trim()
    if (!title) return
    const newMeeting = {
      id: crypto.randomUUID(),
      title,
      date: meetingDate,
      time: meetingTime,
      duration: Number(meetingDuration) || 60,
      location: meetingLocation.trim() || null,
      notes: meetingNotes.trim() || null,
      notificationSent: false,
    }
    setMeetings((prev) => {
      const next = [...prev, newMeeting]
      db.saveMeetings(next).catch(() => {})
      apiSaveMeeting(newMeeting).catch(() => {})
      return next
    })
    setMeetingTitle('')
    setMeetingDate(todayStr())
    setMeetingTime('09:00')
    setMeetingDuration('60')
    setMeetingLocation('')
    setMeetingNotes('')
  }, [
    meetingTitle,
    meetingDate,
    meetingTime,
    meetingDuration,
    meetingLocation,
    meetingNotes,
  ])

  const deleteMeeting = useCallback((id) => {
    setMeetings((prev) => {
      const next = prev.filter((m) => m.id !== id)
      db.saveMeetings(next).catch(() => {})
      apiDeleteMeeting(id).catch(() => {})
      return next
    })
  }, [])

  const addExpense = useCallback(() => {
    const desc = expenseDesc.trim()
    const amount = parseFloat(expenseAmount)
    if (!desc || Number.isNaN(amount) || amount <= 0) return
    const newExpense = {
      id: crypto.randomUUID(),
      description: desc,
      amount,
      category: expenseCategory,
      date: expenseDate,
    }
    setExpenses((prev) => {
      const next = [...prev, newExpense]
      db.saveExpenses(next).catch(() => {})
      apiSaveExpense(newExpense).catch(() => {})
      return next
    })
    setExpenseDesc('')
    setExpenseAmount('')
    setExpenseCategory(EXPENSE_CATEGORIES[0])
    setExpenseDate(todayStr())
  }, [expenseDesc, expenseAmount, expenseCategory, expenseDate])

  const deleteExpense = useCallback((id) => {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id)
      db.saveExpenses(next).catch(() => {})
      apiDeleteExpense(id).catch(() => {})
      return next
    })
  }, [])

  const scheduleItems = useMemo(() => {
    const dayMeetings = meetings
      .filter((m) => m.date === scheduleDate)
      .map((m) => ({
        type: 'meeting',
        id: m.id,
        time: m.time,
        title: m.title,
        subtitle: m.location || `${m.duration} min`,
        raw: m,
      }))
    const dayTasks = tasks
      .filter((t) => t.dueDate === scheduleDate && !t.completed)
      .map((t) => ({
        type: 'task',
        id: t.id,
        time: null,
        title: t.text,
        subtitle: t.priority ? `Priority: ${t.priority}` : '',
        raw: t,
      }))
    const combined = [...dayMeetings, ...dayTasks]
    combined.sort((a, b) => {
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })
    return combined
  }, [meetings, tasks, scheduleDate])

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )
  const budgetNum = parseFloat(budgetLimit) || 0
  const remaining = budgetNum - totalSpent
  const isOverBudget = budgetNum > 0 && remaining < 0

  const expensiveExpenses = useMemo(
    () => expenses.filter((e) => e.amount >= 1000).sort((a, b) => b.amount - a.amount),
    [expenses]
  )

  const q = searchQuery.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!q) return []
    const results = []
    tasks.forEach((t) => {
      if (t.text.toLowerCase().includes(q)) results.push({ type: 'task', id: t.id, title: t.text, subtitle: t.dueDate ? formatDate(t.dueDate) : 'Task', tab: 'tasks' })
    })
    meetings.forEach((m) => {
      const match = [m.title, m.location, m.notes].filter(Boolean).join(' ').toLowerCase().includes(q)
      if (match) results.push({ type: 'meeting', id: m.id, title: m.title, subtitle: `${formatDate(m.date)} ${formatTime(m.time)}`, tab: 'meetings' })
    })
    expenses.forEach((e) => {
      if (e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        results.push({ type: 'expense', id: e.id, title: e.description, subtitle: `$${e.amount.toFixed(2)} · ${e.category}`, tab: 'budget' })
      }
    })
    return results.slice(0, 12)
  }, [q, tasks, meetings, expenses])

  const tasksForView = useMemo(() => {
    const base = taskFilter === 'active' ? tasks.filter((t) => !t.completed) : taskFilter === 'completed' ? tasks.filter((t) => t.completed) : tasks
    if (!q) return base
    return base.filter((t) => t.text.toLowerCase().includes(q))
  }, [tasks, taskFilter, q])

  const meetingsForView = useMemo(() => {
    if (!q) return [...meetings].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    return meetings.filter((m) => {
      const s = [m.title, m.location, m.notes].filter(Boolean).join(' ').toLowerCase()
      return s.includes(q)
    }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }, [meetings, q])

  const expensesForView = useMemo(() => {
    if (!q) return [...expenses].sort((a, b) => b.date.localeCompare(a.date))
    return expenses.filter((e) => e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)).sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, q])

  const handleSearchResultClick = useCallback((tab) => {
    setActiveTab(tab)
    setSearchFocused(false)
  }, [])

  if (!authCheckDone) {
    return (
      <div className="planner-app planner-loading">
        <div className="loading-message">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />
  }

  if (loading) {
    return (
      <div className="planner-app planner-loading">
        <div className="loading-message">Loading planner...</div>
      </div>
    )
  }

  return (
    <div className="planner-app">
      <aside className="planner-sidebar" aria-label="Main navigation">
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden>
            <IconSchedule />
          </span>
          <span className="sidebar-title">Planner</span>
        </div>
        <nav className="sidebar-nav" role="navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.id]
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="sidebar-link-icon">{Icon ? <Icon /> : null}</span>
                <span className="sidebar-link-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user.name || user.email}</div>
          <div className="sidebar-user-email">{user.email}</div>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="planner-body">
        <header className="planner-topbar">
          {notificationPermission === 'default' && (
            <button
              type="button"
              className="btn-notification-prompt"
              onClick={handleEnableNotifications}
            >
              Enable time alerts
            </button>
          )}
          <div className="search-wrap">
            <span className="search-icon" aria-hidden><IconSearch /></span>
            <input
              type="search"
              className="search-input"
              placeholder="Search tasks, meetings, expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              aria-label="Search"
              autoComplete="off"
            />
            {searchResults.length > 0 && (searchFocused || searchQuery.trim()) && (
              <div className="search-dropdown" role="listbox">
                {searchResults.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    type="button"
                    className="search-result-item"
                    role="option"
                    onClick={() => handleSearchResultClick(r.tab)}
                  >
                    <span className="search-result-title">{r.title}</span>
                    <span className="search-result-subtitle">{r.subtitle}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="planner-hero">
          <img
            src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80"
            srcSet="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80 800w, https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80 1200w"
            sizes="(max-width: 768px) 100vw, 720px"
            alt="Planning and productivity"
            className="hero-image"
          />
          <div className="hero-overlay">
            <h1 className="hero-title">Executive Daily Planner</h1>
            <p className="hero-tagline">Schedule · Meetings · Tasks · Budget</p>
          </div>
        </div>
        <p className="planner-save-info">
          Your data is saved to your account (database) and in this browser.
        </p>

      <main className="planner-main">
        {activeTab === 'schedule' && (
          <section className="planner-section" aria-label="Daily schedule">
            <div className="section-header">
              <h2>Daily Schedule</h2>
              <input
                type="date"
                className="planner-date-input"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                aria-label="Select date"
              />
            </div>
            <p className="schedule-date-label">{formatDate(scheduleDate)}</p>
            {scheduleItems.length === 0 ? (
              <p className="empty-state">
                No meetings or tasks scheduled for this day.
              </p>
            ) : (
              <ul className="schedule-list">
                {scheduleItems.map((item) => (
                  <li
                    key={`${item.type}-${item.id}`}
                    className={`schedule-item schedule-item--${item.type}`}
                  >
                    {item.time && (
                      <span className="schedule-time">
                        {formatTime(item.time)}
                      </span>
                    )}
                    <div className="schedule-content">
                      <span className="schedule-title">{item.title}</span>
                      {item.subtitle && (
                        <span className="schedule-subtitle">{item.subtitle}</span>
                      )}
                    </div>
                    {item.type === 'meeting' && (
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => deleteMeeting(item.id)}
                        aria-label="Delete meeting"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'meetings' && (
          <section className="planner-section" aria-label="Meetings">
            <h2>Meetings</h2>
            <div className="form-card">
              <h3>Add Meeting</h3>
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="Meeting title"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                  />
                </div>
                <div className="form-group form-group--full">
                  <label>Location</label>
                  <input
                    type="text"
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="Room or link"
                  />
                </div>
                <div className="form-group form-group--full">
                  <label>Notes</label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    placeholder="Agenda, attendees..."
                    rows={2}
                  />
                </div>
              </div>
              <button type="button" className="btn-primary" onClick={addMeeting}>
                Add Meeting
              </button>
            </div>
            <ul className="list-card list-meetings">
              {meetingsForView.length === 0 ? (
                <li className="empty-state">No meetings yet.</li>
              ) : (
                meetingsForView.map((m) => (
                    <li key={m.id} className="list-item meeting-item">
                      <div className="meeting-main">
                        <span className="meeting-title">{m.title}</span>
                        <span className="meeting-meta">
                          {formatDate(m.date)} · {formatTime(m.time)}
                          {m.location && ` · ${m.location}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-icon btn-delete"
                        onClick={() => deleteMeeting(m.id)}
                        aria-label="Delete meeting"
                      >
                        ×
                      </button>
                    </li>
                  ))
              )}
            </ul>
          </section>
        )}

        {activeTab === 'tasks' && (
          <section className="planner-section" aria-label="Tasks">
            <h2>Planning &amp; Tasks</h2>
            <div className="form-card form-inline">
              <input
                type="text"
                className="input-flex"
                placeholder="Task description"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <input
                type="date"
                className="input-date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                title="Due date"
              />
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                title="Priority"
                className="select-priority"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-primary" onClick={addTask}>
                Add Task
              </button>
            </div>
            <div className="filter-row">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-btn ${taskFilter === f ? 'active' : ''}`}
                  onClick={() => setTaskFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <ul className="list-card list-tasks">
              {tasksForView.length === 0 ? (
                <li className="empty-state">No tasks in this view.</li>
              ) : (
                tasksForView.map((t) => (
                  <li
                    key={t.id}
                    className={`list-item task-item ${t.completed ? 'completed' : ''} ${t.priority ? PRIORITIES.find((p) => p.value === t.priority)?.class || '' : ''}`}
                  >
                    <label className="task-label">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTask(t.id)}
                      />
                      <span className="task-text">{t.text}</span>
                    </label>
                    <div className="task-meta">
                      {t.dueDate && (
                        <span className="task-due">{formatDate(t.dueDate)}</span>
                      )}
                      {t.priority && (
                        <span className={`task-priority priority-${t.priority}`}>
                          {t.priority}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      onClick={() => deleteTask(t.id)}
                      aria-label="Delete task"
                    >
                      ×
                    </button>
                  </li>
                ))
              )}
            </ul>
            {tasks.some((t) => t.completed) && (
              <button
                type="button"
                className="btn-secondary btn-clear"
                onClick={clearCompletedTasks}
              >
                Clear completed
              </button>
            )}
          </section>
        )}

        {activeTab === 'budget' && (
          <section className="planner-section" aria-label="Budget and expenses">
            <h2>Budget &amp; Expenses</h2>
            <div className="budget-summary">
              <div className="budget-row">
                <label>Monthly budget limit (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 10000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="input-amount"
                />
              </div>
              <div className="budget-stats">
                <div className="stat">
                  <span className="stat-label">Total spent</span>
                  <span className="stat-value">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {budgetNum > 0 && (
                  <div className={`stat ${isOverBudget ? 'over' : ''}`}>
                    <span className="stat-label">Remaining</span>
                    <span className="stat-value">
                      ${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {isOverBudget ? ' over budget' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="form-card">
              <h3>Add Expense</h3>
              <div className="form-grid">
                <div className="form-group form-group--full">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="What was the expense?"
                  />
                </div>
                <div className="form-group">
                  <label>Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>
              <button type="button" className="btn-primary" onClick={addExpense}>
                Add Expense
              </button>
            </div>
            {expensiveExpenses.length > 0 && (
              <div className="expensive-block">
                <h3>High-cost items ($1,000+)</h3>
                <ul className="list-card">
                  {expensiveExpenses.map((e) => (
                    <li key={e.id} className="list-item expense-item expense-item--high">
                      <div>
                        <span className="expense-desc">{e.description}</span>
                        <span className="expense-meta">
                          {e.category} · {formatDate(e.date)}
                        </span>
                      </div>
                      <div className="expense-amount-row">
                        <span className="expense-amount">${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <button
                          type="button"
                          className="btn-icon btn-delete"
                          onClick={() => deleteExpense(e.id)}
                          aria-label="Delete expense"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="all-expenses-block">
              <h3>All Expenses</h3>
              <ul className="list-card">
                {expensesForView.length === 0 ? (
                  <li className="empty-state">No expenses recorded.</li>
                ) : (
                  expensesForView.map((e) => (
                      <li
                        key={e.id}
                        className={`list-item expense-item ${e.amount >= 1000 ? 'expense-item--high' : ''}`}
                      >
                        <div>
                          <span className="expense-desc">{e.description}</span>
                          <span className="expense-meta">
                            {e.category} · {formatDate(e.date)}
                          </span>
                        </div>
                        <div className="expense-amount-row">
                          <span className="expense-amount">${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                          <button
                            type="button"
                            className="btn-icon btn-delete"
                            onClick={() => deleteExpense(e.id)}
                            aria-label="Delete expense"
                          >
                            ×
                          </button>
                        </div>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </section>
        )}
      </main>
      </div>
    </div>
  )
}

export default App
