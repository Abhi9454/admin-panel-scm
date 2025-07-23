import { useState, useCallback, useRef } from 'react'

export const useApiCall = (options = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const abortControllerRef = useRef(null)

  const { onSuccess, onError, timeout = 30000, retries = 0 } = options

  const executeCall = useCallback(
    async (apiFunction, errorMessage = 'An error occurred') => {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError('')
      setData(null)

      let attempts = 0
      const maxAttempts = retries + 1

      while (attempts < maxAttempts) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout),
          )

          const result = await Promise.race([
            apiFunction(abortControllerRef.current.signal),
            timeoutPromise,
          ])

          setData(result)
          if (onSuccess) onSuccess(result)
          return result
        } catch (error) {
          attempts++

          if (error.name === 'AbortError') {
            // Request was cancelled
            break
          }

          if (attempts >= maxAttempts) {
            const finalError = error.response?.data?.message || error.message || errorMessage
            setError(finalError)
            if (onError) onError(error)
            throw error
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
        }
      }
    },
    [onSuccess, onError, timeout, retries],
  )

  const clearError = useCallback(() => setError(''), [])
  const clearData = useCallback(() => setData(null), [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    executeCall,
    clearError,
    clearData,
    cancel,
  }
}
