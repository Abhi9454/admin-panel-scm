import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'

const SchoolNews = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>School News</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary">School News management coming soon.</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SchoolNews
