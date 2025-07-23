import React, { useState, useRef, useCallback } from 'react'
import {
  CForm,
  CFormInput,
  CFormTextarea,
  CRow,
  CCol,
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
  CBadge,
} from '@coreui/react'

import studentManagementApi from '../../api/studentManagementApi'

const StudentSearchComponent = () => {
  const [studentId, setStudentId] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
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

  // Cache for search results with timestamp
  const searchCacheRef = useRef(new Map())
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Clear expired cache entries
  const clearExpiredCache = useCallback(() => {
    const now = Date.now()
    const cache = searchCacheRef.current
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        cache.delete(key)
      }
    }
  }, [])

  // Get cached results or null if not available/expired
  const getCachedResults = useCallback((searchTerm) => {
    const cache = searchCacheRef.current
    const cached = cache.get(searchTerm.toLowerCase())
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.results
    }
    return null
  }, [])

  // Cache search results
  const setCachedResults = useCallback((searchTerm, results) => {
    const cache = searchCacheRef.current
    cache.set(searchTerm.toLowerCase(), {
      results,
      timestamp: Date.now(),
    })

    // Limit cache size to prevent memory issues
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
  }, [])

  const handleLiveSearch = async (value) => {
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSelectedStudent(null)
      return
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Check cache first
    const cachedResults = getCachedResults(value)
    if (cachedResults) {
      setSearchResults(cachedResults)
      setShowDropdown(cachedResults.length > 0)
      return
    }

    // Set a new debounce timeout to trigger search after 300ms
    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        clearExpiredCache() // Clean up expired cache entries

        const response = await studentManagementApi.getById('search', value)
        const results = Array.isArray(response) ? response : []

        // Cache the results
        setCachedResults(value, results)

        setSearchResults(results)
        setShowDropdown(results.length > 0)
      } catch (error) {
        console.error('Search failed', error)
        setSearchResults([])
        setShowDropdown(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    setDebounceTimeout(timeout)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSelect = (student) => {
    setStudentId(student.admissionNumber)
    setSelectedStudent(student)
    setShowDropdown(false)
  }

  const clearForm = () => {
    setFormData({
      leftDate: '',
      tcDate: '',
      leftRemarks: '',
    })
    setStudentId('')
    setSelectedStudent(null)
    setSearchResults([])
    setShowDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!studentId.trim()) {
      alert('Please select a student first!')
      return
    }

    if (!formData.leftDate || !formData.tcDate) {
      alert('Please fill all required fields!')
      return
    }

    setSubmitLoading(true)
    try {
      const response = await studentManagementApi.update('left-information', studentId, formData)
      alert('Student left date updated successfully!')
      console.log('API Response:', response)
      clearForm()
    } catch (error) {
      console.error('Error updating student left date:', error)
      alert('Failed to update student left date!')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Update Student Left Date</h6>
                <small className="text-muted">Search and update student leaving information</small>
              </CCol>
              <CCol md={4} className="text-end">
                {selectedStudent && (
                  <CBadge color="success" className="me-2">
                    Student Selected
                  </CBadge>
                )}
                <CBadge color="info">Cache: {searchCacheRef.current.size} entries</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-2">
                {/* Student Search Section */}
                <CCol xs={12} className="mb-2">
                  <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                    🔍 Student Search
                  </h6>
                </CCol>

                <CCol lg={6} md={12} className="position-relative">
                  <CFormInput
                    size="sm"
                    floatingClassName="mb-2"
                    floatingLabel={
                      <>
                        Enter or Search Admission Number
                        <span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="text"
                    id="studentId"
                    value={studentId}
                    onChange={(e) => handleLiveSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {loading && (
                    <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                      <CSpinner size="sm" color="primary" />
                    </div>
                  )}
                  {showDropdown && (
                    <div
                      className="position-absolute w-100 bg-white border rounded shadow-lg"
                      style={{
                        top: '100%',
                        zIndex: 1050,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                    >
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-2 border-bottom cursor-pointer hover-bg-light"
                          style={{
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                        >
                          <div className="fw-semibold">
                            {result.admissionNumber} - {result.name}
                          </div>
                          <small className="text-muted">
                            {result.className} - {result.sectionName}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </CCol>

                {/* Selected Student Info */}
                {selectedStudent && (
                  <CCol lg={6} md={12}>
                    <div className="p-2 bg-light rounded mb-2">
                      <small className="text-muted d-block">Selected Student:</small>
                      <div className="fw-semibold">{selectedStudent.name}</div>
                      <small className="text-muted">
                        {selectedStudent.className} - {selectedStudent.sectionName}
                      </small>
                    </div>
                  </CCol>
                )}

                {/* Form Fields Section */}
                <CCol xs={12} className="mb-2 mt-3">
                  <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                    📅 Leaving Information
                  </h6>
                </CCol>

                <CCol lg={4} md={6}>
                  <CFormInput
                    size="sm"
                    floatingClassName="mb-2"
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

                <CCol lg={4} md={6}>
                  <CFormInput
                    size="sm"
                    floatingClassName="mb-2"
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

                <CCol lg={4} md={12}>
                  <CFormTextarea
                    size="sm"
                    floatingClassName="mb-2"
                    floatingLabel="Remarks"
                    id="leftRemarks"
                    name="leftRemarks"
                    rows={2}
                    value={formData.leftRemarks}
                    onChange={handleChange}
                    placeholder="Enter any remarks"
                  />
                </CCol>

                {/* Submit Section */}
                <CCol xs={12} className="pt-3 border-top mt-3">
                  <div className="d-flex gap-2 align-items-center">
                    <CButton
                      type="submit"
                      color="success"
                      disabled={submitLoading || !selectedStudent}
                      className="px-4"
                    >
                      {submitLoading ? (
                        <>
                          <CSpinner size="sm" color="light" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        'Update Student Information'
                      )}
                    </CButton>

                    <CButton type="button" color="outline-secondary" onClick={clearForm}>
                      Clear Form
                    </CButton>

                    <div className="ms-auto">
                      <small className="text-muted">
                        <span style={{ color: 'red' }}>*</span> Required fields
                      </small>
                    </div>
                  </div>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentSearchComponent
