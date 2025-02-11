import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'

const AddNotification = () => {
  const [activeTab, setActiveTab] = useState('parents')
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Notification</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Notification Details</p>
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="dateAdded">Date Added</CFormLabel>
                <CFormInput type="date" id="dateAdded" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validDate">Valid Upto date</CFormLabel>
                <CFormInput type="date" id="validDate" />
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="heading">Heading</CFormLabel>
                <CFormInput type="text" id="heading" />
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="heading">Content</CFormLabel>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="class">Status</CFormLabel>
                <CFormSelect id="class">
                  <option>Activate</option>
                  <option>Deactivate</option>
                </CFormSelect>
              </CCol>
              <div className="mb-3">
                <CFormLabel htmlFor="formFile">Notification Photo</CFormLabel>
                <CFormInput type="file" id="notificationPhoto" />
              </div>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Add Notification
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddNotification
