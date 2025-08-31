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
    const sessionId = localStorage.getItem('session') || sessionStorage.getItem('session')
    const schoolCode = localStorage.getItem('schoolCode') || sessionStorage.getItem('schoolCode')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (sessionId) {
      config.headers['SessionId'] = sessionId
    }
    if (schoolCode) {
      config.headers['SchoolCode'] = schoolCode
    }

    // Special handling for FormData - remove Content-Type to let browser set it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      console.log('Detected FormData, removed Content-Type header')
    }

    console.log('Final request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      dataType: config.data?.constructor?.name
    })

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
  request: async (method, url, data = {}, params = {}, config = {}) => {
    try {
      const requestConfig = {
        method,
        url,
        data,
        params,
        ...config, // Merge additional config like headers
      }

      const response = await apiClient(requestConfig)
      return response.data
    } catch (error) {
      throw error
    }
  },

  get: (url, params = {}) => apiService.request('get', url, {}, params),

  post: (url, data, config = {}) => apiService.request('post', url, data, {}, config),

  put: (url, data) => apiService.request('put', url, data),

  delete: (url) => apiService.request('delete', url),
}

export default apiService
