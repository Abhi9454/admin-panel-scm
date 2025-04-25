import React, { useState } from 'react'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
} from '@coreui/react'

import studentManagementApi from '../../api/studentManagementApi'

const StudentSearchComponent = () => {
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leftDate: '',
    tcDate: '',
    leftRemarks: '',
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
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSelect = (admissionNumber) => {
    setStudentId(admissionNumber)
    setShowModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    try {
      console.log(formData)
      const response = await studentManagementApi.update('left-information', studentId, formData)
      alert('Student left date updated successfully!')
      console.log('API Response:', response)
    } catch (error) {
      console.error('Error updating student left date:', error)
      alert('Failed to update student left date!')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Update student Left Date</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
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

            <CRow className="mb-3">
              <CCol xs={12} md={6}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      TC Date<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="date"
                  id="tcDate"
                  name="tcDate"
                  value={formData.tcDate}
                  onChange={handleChange}
                />
              </CCol>
              <CCol xs={12} md={6}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Left Date<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="date"
                  name="leftDate"
                  id="leftDate"
                  value={formData.leftDate}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormTextarea
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Remarks<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  id="remarks"
                  rows={3}
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter any remarks"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CButton type="submit" color="success" disabled={submitLoading}>
                  {submitLoading ? (
                    <>
                      <CSpinner size="sm" color="light" /> Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </CButton>
              </CCol>
            </CRow>
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
    </>
  )
}

export default StudentSearchComponent
