/**
 * studentManagementApi — Student Management endpoints.
 *
 * GET    /admin/students/              → paginated list (any staff)
 * POST   /admin/students/             → add student (admin)
 * GET    /admin/students/{adm_no}/    → full profile (any staff)
 * PATCH  /admin/students/{adm_no}/    → partial update (admin)
 * POST   /admin/students/import/      → bulk Excel import (admin, multipart)
 *
 * List query params: page, page_size, q, class_id, section_id, session_id, std_status
 * List response: { count, next, previous, results: [...] }
 */
import apiService from './apiService'

const studentManagementApi = {
  /**
   * Fetch paginated student list.
   * @param {Object} params — { page, page_size, q, class_id, section_id, session_id, std_status }
   */
  getAll: (params = {}) => apiService.get('/admin/students/', params),

  /** Fetch full profile for a single student by admission number. */
  getByAdmNo: (admNo) => apiService.get(`/admin/students/${admNo}/`),

  /** Add a new student (admin only). */
  create: (data) => apiService.post('/admin/students/', data),

  /** Partial update of a student (admin only). */
  patch: (admNo, data) => apiService.patch(`/admin/students/${admNo}/`, data),

  /**
   * Bulk import students from an Excel file.
   * @param {File} file — .xlsx file object
   */
  importExcel: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiService.post('/admin/students/import/', formData)
  },
}

export default studentManagementApi
