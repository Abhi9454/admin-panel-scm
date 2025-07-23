import { useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export const useAuth = () => {
  const navigate = useNavigate()
  const { authToken, setAuthToken, user, setUser } = useContext(AuthContext)

  const login = useCallback(
    (token, userData) => {
      // Store token securely
      if (token) {
        localStorage.setItem('authToken', token)
        setAuthToken(token)
      }

      if (userData) {
        setUser(userData)
      }
    },
    [setAuthToken, setUser],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    setAuthToken(null)
    setUser(null)
    navigate('/initialise', { replace: true })
  }, [setAuthToken, setUser, navigate])

  const isAuthenticated = useCallback(() => {
    return !!authToken
  }, [authToken])

  return {
    authToken,
    user,
    login,
    logout,
    isAuthenticated,
  }
}
