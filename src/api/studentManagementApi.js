import apiService from './apiService'

const studentManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/student/${entity}`, params),

  getById: (entity, id) => apiService.get(`/student/${entity}/${id}`),

  create: (entity, data) => apiService.post(`/student/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/student/${entity}/${id}`, data),

  delete: (entity, id) => apiService.delete(`/student/${entity}/${id}`),

  fetch: (entity, data) => apiService.request('post', '/student', data),
}

export default studentManagementApi
