import apiService from './apiService'

const schoolManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/school-management/${entity}`, params),

  getById: (entity, id) => apiService.get(`/school-management/${entity}/${id}`),

  create: (entity, data) => apiService.post(`/school-management/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/school-management/${entity}/${id}`, data),

  delete: (entity, id) => apiService.delete(`/school-management/${entity}/${id}`),
}

export default schoolManagementApi
