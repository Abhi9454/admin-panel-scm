import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const studentManagementApi = {
  request: async (method, data = {}, params = {}) => {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}/api/student/${data}`,
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
}

export default studentManagementApi
