import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const teacherAuthApi = {
  /**
   * POST /api/auth/teacher/login/
   * @param {{ school_code: string, user_id: string, password: string }} credentials
   * @returns {{ access, refresh, user_type, username, user_name, school_code, emp_code, is_admin }}
   */
  login: async (credentials) => {
    const response = await axios.post(`${BASE_URL}/api/auth/teacher/login/`, credentials)
    return response.data
  },

  /**
   * POST /api/auth/teacher/logout/
   * Requires Authorization header — uses stored token directly.
   */
  logout: async () => {
    const token = localStorage.getItem('access_token')
    await axios.post(
      `${BASE_URL}/api/auth/teacher/logout/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
  },

  /**
   * POST /api/auth/token/refresh/
   * @param {{ refresh: string }} data
   * @returns {{ access: string }}
   */
  refreshToken: async (data) => {
    const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, data)
    return response.data
  },
}

export default teacherAuthApi
