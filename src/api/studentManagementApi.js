import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const studentManagementApi = {
  request: async (method, entity, data = {}, params = {}) => {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}/api/student/${entity}`,
        data,
        params,
      })
      return response.data
    } catch (error) {
      console.error(`Error in ${method}:`, error.response || error)
      throw error
    }
  },

  getAll: (entity, params = {}) => studentManagementApi.request('get', entity, {}, params),

  getById: (id) => studentManagementApi.request('get', `${id}`),

  create: (entity, data) => studentManagementApi.request('post', entity, data),

  update: (entity, id, data) => studentManagementApi.request('put', `${entity}/${id}`, data),

  delete: (entity, id) => studentManagementApi.request('delete', `${entity}`),

  fetch: (entity, data) => studentManagementApi.request('post', entity, data),
}

export default studentManagementApi
