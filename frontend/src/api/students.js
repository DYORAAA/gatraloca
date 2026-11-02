import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
  withCredentials: true,
})

const backendBase = new URL(import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api', window.location.origin)
backendBase.pathname = `${backendBase.pathname.replace(/\/api\/?$/, '').replace(/\/$/, '')}/admin`
backendBase.search = ''
backendBase.hash = ''
export const adminDashboardUrl = backendBase.toString()

export const studentApi = {
  /** GET /students?major=TKJ&search=budi&page=1&per_page=24 */
  list: (params = {}) => api.get('/students', { params }),

  /** GET /students/:id */
  show: id => api.get(`/students/${id}`),

}

export const landingPhotoApi = {
  list: params => api.get('/landing-photos', { params }),
}

export const majorApi = {
  /** GET /majors */
  list: () => api.get('/majors'),
}
