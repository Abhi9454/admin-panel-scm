import { createContext, useState, useEffect } from 'react'

// Create AuthContext
export const AuthContext = createContext()

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '')

  // Save token to localStorage when updated
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken)
    } else {
      localStorage.removeItem('token')
    }
  }, [authToken])

  return <AuthContext.Provider value={{ authToken, setAuthToken }}>{children}</AuthContext.Provider>
}
