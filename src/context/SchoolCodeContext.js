import { createContext, useState, useEffect } from 'react'

// Create AuthContext
export const SchoolCodeContext = createContext()

export const SchoolCodeProvider = ({ children }) => {
  const [schoolCode, setSchoolCode] = useState(localStorage.getItem('schoolCode') || '')

  // Save token to localStorage when updated
  useEffect(() => {
    if (schoolCode) {
      localStorage.setItem('schoolCode', schoolCode)
    } else {
      localStorage.removeItem('schoolCode')
    }
  }, [schoolCode])

  return (
    <SchoolCodeContext.Provider value={{ schoolCode, setSchoolCode }}>
      {children}
    </SchoolCodeContext.Provider>
  )
}
