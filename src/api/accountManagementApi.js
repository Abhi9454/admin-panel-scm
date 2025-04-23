import apiService from 'src/api/apiService'

const accountManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/account/${entity}`, params),

  getById: (entity, id) => apiService.get(`/account/${entity}/${id}`),

  create: (entity, data) => apiService.post(`/account/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/account/${entity}/${id}`, data),

  delete: (id) => apiService.delete(`/account/${id}`),
}

export default accountManagementApi
