/**
 * masterApi — CRUD for all ten master/lookup tables.
 *
 * Supported resource segments:
 *   classes | sections | groups | hostels | cities | states | localities |
 *   parent-departments | parent-designations |
 *   parent-educations  | parent-professions
 *
 * Response shape (list): { count, results: [{ id, title, seq_order }] }
 * Response shape (item): { id, title, seq_order }
 */
import apiService from './apiService'

const masterApi = {
  /** GET /admin/{resource}/ — full list, no pagination */
  getAll: (resource) => apiService.get(`/admin/${resource}/`),

  /** GET /admin/{resource}/{id}/ */
  getById: (resource, id) => apiService.get(`/admin/${resource}/${id}/`),

  /** POST /admin/{resource}/  — body: { title, seq_order } */
  create: (resource, data) => apiService.post(`/admin/${resource}/`, data),

  /** PUT /admin/{resource}/{id}/ */
  update: (resource, id, data) => apiService.put(`/admin/${resource}/${id}/`, data),

  /** PATCH /admin/{resource}/{id}/ */
  patch: (resource, id, data) => apiService.patch(`/admin/${resource}/${id}/`, data),

  /** DELETE /admin/{resource}/{id}/ → 204 */
  delete: (resource, id) => apiService.delete(`/admin/${resource}/${id}/`),
}

export default masterApi
