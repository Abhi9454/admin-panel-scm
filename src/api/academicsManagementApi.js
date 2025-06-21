import apiService from './apiService'

const academicsManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/academics-management/${entity}`, params),

  getById: (entity, id) => apiService.get(`/academics-management/${entity}/${id}`),

  create: (entity, data) => apiService.post(`/academics-management/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/academics-management/${entity}/${id}`, data),

  delete: (entity, id) => apiService.delete(`/academics-management/${entity}/${id}`),
}

export default academicsManagementApi
