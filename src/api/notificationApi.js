/**
 * notificationApi — Admin notification endpoints.
 *
 * Send
 *   POST /notifications/send/              → send to students
 *   POST /notifications/send-to-teachers/  → send to teachers
 *
 * Targeting / Picker
 *   GET /admin/notifications/students/     → student picker by class/section
 *
 * Categories & Templates
 *   GET /admin/notifications/categories/         → list categories
 *   GET /admin/notifications/templates/          → list SMS templates
 *   GET /admin/notifications/template-preview/   → fill placeholders for a student
 */
import apiService from './apiService'

const notificationApi = {
  // ── Send ─────────────────────────────────────────────────────────────────
  /** POST /notifications/send/ — send to students */
  sendToStudents: (data) => apiService.post('/notifications/send/', data),

  /** POST /notifications/send-to-teachers/ — send to teachers */
  sendToTeachers: (data) => apiService.post('/notifications/send-to-teachers/', data),

  // ── Student Picker ────────────────────────────────────────────────────────
  /**
   * GET /admin/notifications/students/
   * @param {number|string} class_id
   * @param {number|string|null} section_id
   */
  getStudentsByClass: (class_id, section_id = null) => {
    const params = { class_id }
    if (section_id) params.section_id = section_id
    return apiService.get('/admin/notifications/students/', params)
  },

  // ── Categories ────────────────────────────────────────────────────────────
  /** GET /admin/notifications/categories/ */
  getCategories: () => apiService.get('/admin/notifications/categories/'),

  // ── Templates ─────────────────────────────────────────────────────────────
  /** GET /admin/notifications/templates/ */
  getTemplates: () => apiService.get('/admin/notifications/templates/'),

  /**
   * GET /admin/notifications/template-preview/
   * @param {number} category_id
   * @param {string|null} adm_no — omit to get raw (un-filled) template
   */
  getTemplatePreview: (category_id, adm_no = null) => {
    const params = { category_id }
    if (adm_no) params.adm_no = adm_no
    return apiService.get('/admin/notifications/template-preview/', params)
  },
}

export default notificationApi
