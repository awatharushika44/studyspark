import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
}

export const plannerAPI = {
  generate: (data) => api.post('/api/planner/generate', data),
}

export const focusAPI = {
  complete: (data) => api.post('/api/focus/complete', data),
}

export const chatAPI = {
  sendMessage: (message) => api.post('/api/chat/message', { message }),
}

export const analyticsAPI = {
  getSummary: () => api.get('/api/analytics/summary'),
}

export const subjectsAPI = {
  get: () => api.get('/api/auth/subjects'),
  update: (subjects) => api.put('/api/auth/subjects', { subjects }),
}

export default api