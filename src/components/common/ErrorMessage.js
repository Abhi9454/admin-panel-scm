import React from 'react'

export const ErrorMessage = React.memo(
  ({
    error,
    className = 'mt-2 text-danger',
    id,
    role = 'alert',
    'aria-live': ariaLive = 'polite',
  }) => {
    if (!error) return null

    return (
      <p className={`error-message ${className}`} id={id} role={role} aria-live={ariaLive}>
        {error}
      </p>
    )
  },
)

ErrorMessage.displayName = 'ErrorMessage'
