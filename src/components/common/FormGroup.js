import React from 'react'
import { CRow, CCol } from '@coreui/react'

export const FormGroup = React.memo(
  ({
    children,
    label,
    required = false,
    className = 'mb-3',
    labelClassName = 'form-label',
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
  }) => (
    <CRow className={className}>
      {label && (
        <CCol xs={12} className="mb-2">
          <label className={labelClassName}>
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        </CCol>
      )}
      <CCol xs={xs} sm={sm} md={md} lg={lg} xl={xl} xxl={xxl}>
        {children}
      </CCol>
    </CRow>
  ),
)

FormGroup.displayName = 'FormGroup'
