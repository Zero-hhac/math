const API_BASE = '/api'

function getHeaders() {
  const token = localStorage.getItem('admin_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  })
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.message)
  return json
}

async function get(endpoint) {
  return (await fetchAPI(endpoint)).data
}

async function post(endpoint, body) {
  return await fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(body) })
}

async function put(endpoint, body) {
  return await fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(body) })
}

async function del(endpoint) {
  return await fetchAPI(endpoint, { method: 'DELETE' })
}

function toQuery(params) {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
}

async function uploadFile(endpoint, formData) {
  const token = localStorage.getItem('admin_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  })
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.message)
  return json
}

export const api = {
  getCompetitions: () => get('/competitions'),
  getNews: () => get('/news'),
  getMembers: () => get('/members'),
  getPublicDocuments: (params) => get('/documents' + toQuery(params)),
  getPublicActivities: () => get('/activities'),
  submitContact: (form) => post('/contact', form),

  admin: {
    login: (username, password) => post('/admin/login', { username, password }),
    stats: () => get('/admin/stats'),
    contacts: () => get('/admin/contacts'),
    markRead: (id) => put(`/admin/contacts/${id}/read`, {}),
    deleteContact: (id) => del(`/admin/contacts/${id}`),
    documents: {
      list: (params) => get('/admin/documents' + toQuery(params)),
      create: (data) => post('/admin/documents', data),
      update: (id, data) => put(`/admin/documents/${id}`, data),
      delete: (id) => del(`/admin/documents/${id}`),
    },
    resources: {
      list: () => get('/admin/resources'),
    },
    users: {
      list: (params) => get('/admin/users' + toQuery(params)),
      create: (data) => post('/admin/users', data),
      update: (id, data) => put(`/admin/users/${id}`, data),
      delete: (id) => del(`/admin/users/${id}`),
      resetPassword: (id, newPassword) => put(`/admin/users/${id}/reset-password`, { new_password: newPassword }),
    },
    upload: {
      file: (formData) => uploadFile('/admin/upload', formData),
      image: (formData) => uploadFile('/admin/upload/image', formData),
    },

    activities: {
      list: () => get('/admin/activities'),
      create: (data) => post('/admin/activities', data),
      update: (id, data) => put(`/admin/activities/${id}`, data),
      delete: (id) => del(`/admin/activities/${id}`),
    },

    competitions: {
      list: () => get('/admin/competitions'),
      create: (data) => post('/admin/competitions', data),
      update: (id, data) => put(`/admin/competitions/${id}`, data),
      delete: (id) => del(`/admin/competitions/${id}`),
    },
    news: {
      list: () => get('/admin/news'),
      create: (data) => post('/admin/news', data),
      update: (id, data) => put(`/admin/news/${id}`, data),
      delete: (id) => del(`/admin/news/${id}`),
    },
    members: {
      list: () => get('/admin/members'),
      create: (data) => post('/admin/members', data),
      update: (id, data) => put(`/admin/members/${id}`, data),
      delete: (id) => del(`/admin/members/${id}`),
    },
  },
}
