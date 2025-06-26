import apiService from './apiService'

const transportManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/transport-management/${entity}`, params),

  getById: (entity, id) => apiService.get(`/transport-management/${entity}/${id}`),

  create: (entity, data) => apiService.post(`/transport-management/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/transport-management/${entity}/${id}`, data),

  delete: (entity, id) => apiService.delete(`/transport-management/${entity}/${id}`),
}

export default transportManagementApi
