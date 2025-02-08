import React, {useState} from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

const StudentLeftDate = () => {
  const [activeTab, setActiveTab] = useState('parents')
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Update Student Left Date</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Update Student Left Date</p>
            <CForm className="row g-3">
              <CCol md={10}>
                <CFormLabel htmlFor="admissionNumber">Enter Admission Number</CFormLabel>
                <CFormInput type="text" id="admissionNumber" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="leftdate">Left Date</CFormLabel>
                <CFormInput type="date" id="leftdate" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tcdate">TC Date</CFormLabel>
                <CFormInput type="date" id="tcdate" />
              </CCol>
              <CCol md={10}>
                <CFormLabel htmlFor="enterRemarks">Enter Remarks</CFormLabel>
                <CFormTextarea type="text" id="enterRemarks" />
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Update Details
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentLeftDate
