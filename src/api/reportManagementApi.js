// src/api/reportManagementApi.js
import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const apiReportClient = axios.create({
  baseURL: `${BASE_URL}/api`, // Updated to point to main API endpoint
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
})

// Request interceptor to attach token to every request
apiReportClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const sessionId = localStorage.getItem('session') || sessionStorage.getItem('session')
    const schoolCode = localStorage.getItem('schoolCode') || sessionStorage.getItem('schoolCode')
    console.log(token)
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
  // ============ FEE REPORTS METHODS ============

  /**
   * Get fee report preview
   */
  getFeeReportPreview: async (params) => {
    try {
      console.log('Getting fee report preview with params:', params)

      // Validate required parameters
      if (!params.sessionId || !params.schoolId) {
        throw new Error('Session ID and School ID are required')
      }

      if (!params.reportType) {
        throw new Error('Report type is required')
      }

      const response = await apiReportClient.post('reports/fees/preview', params)
      return response.data
    } catch (error) {
      console.error('Error getting fee report preview:', error)
      throw this.handleApiError(error)
    }
  },

  // ============ LEGACY PDF DOWNLOAD METHOD ============

  /**
   * Generic PDF download method (maintained for backward compatibility)
   */
  downloadPdf: async (endpoint, params) => {
    try {
      console.log('Downloading PDF from endpoint:', endpoint)
      console.log('Request params:', params)

      // Handle new fee report endpoints
      if (endpoint === 'reports/fees/generate') {
        try {
          console.log('Generating fee report PDF with params:', params)

          // Validate required parameters
          if (!params.sessionId || !params.schoolId) {
            throw new Error('Session ID and School ID are required')
          }

          if (!params.reportType) {
            throw new Error('Report type is required')
          }

          const response = await apiReportClient.request({
            url: 'reports/fees/generate',
            method: 'POST',
            data: params,
            responseType: 'blob',
            timeout: 60000, // 60 second timeout for report generation
          })

          console.log('Fee report PDF generated successfully')

          // Validate response
          if (!response.data || !(response.data instanceof Blob)) {
            throw new Error('Invalid response: Expected PDF blob')
          }

          // Check if blob has content
          if (response.data.size === 0) {
            throw new Error('Empty PDF received - no data found for selected criteria')
          }

          return response
        } catch (error) {
          console.error('Error generating fee report PDF:', error)
          throw this.handleApiError(error)
        }
      }

      // Validate required parameters for legacy endpoints
      if (!params.sessionId || !params.schoolId) {
        throw new Error('Session ID and School ID are required')
      }

      const response = await apiReportClient.request({
        url: endpoint,
        method: 'POST',
        data: params,
        responseType: 'blob',
        timeout: 60000, // 60 second timeout
      })

      console.log('PDF download response received')

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
      throw this.handleApiError(error)
    }
  },

  // ============ GENERIC API METHODS ============

  /**
   * Generic POST method
   */
  post: async (endpoint, data = {}) => {
    try {
      console.log(`Making POST request to ${endpoint}`)
      const response = await apiReportClient.post(endpoint, data)
      return response
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error)
      throw this.handleApiError(error)
    }
  },

  /**
   * Generic GET method
   */
  get: async (endpoint, config = {}) => {
    try {
      console.log(`Making GET request to ${endpoint}`)
      const response = await apiReportClient.get(endpoint, config)
      return response.data
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error)
      throw this.handleApiError(error)
    }
  },

  // ============ PREVIEW METHODS ============

  /**
   * Generic preview method (maintained for backward compatibility)
   */
  previewReport: async (endpoint, params) => {
    try {
      console.log('Getting report preview for endpoint:', endpoint)

      // Handle new fee report preview
      if (endpoint.includes('fees')) {
        return await this.getFeeReportPreview(params)
      }

      // Legacy preview handling
      const previewEndpoint = endpoint.replace(/\/(allStudent|allFees|allAccount)$/, '/preview')
      const response = await apiReportClient.post(previewEndpoint, params)
      return response.data
    } catch (error) {
      console.error(`Error getting report preview from ${endpoint}:`, error)
      throw this.handleApiError(error)
    }
  },

  // ============ STUDENT REPORTS (Legacy Support) ============

  /**
   * Generate student report PDF
   */
  generateStudentReportPdf: async (params) => {
    try {
      const response = await apiReportClient.request({
        url: 'reports/student/allStudent',
        method: 'POST',
        data: params,
        responseType: 'blob',
        timeout: 60000,
      })
      return response
    } catch (error) {
      console.error('Error generating student report PDF:', error)
      throw this.handleApiError(error)
    }
  },

  /**
   * Get student report preview
   */
  getStudentReportPreview: async (params) => {
    try {
      const response = await apiReportClient.post('reports/student/preview', params)
      return response.data
    } catch (error) {
      console.error('Error getting student report preview:', error)
      throw this.handleApiError(error)
    }
  },

  // ============ ACCOUNT REPORTS (Legacy Support) ============

  /**
   * Generate account report PDF
   */
  generateAccountReportPdf: async (params) => {
    try {
      const response = await apiReportClient.request({
        url: 'reports/account/allAccount',
        method: 'POST',
        data: params,
        responseType: 'blob',
        timeout: 60000,
      })
      return response
    } catch (error) {
      console.error('Error generating account report PDF:', error)
      throw this.handleApiError(error)
    }
  },

  /**
   * Get account report preview
   */
  getAccountReportPreview: async (params) => {
    try {
      const response = await apiReportClient.post('reports/account/preview', params)
      return response.data
    } catch (error) {
      console.error('Error getting account report preview:', error)
      throw this.handleApiError(error)
    }
  },

  // ============ UTILITY METHODS ============

  /**
   * Get available report types
   */
  getReportTypes: async () => {
    try {
      const response = await apiReportClient.get('reports/types')
      return response.data
    } catch (error) {
      console.error('Error getting report types:', error)
      throw this.handleApiError(error)
    }
  },

  /**
   * Validate report parameters
   */
  validateReportParams: (params) => {
    const errors = []

    if (!params.sessionId) {
      errors.push('Session ID is required')
    }
    if (!params.schoolId) {
      errors.push('School ID is required')
    }
    if (!params.reportType) {
      errors.push('Report type is required')
    }

    // Fee report specific validations
    if (params.reportType && params.reportType.includes('fees-collection')) {
      if (!params.fromDate || !params.toDate) {
        errors.push('Date range is required for fee collection reports')
      }
      if (params.fromDate && params.toDate && new Date(params.fromDate) > new Date(params.toDate)) {
        errors.push('From date cannot be greater than To date')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  },

  /**
   * Enhanced error handling
   */
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          // Try to extract error message from response
          if (typeof data === 'string') {
            return new Error(`Validation Error: ${data}`)
          } else if (data && data.message) {
            return new Error(`Validation Error: ${data.message}`)
          }
          return new Error('Bad Request: Please check your input parameters')

        case 401:
          return new Error('Unauthorized: Please login again')

        case 403:
          return new Error('Forbidden: You do not have permission to generate this report')

        case 404:
          if (error.config?.url?.includes('preview')) {
            return new Error('No data found for the selected criteria')
          }
          return new Error('Report endpoint not found')

        case 500:
          return new Error('Server error: Please try again later or contact support')

        default:
          return new Error(`Server error (${status}): ${error.response.statusText}`)
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error: Please check your internet connection')
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return new Error('Request timeout: The report is taking too long to generate')
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred')
    }
  },

  // ============ PDF UTILITY METHODS ============

  /**
   * Create download link for PDF blob
   */
  createPdfDownloadLink: (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  },

  /**
   * Open PDF in new window
   */
  openPdfInNewWindow: (blob, filename = 'report.pdf') => {
    const pdfUrl = window.URL.createObjectURL(blob)

    const newWindow = window.open(
      pdfUrl,
      '_blank',
      'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800',
    )

    if (!newWindow) {
      // Fallback to download if popup blocked
      this.createPdfDownloadLink(blob, filename)
      throw new Error('Pop-up blocked! The file has been downloaded instead.')
    } else {
      newWindow.document.title = filename
      // Clean up URL after 10 seconds
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl)
      }, 10000)
    }

    return newWindow
  },

  /**
   * Generate filename for report
   */
  generateReportFilename: (reportType, extension = 'pdf') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
    const cleanReportType = reportType.replace(/-/g, '_')
    return `${cleanReportType}_${timestamp}.${extension}`
  },
}

export default reportManagementApi
