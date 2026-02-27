/**
 * schoolManagementApi
 *
 * New school-profile endpoints (new API contract):
 *   GET    /admin/school/        → school profile
 *   PUT    /admin/school/        → full update
 *   PATCH  /admin/school/        → partial update
 *   GET    /admin/school/setup/  → ERP config (read-only)
 *
 * Legacy CRUD methods (kept for backward compatibility with existing views
 * that have not yet been migrated to the new API):
 *   getAll / getById / create / update / delete → /school-management/{entity}/...
 */
import apiService from './apiService'

const schoolManagementApi = {
  // ── New school-profile methods ──────────────────────────────────────
  getSchool: () => apiService.get('/admin/school/'),
  updateSchool: (data) => apiService.put('/admin/school/', data),
  patchSchool: (data) => apiService.patch('/admin/school/', data),
  getSetup: () => apiService.get('/admin/school/setup/'),

  // ── Legacy CRUD (retained until views are migrated) ─────────────────
  getAll: (entity, params = {}) => apiService.get(`/school-management/${entity}`, params),
  getById: (entity, id) => apiService.get(`/school-management/${entity}/${id}`),
  create: (entity, data) => apiService.post(`/school-management/${entity}`, data),
  update: (entity, id, data) => apiService.put(`/school-management/${entity}/${id}`, data),
  delete: (entity, id) => apiService.delete(`/school-management/${entity}/${id}`),
}

export default schoolManagementApi
