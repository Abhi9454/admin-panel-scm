import apiService from './apiService'

const importManagementApi = {
  getAll: (entity, params = {}) => apiService.get(`/import/${entity}`, params),

  getById: (entity, id) => apiService.get(`/import/${entity}/${id}`),

  create: (entity, data, config = {}) => {
    // Handle multipart form data specially
    if (data instanceof FormData) {
      // For multipart data, we need to completely override the default headers
      const multipartConfig = {
        ...config,
        headers: {
          // Remove Content-Type entirely - let the browser set it with boundary
          // Keep other headers but remove Content-Type
          ...Object.fromEntries(
            Object.entries(config.headers || {}).filter(([key]) =>
              key.toLowerCase() !== 'content-type'
            )
          ),
        },
      }

      console.log('Sending FormData with config:', multipartConfig);
      return apiService.post(`/import/${entity}`, data, multipartConfig)
    }
    return apiService.post(`/import/${entity}`, data, config)
  },

  fetch: (entity, data) => apiService.post(`/import/${entity}`, data),

  update: (entity, id, data) => apiService.put(`/import/${entity}/${id}`, data),

  delete: (entity, id) => apiService.delete(`/import/${entity}/${id}`),
}

export default importManagementApi
