import React, { useState, useEffect, useRef } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormCheck,
  CRow,
  CCol,
  CFormSelect,
  CButton,
  CFormInput,
  CSpinner,
  CAlert,
  CContainer,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../../api/schoolManagementApi'
import reportManagementApi from '../../../api/reportManagementApi'
import studentManagementApi from '../../../api/studentManagementApi'

const StudentAccount = () => {
  const [selectedSubReport, setSelectedSubReport] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [regNo, setRegNo] = useState('')

  const [studentSearchValue, setStudentSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [searchCache, setSearchCache] = useState(new Map())
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [abortController, setAbortController] = useState(null)
  const [selectedStudentInfo, setSelectedStudentInfo] = useState(null)
  const dropdownRef = useRef(null)

  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [error, setError] = useState('')

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  const subReports = [{ value: 'student-account-detail', label: 'Student Account Detail' }]

  const getCacheKey = (query, sessionId) => {
    return `${query.toLowerCase()}_${sessionId}`
  }

  const canFilterExistingResults = (newQuery, lastQuery, cachedResults) => {
    return (
      lastQuery &&
      newQuery.toLowerCase().startsWith(lastQuery.toLowerCase()) &&
      cachedResults &&
      cachedResults.length > 0 &&
      newQuery.length > lastQuery.length
    )
  }

  const filterExistingResults = (results, query) => {
    const lowerQuery = query.toLowerCase()
    return results.filter(
      (student) =>
        student.admissionNumber.toLowerCase().includes(lowerQuery) ||
        student.registrationNumber?.toLowerCase().includes(lowerQuery) ||
        student.name.toLowerCase().includes(lowerQuery) ||
        (student.className && student.className.toLowerCase().includes(lowerQuery)),
    )
  }

  useEffect(() => {
    fetchData()

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (abortController) {
        abortController.abort()
      }
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedSession) {
      resetStudentSearch()
    }
  }, [selectedSession])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const sessionData = await apiService.getAll('session/all')

      const formattedSessions = sessionData.map((session) => ({
        value: session.id.toString(),
        label: session.name,
      }))

      setSessions(formattedSessions)

      if (sessionData.length > 0) {
        const currentSession = sessionData.find((s) => s.current) || sessionData[0]
        setSelectedSession(currentSession.id.toString())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load initial data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const resetFormFields = () => {
    setSelectedSubReport('')
    setRegNo('')
    resetStudentSearch()
    setError('')
  }

  const resetStudentSearch = () => {
    setStudentSearchValue('')
    setSearchResults([])
    setShowDropdown(false)
    setSelectedStudentInfo(null)
    setSearchCache(new Map())
    setLastSearchQuery('')
    setRegNo('')
  }

  const handleSubReportChange = (event) => {
    const value = event.target.value
    setSelectedSubReport(value)
    setError('')
    resetStudentSearch()
  }

  const handleStudentSearch = async (value) => {
    setStudentSearchValue(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSelectedStudentInfo(null)
      setRegNo('')
      setLastSearchQuery('')
      return
    }

    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    if (abortController) {
      abortController.abort()
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    if (!selectedSession) {
      setError('Please select a session first')
      return
    }

    const cacheKey = getCacheKey(value.trim(), selectedSession)

    if (canFilterExistingResults(value.trim(), lastSearchQuery, searchResults)) {
      console.log('Filtering existing results instead of API call')
      const filteredResults = filterExistingResults(searchResults, value.trim())
      setSearchResults(filteredResults)
      setShowDropdown(filteredResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    if (searchCache.has(cacheKey)) {
      console.log('Using cached results')
      const cachedResults = searchCache.get(cacheKey)
      setSearchResults(cachedResults)
      setShowDropdown(cachedResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true)

        const newAbortController = new AbortController()
        setAbortController(newAbortController)

        console.log('Making API call for student search:', value.trim())

        const response = await studentManagementApi.fetch(
          'search-fees',
          {
            queryString: value.trim(),
            sessionId: selectedSession,
          },
          {
            signal: newAbortController.signal,
          },
        )

        const results = Array.isArray(response) ? response : []

        const newCache = new Map(searchCache)
        if (newCache.size >= 50) {
          const keysToDelete = Array.from(newCache.keys()).slice(0, 10)
          keysToDelete.forEach((key) => newCache.delete(key))
        }
        newCache.set(cacheKey, results)
        setSearchCache(newCache)

        setSearchResults(results)
        setShowDropdown(results.length > 0)
        setLastSearchQuery(value.trim())
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Student search failed', error)
          setSearchResults([])
          setError('Student search failed. Please try again.')
        }
      } finally {
        setSearchLoading(false)
        setAbortController(null)
      }
    }, DEBOUNCE_DELAY)

    setDebounceTimeout(timeout)
  }

  const handleStudentSelect = (selectedStudent) => {
    setStudentSearchValue(selectedStudent.name)
    setSelectedStudentInfo(selectedStudent)
    setRegNo(selectedStudent.registrationNumber || selectedStudent.admissionNumber)
    setShowDropdown(false)
    setError('')

    console.log('Selected student:', selectedStudent)
  }

  const validateForm = () => {
    if (!selectedSession) {
      return 'Please select a session'
    }

    if (!selectedSubReport) {
      return 'Please select a report type'
    }

    if (!regNo) {
      return 'Please search and select a student for student account report'
    }

    return null
  }

  const buildRequestBody = () => {
    return {
      sessionId: parseInt(selectedSession),
      schoolId: 1,
      reportType: selectedSubReport,
      regNo: regNo || null,
      admissionNumber: selectedStudentInfo ? selectedStudentInfo.admissionNumber : null,
      status: 'ACTIVE',
    }
  }

  const handleGenerateReport = async () => {
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const requestBody = buildRequestBody()

    setLoading(true)
    try {
      console.log('Report generation request:', requestBody)

      const response = await reportManagementApi.downloadPdf('reports/fees/generate', requestBody)

      if (response.data instanceof Blob) {
        const pdfBlob = response.data
        const pdfUrl = window.URL.createObjectURL(pdfBlob)

        const newWindow = window.open(
          pdfUrl,
          '_blank',
          'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800',
        )

        if (!newWindow) {
          setError('Pop-up blocked! Please allow pop-ups for this site.')
          createDownloadFallback(pdfBlob, getReportFilename(selectedSubReport))
        } else {
          newWindow.document.title = getReportFilename(selectedSubReport)
          setTimeout(() => {
            window.URL.revokeObjectURL(pdfUrl)
          }, 10000)
        }
      } else {
        throw new Error('Invalid response format: Expected PDF blob')
      }
    } catch (error) {
      console.error('Error generating PDF report:', error)

      let errorMessage = 'Failed to generate PDF report'

      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (typeof errorData === 'string') {
          errorMessage = `Validation Error: ${errorData}`
        } else {
          errorMessage = 'Invalid request parameters. Please check your inputs.'
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'No data found for the selected criteria'
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while generating the report'
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`
      }

      setError(`${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const createDownloadFallback = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }

  const getReportFilename = (reportType) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
    return `${reportType.replace(/-/g, '_')}_${timestamp}.pdf`
  }

  return (
    <CContainer fluid className="px-2">
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError('')} className="mb-2">
          {error}
        </CAlert>
      )}

      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <CRow className="align-items-center">
            <CCol md={10}>
              <h6 className="mb-0 fw-bold text-primary">Student Account</h6>
            </CCol>
            <CCol md={2} className="text-end">
              <CButtonGroup size="sm">
                <CButton color="outline-secondary" onClick={resetFormFields}>
                  Reset
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="py-2">
          <CForm>
            <CRow className="g-2 mb-2">
              <CCol md={4}>
                <CFormSelect
                  size="sm"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map((session) => (
                    <option key={session.value} value={session.value}>
                      {session.label}
                    </option>
                  ))}
                </CFormSelect>
                <label className="small text-muted">Session *</label>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <h6 className="mb-0 fw-bold">Select Report Type *</h6>
        </CCardHeader>
        <CCardBody className="py-2">
          <CRow>
            {subReports.map((subReport) => (
              <CCol md={6} key={subReport.value} className="mb-1">
                <CFormCheck
                  type="radio"
                  name="subReport"
                  id={subReport.value}
                  value={subReport.value}
                  label={<span className="small">{subReport.label}</span>}
                  checked={selectedSubReport === subReport.value}
                  onChange={handleSubReportChange}
                />
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>

      {selectedSubReport && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <h6 className="mb-0 fw-bold">Search Student *</h6>
          </CCardHeader>
          <CCardBody className="py-2">
            <CRow className="g-2">
              <CCol md={8}>
                <div className="position-relative" ref={dropdownRef}>
                  <CFormInput
                    size="sm"
                    placeholder="Search by Name, Admission No, or Registration No"
                    value={studentSearchValue}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    autoComplete="off"
                  />
                  <label className="small text-muted">Type at least 2 characters to search</label>

                  {searchLoading && (
                    <CSpinner
                      color="primary"
                      size="sm"
                      style={{ position: 'absolute', right: '10px', top: '8px' }}
                    />
                  )}

                  {showDropdown && (
                    <div
                      className="position-absolute w-100 bg-white border rounded-bottom shadow-lg"
                      style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
                    >
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-2 border-bottom cursor-pointer"
                          onClick={() => handleStudentSelect(result)}
                          style={{
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                        >
                          <strong>{result.name}</strong>
                          <br />
                          <small className="text-muted">
                            Admission: {result.admissionNumber} | Registration:{' '}
                            {result.registrationNumber || 'N/A'}
                          </small>
                          <br />
                          <small className="text-muted">
                            Class: {result.className} - {result.sectionName}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedStudentInfo && (
                  <div className="mt-2 p-2 bg-dark rounded">
                    <small>
                      <strong>Selected:</strong> {selectedStudentInfo.name} |{' '}
                      <strong>Class:</strong> {selectedStudentInfo.className} |{' '}
                      <strong>Admission:</strong> {selectedStudentInfo.admissionNumber} |{' '}
                      <strong>Registration:</strong>{' '}
                      {selectedStudentInfo.registrationNumber || 'N/A'}
                    </small>
                  </div>
                )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      <div className="text-center mb-2">
        <CButton
          color="primary"
          onClick={handleGenerateReport}
          disabled={loading || !selectedSession || !selectedSubReport || !regNo}
          size="sm"
        >
          {loading ? (
            <>
              <CSpinner size="sm" className="me-1" /> Generating...
            </>
          ) : (
            'Generate PDF Report'
          )}
        </CButton>
      </div>
    </CContainer>
  )
}

export default StudentAccount
