/**
 * teacherManagementApi — Teacher Management endpoints (Admin).
 *
 * Teacher List & Profile
 *   GET    /admin/teachers/                      → paginated list (admin)
 *   GET    /admin/teacher/{emp_code}/profile/   → full profile (admin)
 *   PATCH  /admin/teacher/{emp_code}/profile/   → update profile (admin)
 *
 * Teacher Class Assignments
 *   GET    /admin/teacher-assignments/          → list all assignments
 *   GET    /admin/teacher-assignments/{id}/     → single assignment
 *   POST   /admin/teacher-assignments/          → create assignment
 *   PATCH  /admin/teacher-assignments/{id}/     → update assignment
 *   DELETE /admin/teacher-assignments/{id}/     → delete assignment
 *   POST   /admin/teacher-assignments/assign-subject/ → bulk subject assign
 *   DELETE /admin/teacher-assignments/{id}/unassign-subject/ → unassign
 *   GET    /admin/teacher/{emp_code}/subjects/  → subjects by class
 *
 * Teacher Attendance
 *   GET    /admin/staff-attendance/             → list records
 *   POST   /admin/staff-attendance/mark/        → mark attendance
 *   PATCH  /admin/staff-attendance/{id}/        → update record
 *   GET    /admin/staff-attendance/summary/     → summary stats
 *
 * Subjects
 *   GET    /admin/subjects/                     → list all subjects
 */
import apiService from './apiService'

const teacherManagementApi = {
  // ── Teacher List & Profile ──────────────────────────────────────────────

  /**
   * Fetch paginated teacher list.
   * @param {Object} params — { page, page_size, search, department_id, designation_id, status, ordering }
   */
  getAll: (params = {}) => apiService.get('/admin/teachers/', params),

  /**
   * Quick search teachers.
   * @param {Object} params — { q, limit }
   */
  search: (params = {}) => apiService.get('/admin/teachers/search/', params),

  /** Fetch full profile for a specific teacher by emp_code (admin). */
  getProfile: (empCode) => apiService.get(`/admin/teacher/${empCode}/profile/`),

  /** Partial update of a teacher profile (admin only). */
  updateProfile: (empCode, data) => apiService.patch(`/admin/teacher/${empCode}/profile/`, data),

  // ── Teacher Class Assignments ───────────────────────────────────────────

  /** List all teacher-class assignments with optional filters. */
  getAssignments: (params = {}) => apiService.get('/admin/teacher-assignments/', params),

  /** Get a single assignment by ID. */
  getAssignment: (id) => apiService.get(`/admin/teacher-assignments/${id}/`),

  /** Create a new teacher-class assignment. */
  createAssignment: (data) => apiService.post('/admin/teacher-assignments/', data),

  /** Update an existing assignment (subject_id, incharge). */
  updateAssignment: (id, data) => apiService.patch(`/admin/teacher-assignments/${id}/`, data),

  /** Delete a teacher-class assignment. */
  deleteAssignment: (id) => apiService.delete(`/admin/teacher-assignments/${id}/`),

  /** Bulk assign subjects to a teacher for a class/section. */
  assignSubjects: (data) =>
    apiService.post('/admin/teacher-assignments/assign-subject/', data),

  /** Unassign a subject from a teacher. */
  unassignSubject: (id) =>
    apiService.delete(`/admin/teacher-assignments/${id}/unassign-subject/`),

  /** Get all subjects assigned to a teacher, optionally filtered by class/section. */
  getTeacherSubjects: (empCode, params = {}) =>
    apiService.get(`/admin/teacher/${empCode}/subjects/`, params),

  // ── Teacher Attendance ─────────────────────────────────────────────────

  /**
   * List staff attendance records.
   * @param {Object} params — { emp_code, from_date, to_date, status, page, page_size }
   */
  getAttendance: (params = {}) => apiService.get('/admin/staff-attendance/', params),

  /**
   * Mark attendance for a teacher.
   * @param {Object} data — { emp_code, attendance_date, status, check_in_time, check_out_time, remarks }
   */
  markAttendance: (data) => apiService.post('/admin/staff-attendance/mark/', data),

  /** Update an existing attendance record. */
  updateAttendance: (id, data) => apiService.patch(`/admin/staff-attendance/${id}/`, data),

  /**
   * Get attendance summary for a teacher.
   * @param {Object} params — { emp_code, from_date, to_date }
   */
  getAttendanceSummary: (params = {}) =>
    apiService.get('/admin/staff-attendance/summary/', params),

  // ── Subjects ───────────────────────────────────────────────────────────

  /** List all available subjects. */
  getSubjects: (params = {}) => apiService.get('/admin/subjects/', params),
}

export default teacherManagementApi
