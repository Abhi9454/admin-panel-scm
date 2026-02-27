import axios from 'axios'
import { BASE_URL } from 'src/config/constant'

const loginApi = {
  /**
   * POST /auth/staff/login/
   * @param {{ school_code: string, user_id: string, password: string }} credentials
   * @returns {{ access, refresh, user_type, username, user_name, school_code, is_admin }}
   */
  login: async (credentials) => {
    const response = await axios.post(`${BASE_URL}/api/auth/staff/login/`, credentials)
    return response.data
  },

  /**
   * POST /auth/staff/logout/
   * Requires Authorization header — uses stored token directly.
   */
  logout: async () => {
    const token = localStorage.getItem('access_token')
    await axios.post(
      `${BASE_URL}/api/auth/staff/logout/`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
  },
}

export default loginApi
