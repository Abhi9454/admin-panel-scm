import axios from 'axios'

const BASE_URL =
  'https://scm-application-265748053527.asia-southeast1.run.app/api/school-management' // Update with your backend URL

const schoolManagementApi = {
  request: async (method, entity, data = {}, params = {}) => {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}/${entity}`,
        data,
        params,
      })
      return response.data
    } catch (error) {
      console.error(`Error in ${method} ${entity}:`, error.response || error)
      throw error
    }
  },

  getAll: (entity, params = {}) => schoolManagementApi.request('get', entity, {}, params),

  getById: (entity, id) => schoolManagementApi.request('get', `${entity}/${id}`),

  create: (entity, data) => schoolManagementApi.request('post', entity, data),

  update: (entity, id, data) => schoolManagementApi.request('put', `${entity}/${id}`, data),

  delete: (entity, id) => schoolManagementApi.request('delete', `${entity}`),
}

export default schoolManagementApi
