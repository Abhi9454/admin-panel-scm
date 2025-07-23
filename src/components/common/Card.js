import React from 'react'
import { CCard, CCardBody } from '@coreui/react'

export const Card = React.memo(
  ({ children, className = '', bodyClassName = '', style, ...props }) => (
    <CCard className={className} style={style} {...props}>
      <CCardBody className={bodyClassName}>{children}</CCardBody>
    </CCard>
  ),
)

Card.displayName = 'Card'
