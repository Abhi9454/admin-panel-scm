import React from 'react'
import { CAlert } from '@coreui/react'

export const Alert = React.memo(
  ({ children, variant = 'info', dismissible = false, onDismiss, className = '', ...props }) => (
    <CAlert
      color={variant}
      dismissible={dismissible}
      onClose={onDismiss}
      className={className}
      {...props}
    >
      {children}
    </CAlert>
  ),
)

Alert.displayName = 'Alert'
