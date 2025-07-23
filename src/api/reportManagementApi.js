// src/api/reportManagementApi.js
import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const apiReportClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// Request interceptor to attach token to every request
apiReportClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const sessionId = localStorage.getItem('session') || sessionStorage.getItem('session')

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
apiReportClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error)
    return Promise.reject(error)
  },
)

const reportManagementApi = {
  // Fixed method for Excel downloads with authentication
  downloadPdf: async (endpoint, params) => {
    try {
      // Get authentication tokens for manual addition to request
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const sessionId = localStorage.getItem('session') || sessionStorage.getItem('session')

      // Create headers with authentication
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      }

      // Add authentication headers
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      if (sessionId) {
        headers['SessionId'] = sessionId
      }

      // Use apiReportClient with responseType: 'blob'
      return await apiReportClient.request({
        url: endpoint,
        method: 'POST',
        data: params,
        responseType: 'blob',
        headers: headers,
      })
    } catch (error) {
      console.error(`Error downloading Excel from ${endpoint}:`, error)
      throw error
    }
  },
}

export default reportManagementApi
