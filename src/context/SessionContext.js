import { createContext, useState, useEffect } from 'react'

// Create AuthContext
export const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(localStorage.getItem('session') || '')

  // Save token to localStorage when updated
  useEffect(() => {
    if (session) {
      localStorage.setItem('session', session)
    } else {
      localStorage.removeItem('session')
    }
  }, [session])

  return (
    <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>
  )
}
