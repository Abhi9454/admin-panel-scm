import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormTextarea,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react'
import studentManagementApi from 'src/api/studentManagementApi' // Import API service

const StudentLeftDate = () => {
  const [formData, setFormData] = useState({
    admissionNumber: '',
    leftDate: '',
    tcDate: '',
    leftRemarks: '',
  })

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await studentManagementApi.update(
        'left-information',
        formData.admissionNumber,
        formData,
      )
      alert('Student left date updated successfully!')
      console.log('API Response:', response)
    } catch (error) {
      console.error('Error updating student left date:', error)
      alert('Failed to update student left date!')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Update Student Left Date</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Update Student Left Date</p>
            <CForm className="row g-3" onSubmit={handleSubmit}>
              <CCol md={10}>
                <CFormLabel htmlFor="admissionNumber">Enter Admission Number</CFormLabel>
                <CFormInput
                  type="text"
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="leftDate">Left Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="leftDate"
                  value={formData.leftDate}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="tcDate">TC Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="tcDate"
                  value={formData.tcDate}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={10}>
                <CFormLabel htmlFor="leftRemarks">Enter Remarks</CFormLabel>
                <CFormTextarea
                  type="text"
                  id="leftRemarks"
                  value={formData.leftRemarks}
                  onChange={handleChange}
                />
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
