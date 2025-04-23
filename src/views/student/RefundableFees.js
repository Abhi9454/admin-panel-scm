import React, { useState } from 'react'
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
  CFormText,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTabPane,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'
import studentManagementApi from 'src/api/studentManagementApi'

const RefundableFees = () => {
  const [formData, setFormData] = useState({
    admissionNumber: '',
    receivedDate: '',
    referenceNumber: '',
    Amount: '',
    payMode: '',
    remarks: '',
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
        'refundable-security',
        formData.admissionNumber,
        formData,
      )
      if (response === false) {
        alert('No Student found!')
      } else {
        alert('Data Added!')
      }
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
            <strong>Refundable Fees</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Refundable Fees</p>
            <CForm className="row g-3" onSubmit={handleSubmit}>
              <CCol md={4}>
                <CFormLabel htmlFor="receivedDate">Received Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel htmlFor="referenceNumber">Reference Number</CFormLabel>
                <CFormInput
                  type="text"
                  id="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="admissionNumber">Admission Number</CFormLabel>
                <CFormInput
                  type="text"
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="amount">Amount</CFormLabel>
                <CFormInput
                  type="text"
                  id="amount"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="payMode">Pay Mode</CFormLabel>
                <CFormSelect id="payMode" value={formData.payMode} onChange={handleChange}>
                  <option>Cash</option>
                  <option>Online</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                <CFormTextarea
                  type="textArea"
                  id="remarks"
                  placeholder="Enter Remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Add Request
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RefundableFees
