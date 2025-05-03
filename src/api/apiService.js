import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

// Create a base Axios instance
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// Request interceptor to attach token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const sessionId = localStorage.getItem('session') || sessionStorage.getItem('session') || ''

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (sessionId) {
      config.headers['SessionId'] = sessionId
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error)
    return Promise.reject(error)
  },
)

// Generalized API function
const apiService = {
  request: async (method, url, data = {}, params = {}) => {
    try {
      const response = await apiClient({
        method,
        url,
        data,
        params,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  get: (url, params = {}) => apiService.request('get', url, {}, params),

  post: (url, data) => apiService.request('post', url, data),

  put: (url, data) => apiService.request('put', url, data),

  delete: (url) => apiService.request('delete', url),
}

export default apiService
