/**
 * staffManagementApi — Staff & Teacher Management endpoints (Admin).
 *
 * Staff & Teacher List & Profile
 *   GET    /admin/teachers/                      → paginated list (admin)
 *   GET    /admin/teacher/{emp_code}/profile/    → full profile (admin)
 *   PATCH  /admin/teacher/{emp_code}/profile/update/ → update profile (admin)
 *   POST   /admin/teachers/create/                → create staff/teacher (admin)
 *
 * Staff/Teacher Calendar
 *   GET    /admin/staff-calendar/                      → staff calendar list
 *   GET    /employee/calendar/                         → employee calendar list
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
 * Teacher/Staff Attendance
 *   GET    /admin/staff-attendance/             → list records
 *   POST   /admin/staff-attendance/mark/        → mark attendance
 *   PATCH  /admin/staff-attendance/{id}/        → update record
 *   GET    /admin/staff-attendance/summary/     → summary stats
 *
 * Subjects
 *   GET    /admin/subjects/                     → list all subjects
 */
import apiService from './apiService'

const staffManagementApi = {
  // ── Staff/Teacher List & Profile ──────────────────────────────────────────

  /**
   * Fetch paginated staff/teacher list.
   * @param {Object} params — { page, page_size, search, department_id, designation_id, status, ordering, user_type }
   */
  getAll: (params = {}) => apiService.get('/admin/teachers/', params),

  /**
   * Add a new staff/teacher (admin only).
   * @param {Object} data — includes user_type: "teacher" | "staff"
   */
  create: (data) => apiService.post('/admin/teachers/create/', data),

  /**
   * Quick search staff/teachers.
   * @param {Object} params — { search, user_type }
   */
  search: (params = {}) => apiService.get('/admin/teachers/', params),

  /** Fetch full profile for a specific staff/teacher by emp_code (admin). */
  getProfile: (empCode) => apiService.get(`/admin/teacher/${empCode}/profile/`),

  /** Update of a staff/teacher profile (admin only). */
  updateProfile: (empCode, data) => apiService.patch(`/admin/teacher/${empCode}/profile/update/`, data),

  // ── Calendars ───────────────────────────────────────────────────────────

  /** Fetch staff calendar. */
  getCalendar: (params = {}) => apiService.get('/admin/staff-calendar/', params),

  /** Fetch employee calendar. */
  getEmployeeCalendar: (params = {}) => apiService.get('/employee/calendar/', params),

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

  // ── Teacher/Staff Attendance ────────────────────────────────────────────

  /**
   * List staff attendance records.
   * @param {Object} params — { emp_code, from_date, to_date, status, page, page_size }
   */
  getAttendance: (params = {}) => apiService.get('/admin/staff-attendance/', params),

  /**
   * Mark attendance for a teacher/staff.
   * @param {Object} data — { emp_code, attendance_date, status, check_in_time, check_out_time, remarks }
   */
  markAttendance: (data) => apiService.post('/admin/staff-attendance/mark/', data),

  /** Update an existing attendance record. */
  updateAttendance: (id, data) => apiService.patch(`/admin/staff-attendance/${id}/`, data),

  /**
   * Get attendance summary for a teacher/staff.
   * @param {Object} params — { emp_code, from_date, to_date }
   */
  getAttendanceSummary: (params = {}) =>
    apiService.get('/admin/staff-attendance/summary/', params),

  // ── Subjects ───────────────────────────────────────────────────────────

  /** List all available subjects. */
  getSubjects: (params = {}) => apiService.get('/admin/subjects/', params),

  // ── Subject Tables (CRUD) ────────────────────────────────────────────────
  getSubjectTables: (params = {}) => apiService.get('/subject-tables/', params),
  getSubjectTable: (id) => apiService.get(`/subject-tables/${id}/`),
  createSubjectTable: (data) => apiService.post('/subject-tables/', data),
  updateSubjectTable: (id, data) => apiService.patch(`/subject-tables/${id}/`, data),
  deleteSubjectTable: (id) => apiService.delete(`/subject-tables/${id}/`),

  // ── Teacher My-Assignments & Classes ─────────────────────────────────────
  getMyAssignments: () => apiService.get('/teacher/my-assignments/'),
  getMyClasses: () => apiService.get('/teacher/my-classes/'),
}

export default staffManagementApi
