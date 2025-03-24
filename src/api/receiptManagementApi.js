import apiService from './apiService'

const schoolManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/receipt/${entity}`, params),

  getById: (entity, id) => apiService.get(`/receipt/${entity}/${id}`),

  create: (entity, data) => apiService.post(`/receipt/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/receipt/${entity}/${id}`, data),

  delete: (entity, id) => apiService.delete(`/receipt/${entity}/${id}`),
}

export default schoolManagementApi
