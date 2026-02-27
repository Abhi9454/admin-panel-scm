/**
 * studentLoginApi — Student Login Management endpoints (admin only).
 *
 * GET    /admin/students/{adm_no}/login/                  → login details
 * POST   /admin/students/{adm_no}/login/reset-password/   → reset password
 * POST   /admin/students/{adm_no}/login/toggle/           → activate/lock account
 * GET    /admin/student-logins/                           → paginated list of all logins
 */
import apiService from './apiService'

const studentLoginApi = {
  /** Fetch login details for a student. */
  getLogin: (admNo) => apiService.get(`/admin/students/${admNo}/login/`),

  /**
   * Reset student password.
   * @param {string} admNo
   * @param {string|null} newPassword — omit to reset to adm_no
   */
  resetPassword: (admNo, newPassword = null) => {
    const body = newPassword ? { new_password: newPassword } : {}
    return apiService.post(`/admin/students/${admNo}/login/reset-password/`, body)
  },

  /**
   * Toggle account active/locked state.
   * @param {string} admNo
   * @param {{ is_active?: boolean, is_locked?: boolean }} flags
   */
  toggle: (admNo, flags) => apiService.post(`/admin/students/${admNo}/login/toggle/`, flags),

  /**
   * Paginated list of all student login records.
   * @param {Object} params — { page, is_active, is_locked, q }
   */
  getAllLogins: (params = {}) => apiService.get('/admin/student-logins/', params),
}

export default studentLoginApi
