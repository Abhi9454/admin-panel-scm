import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'

const Announcements = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Announcements</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary">Announcements management coming soon.</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Announcements
