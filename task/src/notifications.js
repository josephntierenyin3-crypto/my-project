/**
 * Browser notifications at scheduled time.
 * Title: "Planner" — Body: "Time is up - [Meeting title]" / "Task due - [task text]"
 */

import * as db from './db.js'

const APP_NAME = 'Planner'

export function requestPermission() {
  if (!('Notification' in window)) return Promise.resolve('unsupported')
  if (Notification.permission === 'granted') return Promise.resolve('granted')
  if (Notification.permission === 'denied') return Promise.resolve('denied')
  return Notification.requestPermission()
}

function nowMs() {
  return Date.now()
}

function meetingTimeMs(meeting) {
  if (!meeting?.date || !meeting?.time) return null
  const d = new Date(meeting.date + 'T' + meeting.time)
  return d.getTime()
}

function taskReminderMs(task) {
  if (!task?.dueDate) return null
  const time = task.reminderTime || '09:00'
  const d = new Date(task.dueDate + 'T' + time)
  return d.getTime()
}

export async function checkAndNotify() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const now = nowMs()

  const meetings = await db.getMeetings()
  for (const m of meetings) {
    if (m.notificationSent) continue
    const t = meetingTimeMs(m)
    if (t == null || t > now) continue
    try {
      new Notification(APP_NAME, {
        body: `Time is up - ${m.title}`,
        icon: '/vite.svg',
      })
      await db.updateMeeting({ ...m, notificationSent: true })
    } catch (_) {}
  }

  const tasks = await db.getTasks()
  let tasksUpdated = false
  for (const t of tasks) {
    if (t.completed || t.reminderSent) continue
    const reminderMs = taskReminderMs(t)
    if (reminderMs == null || reminderMs > now) continue
    try {
      new Notification(APP_NAME, {
        body: `Task due - ${t.text}`,
        icon: '/vite.svg',
      })
      t.reminderSent = true
      tasksUpdated = true
    } catch (_) {}
  }
  if (tasksUpdated) {
    await db.saveTasks(tasks)
  }
}
