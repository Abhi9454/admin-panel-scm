import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const accountManagementApi = {
  request: async (method, entity, data = {}, params = {}) => {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}/api/account/${entity}`,
        data,
        params,
      })
      return response.data
    } catch (error) {
      console.error(`Error in ${method} ${entity}:`, error.response || error)
      throw error
    }
  },

  getAll: (entity, params = {}) => accountManagementApi.request('get', entity),

  getById: (entity, id) => accountManagementApi.request('get', `${entity}/${id}`),

  create: (entity, data) => accountManagementApi.request('post', entity, data),

  update: (entity, id, data) => accountManagementApi.request('put', `${entity}/${id}`, data),

  delete: (entity, id) => accountManagementApi.request('delete', `${entity}`),
}

export default accountManagementApi
