import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Attach access token + active session to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Send the currently selected academic session with every request
    const sessionId = localStorage.getItem('session_id')
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }

    // Let browser set Content-Type for multipart uploads
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Auto-refresh access token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')

      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return apiClient(original)
        } catch {
          // Refresh failed — clear session and redirect to login
          localStorage.clear()
          window.location.href = '/#/'
        }
      } else {
        localStorage.clear()
        window.location.href = '/#/'
      }
    }

    return Promise.reject(error)
  },
)

const apiService = {
  request: async (method, url, data = {}, params = {}, config = {}) => {
    const response = await apiClient({ method, url, data, params, ...config })
    return response.data
  },

  get: (url, params = {}) => apiService.request('get', url, {}, params),

  post: (url, data, config = {}) => apiService.request('post', url, data, {}, config),

  put: (url, data) => apiService.request('put', url, data),

  patch: (url, data) => apiService.request('patch', url, data),

  delete: (url) => apiService.request('delete', url),
}

export default apiService
