import React, { useState } from 'react'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
} from '@coreui/react'

import studentManagementApi from '../../api/studentManagementApi'

const StudentSearchComponent = () => {
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [formData, setFormData] = useState({
    leftDate: '',
    tcDate: '',
    leftRemarks: '',
  })

  const handleLiveSearch = async (value) => {
    console.log(value)
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Set a new debounce timeout to trigger search after 300ms
    const timeout = setTimeout(async () => {
      try {
        setLoading(true) // Show loading spinner
        const response = await studentManagementApi.getById('search', value)
        setSearchResults(Array.isArray(response) ? response : [])
        setShowDropdown(response.length > 0)
      } catch (error) {
        console.error('Search failed', error)
        setSearchResults([])
      } finally {
        setLoading(false) // Hide loading spinner
      }
    }, 300)

    // Save the timeout ID for future cleanup
    setDebounceTimeout(timeout)
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
    setShowDropdown(false)
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
              <CCol xs={6}>
                <CCard className="mb-4">
                  <CCardHeader>
                    <strong>Search Student</strong>
                  </CCardHeader>
                  <CCardBody>
                    <CRow className="mb-3 position-relative">
                      <CCol md={12}>
                        <CFormInput
                          floatingClassName="mb-3"
                          floatingLabel={
                            <>
                              Enter or Search Admission Number
                              <span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          type="text"
                          id="studentId"
                          placeholder="Enter or Search Admission Number"
                          value={studentId}
                          onChange={(e) => handleLiveSearch(e.target.value)}
                          autoComplete="off"
                        />
                        {showDropdown && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              zIndex: 999,
                              width: '100%',
                              border: '1px solid #ccc',
                              borderRadius: '0 0 4px 4px',
                              maxHeight: '200px',
                              overflowY: 'auto',
                            }}
                          >
                            {searchResults.map((result, index) => (
                              <div
                                key={index}
                                style={{
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #444',
                                  backgroundColor: '#777',
                                  color: 'white',
                                }}
                                onClick={() => handleSelect(result.admissionNumber)}
                              >
                                {result.admissionNumber} - {result.name} - {result.className} -{' '}
                                {result.sectionName}
                              </div>
                            ))}
                          </div>
                        )}
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
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
    </>
  )
}

export default StudentSearchComponent
