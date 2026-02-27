import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'

const Gallery = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Gallery</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary">Gallery management coming soon.</p>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Gallery
