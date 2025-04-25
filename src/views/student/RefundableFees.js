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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
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
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    admissionNumber: '',
    receivedDate: '',
    referenceNumber: '',
    Amount: '',
    payMode: '',
    remarks: '',
  })

  const handleSearch = async () => {
    setLoading(true)
    if (!studentId.trim()) return
    try {
      const response = await studentManagementApi.getById('search', studentId)
      setSearchResults(response)
      setShowModal(true)
    } catch (error) {
      console.error('Search failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelect = (admissionNumber) => {
    setStudentId(admissionNumber)
    setShowModal(false)
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
              <CRow className="mb-3">
                <CCol xs={12} md={6}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Enter or Search Admission Number<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="text"
                    id="studentId"
                    placeholder="Enter or Search Admission Number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                  {loading ? (
                    <div className="text-center">
                      <CSpinner color="primary" />
                      <p>Loading data...</p>
                    </div>
                  ) : (
                    <CButton color="primary" onClick={handleSearch}>
                      Search
                    </CButton>
                  )}
                </CCol>
              </CRow>
              <CCol md={3}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Received Date<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="date"
                  id="receivedDate"
                  placeholder="Received Date"
                  value={formData.receivedDate}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Reference Number<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="text"
                  id="referenceNumber"
                  placeholder="Reference Number"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Amount<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="text"
                  id="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Pay Mode<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  id="payMode"
                  placeholder="Pay Mode"
                  value={formData.payMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Online</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormTextarea
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Remarks<span style={{ color: 'red' }}> *</span>
                    </>
                  }
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
        <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>Select Student</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CTable bordered hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Student Name</CTableHeaderCell>
                  <CTableHeaderCell>Admission Number</CTableHeaderCell>
                  <CTableHeaderCell>Class Name</CTableHeaderCell>
                  <CTableHeaderCell>Father's Name</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {searchResults.map((student, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{student.name}</CTableDataCell>
                    <CTableDataCell>{student.admissionNumber}</CTableDataCell>
                    <CTableDataCell>{student.className}</CTableDataCell>
                    <CTableDataCell>{student.fatherName}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="primary"
                        size="sm"
                        onClick={() => handleSelect(student.admissionNumber)}
                      >
                        Select
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CCol>
    </CRow>
  )
}

export default RefundableFees
