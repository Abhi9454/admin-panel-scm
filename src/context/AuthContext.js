import { createContext, useState } from 'react'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('access_token') || '')
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('is_admin') === 'true')
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '')

  const saveSession = (data) => {
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('is_admin', data.is_admin)
    localStorage.setItem('user_name', data.user_name)
    localStorage.setItem('school_code', data.school_code)
    setAuthToken(data.access)
    setIsAdmin(data.is_admin)
    setUserName(data.user_name)
  }

  const clearSession = () => {
    localStorage.clear()
    setAuthToken('')
    setIsAdmin(false)
    setUserName('')
  }

  return (
    <AuthContext.Provider value={{ authToken, isAdmin, userName, saveSession, clearSession, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  )
}
