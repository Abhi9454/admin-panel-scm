import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const receiptManagementApi = {
  request: async (method, entity, data = {}, params = {}) => {
    try {
      const response = await axios({
        method,
        url: `${BASE_URL}/api/receipt/${entity}`,
        data,
        params,
      })
      return response.data
    } catch (error) {
      console.error(`Error in ${method} ${entity}:`, error.response || error)
      throw error
    }
  },

  getAll: (entity, params = {}) => receiptManagementApi.request('get', entity, {}, params),

  getById: (entity, id) => receiptManagementApi.request('get', `${entity}/${id}`),

  create: (entity, data) => receiptManagementApi.request('post', entity, data),

  update: (entity, id, data) => receiptManagementApi.request('put', `${entity}/${id}`, data),

  delete: (entity, id) => receiptManagementApi.request('delete', `${entity}`),
}

export default receiptManagementApi
