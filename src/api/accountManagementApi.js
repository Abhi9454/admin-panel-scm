import apiService from 'src/api/apiService'

const accountManagementApi = {
  getAll: (params = {}) => apiService.get('/account', params),

  getById: (id) => apiService.get(`/account/${id}`),

  create: (data) => apiService.post('/account', data),

  update: (id, data) => apiService.put(`/account/${id}`, data),

  delete: (id) => apiService.delete(`/account/${id}`),
}

export default accountManagementApi
