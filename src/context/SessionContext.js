import { createContext, useState } from 'react'

/**
 * SessionContext
 *
 * Stores the currently selected academic session after login.
 *
 * localStorage keys:
 *   session_id   → numeric rec_id of the selected session  (sent in every API request header)
 *   session_name → human-readable label, e.g. "2025-26"
 *
 * Consumers:
 *   - AppHeader  → reads sessions list, calls setCurrentSession on user change
 *   - apiService → reads localStorage 'session_id' and injects X-Session-Id header
 */
export const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(
    () => localStorage.getItem('session_id') || '',
  )
  const [sessionName, setSessionName] = useState(
    () => localStorage.getItem('session_name') || '',
  )

  /**
   * Persist a newly-selected session.
   * @param {number|string} recId   - session rec_id from the API
   * @param {string}        name    - human-readable session label (e.g. "2025-26")
   */
  const setCurrentSession = (recId, name) => {
    const id = String(recId)
    localStorage.setItem('session_id', id)
    localStorage.setItem('session_name', name)
    setSessionId(id)
    setSessionName(name)
  }

  return (
    <SessionContext.Provider value={{ sessionId, sessionName, setCurrentSession }}>
      {children}
    </SessionContext.Provider>
  )
}
