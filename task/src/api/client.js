// Use relative /api in dev so Vite proxy forwards to backend; set VITE_API_URL for production.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  auth: {
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  },
  workspaces: {
    list: (userId) => request(`/api/workspaces?userId=${userId}`),
    create: (body) => request('/api/workspaces', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/workspaces/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/workspaces/${id}`, { method: 'DELETE' }),
  },
  projects: {
    list: (workspaceId) => request(`/api/projects?workspaceId=${workspaceId}`),
    create: (body) => request('/api/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    listByProject: (projectId) => request(`/api/tasks?projectId=${projectId}`),
    listByWorkspace: (workspaceId) => request(`/api/tasks?workspaceId=${workspaceId}`),
    listMyWork: (userId) => request(`/api/tasks?userId=${userId}`),
    create: (body) => request('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  drivers: () => request('/api/drivers'),
  buses: () => request('/api/buses'),
  bookingSettings: () => request('/api/booking-settings'),
  bookings: {
    list: (userId) => request(`/api/bookings?userId=${userId}`),
    create: (body) => request('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
  },
  trips: {
    list: () => request('/api/trips'),
    create: (body) => request('/api/trips', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/api/trips/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  adminTasks: {
    list: () => request('/api/admin-tasks'),
    updateStatus: (id, status) => request(`/api/admin-tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  admin: {
    stats: () => request('/api/admin/stats'),
    users: () => request('/api/admin/users'),
    workspaces: () => request('/api/admin/workspaces'),
    tasks: () => request('/api/admin/tasks'),
    drivers: () => request('/api/admin/drivers'),
    createDriver: (body) => request('/api/admin/drivers', { method: 'POST', body: JSON.stringify(body) }),
    buses: () => request('/api/admin/buses'),
    createBus: (body) => request('/api/admin/buses', { method: 'POST', body: JSON.stringify(body) }),
    bookingSettings: () => request('/api/admin/booking-settings'),
    updateBookingSetting: (body) => request('/api/admin/booking-settings', { method: 'PATCH', body: JSON.stringify(body) }),
    bookings: () => request('/api/admin/bookings'),
    approveBooking: (id) => request(`/api/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }),
    updateBooking: (id, body) => request(`/api/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    adminTasks: () => request('/api/admin/admin-tasks'),
    createAdminTask: (body) => request('/api/admin/admin-tasks', { method: 'POST', body: JSON.stringify(body) }),
    analytics: () => request('/api/admin/analytics'),
  },
};
