import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const loginApi = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/admin/login`, credentials)
      return response.data // Returns the token or error message
    } catch (error) {
      console.error('Login API Error:', error.response || error)
      throw error
    }
  },
}

export default loginApi
