import React from 'react'
import { CButton, CSpinner } from '@coreui/react'

export const LoadingButton = React.memo(
  ({
    loading = false,
    children,
    loadingText = 'Loading...',
    disabled = false,
    size = 'md',
    spinnerSize = 'sm',
    className = '',
    'aria-label': ariaLabel,
    ...props
  }) => {
    const isDisabled = loading || disabled

    // Get proper spinner size based on button size
    const getSpinnerSize = () => {
      // Use spinnerSize prop if provided, otherwise map from button size
      if (spinnerSize !== 'sm') return spinnerSize

      switch (size) {
        case 'sm':
          return 'sm'
        case 'lg':
          return 'md' // Use medium spinner for large buttons
        default:
          return 'sm'
      }
    }

    if (loading) {
      return (
        <CButton
          disabled={true}
          className={`d-flex align-items-center justify-content-center ${className}`}
          aria-label={ariaLabel || loadingText}
          size={size}
          {...props}
        >
          <CSpinner variant="border" size={getSpinnerSize()} className="me-2" aria-hidden="true" />
          <span>{loadingText}</span>
        </CButton>
      )
    }

    return (
      <CButton
        disabled={isDisabled}
        className={className}
        size={size}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </CButton>
    )
  },
)

LoadingButton.displayName = 'LoadingButton'
