// src/api/reportManagementApi.js
import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const apiReportClient = axios.create({
  baseURL: `${BASE_URL}/api/reports`, // Updated to point to reports endpoint
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// Request interceptor to attach token to every request
apiReportClient.interceptors.request.use(
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

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle errors globally
apiReportClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error)

    // Handle specific error cases
    if (error.response && error.response.status === 400) {
      console.error('Bad Request:', error.response.data)
    } else if (error.response && error.response.status === 500) {
      console.error('Server Error:', error.response.data)
    }

    return Promise.reject(error)
  },
)

const reportManagementApi = {
  // Updated method for PDF downloads with proper error handling
  downloadPdf: async (endpoint, params) => {
    try {
      console.log('Downloading PDF from endpoint:', endpoint)
      console.log('Request params:', params)

      // Validate required parameters
      if (!params.sessionId || !params.schoolId) {
        throw new Error('Session ID and School ID are required')
      }

      // Get authentication tokens for manual addition to request
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const sessionId = localStorage.getItem('session') || sessionStorage.getItem('session')
      const schoolCode = localStorage.getItem('schoolCode') || sessionStorage.getItem('schoolCode')

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
      if (schoolCode) {
        headers['SchoolCode'] = schoolCode
      }

      console.log('Request headers:', headers)

      // Use apiReportClient with responseType: 'blob'
      const response = await apiReportClient.request({
        url: endpoint,
        method: 'POST',
        data: params,
        responseType: 'blob',
        headers: headers,
        timeout: 30000, // 30 second timeout
      })

      console.log('PDF download response:', response)

      // Validate response
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error('Invalid response: Expected PDF blob')
      }

      // Check if blob has content
      if (response.data.size === 0) {
        throw new Error('Empty PDF received')
      }

      return response
    } catch (error) {
      console.error(`Error downloading PDF from ${endpoint}:`, error)

      // Enhanced error handling
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const statusText = error.response.statusText

        if (status === 400) {
          throw new Error(`Bad Request: ${statusText}. Please check your input parameters.`)
        } else if (status === 401) {
          throw new Error('Unauthorized: Please login again.')
        } else if (status === 403) {
          throw new Error('Forbidden: You do not have permission to generate this report.')
        } else if (status === 404) {
          throw new Error('Report endpoint not found.')
        } else if (status === 500) {
          throw new Error('Server error: Please try again later or contact support.')
        } else {
          throw new Error(`Server error (${status}): ${statusText}`)
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Please check your internet connection.')
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        throw new Error('Request timeout: The report is taking too long to generate.')
      } else {
        // Other error
        throw new Error(error.message || 'An unexpected error occurred')
      }
    }
  },

  // Optional: Preview method to check report data before generating PDF
  previewReport: async (endpoint, params) => {
    try {
      console.log('Getting report preview for endpoint:', endpoint)

      const response = await apiReportClient.post(endpoint.replace('allStudent', 'preview'), params)
      return response.data
    } catch (error) {
      console.error(`Error getting report preview from ${endpoint}:`, error)
      throw error
    }
  },

  // Optional: Get available report types
  getReportTypes: async () => {
    try {
      const response = await apiReportClient.get('/types')
      return response.data
    } catch (error) {
      console.error('Error getting report types:', error)
      throw error
    }
  },
}

export default reportManagementApi
