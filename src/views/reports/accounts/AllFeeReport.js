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
  CInputGroup,
  CInputGroupText,
  CSpinner,
  CAlert,
} from '@coreui/react'
import apiService from '../../../api/schoolManagementApi'
import reportManagementApi from '../../../api/reportManagementApi'
import receiptManagementApi from '../../../api/receiptManagementApi'
import studentManagementApi from '../../../api/studentManagementApi'

const AllFeesReport = () => {
  const [selectedReport, setSelectedReport] = useState('all-receipt-book')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedFilterType, setSelectedFilterType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [groups, setGroups] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [error, setError] = useState('')

  const dropdownRef = useRef(null)

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
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [sessionData, classData, groupData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('class/all'),
        apiService.getAll('group/all'),
      ])

      const formattedSessions = [
        { value: '', label: 'Select Session' },
        ...sessionData.map((session) => ({
          value: session.id.toString(),
          label: session.name,
        })),
      ]

      const formattedClasses = [
        { value: '', label: 'Select Class' },
        ...classData.map((cls) => ({
          value: cls.id.toString(),
          label: cls.name,
        })),
      ]

      const formattedGroups = [
        { value: '', label: 'Select Group' },
        ...groupData.map((group) => ({
          value: group.id.toString(),
          label: group.name,
        })),
      ]

      setSessions(formattedSessions)
      setClasses(formattedClasses)
      setGroups(formattedGroups)

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

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value)
    resetFormFields()
    setError('')
  }

  const resetFormFields = () => {
    setSelectedClass('')
    setSelectedGroup('')
    setSelectedFilterType('')
    setDateFrom('')
    setDateTo('')
    setStudentSearch('')
    setSelectedStudent(null)
    setSearchResults([])
    setShowDropdown(false)
  }

  const handleFilterTypeChange = (filterType) => {
    setSelectedFilterType(filterType)
    setError('')

    // Clear other filter options
    if (filterType !== 'date') {
      setDateFrom('')
      setDateTo('')
    }
    if (filterType !== 'class') {
      setSelectedClass('')
    }
    if (filterType !== 'student') {
      setStudentSearch('')
      setSelectedStudent(null)
      setSearchResults([])
      setShowDropdown(false)
    }
  }

  const handleStudentSearch = async (value) => {
    setStudentSearch(value)
    setError('')

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSearchLoading(false)
      setSelectedStudent(null)
      return
    }

    if (value.trim().length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const response = await studentManagementApi.getById('search', value.trim())
        const results = Array.isArray(response) ? response : []
        setSearchResults(results)
        setShowDropdown(results.length > 0)

        if (results.length === 0 && value.trim().length >= 2) {
          setError('No students found matching your search criteria.')
        }
      } catch (error) {
        console.error('Search failed', error)
        setSearchResults([])
        setShowDropdown(false)
        setError('Student search failed. Please try again.')
      } finally {
        setSearchLoading(false)
      }
    }, 500)

    setDebounceTimeout(timeout)
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setStudentSearch(`${student.admissionNumber} - ${student.name}`)
    setShowDropdown(false)
    setSearchResults([])
    setError('')
  }

  const validateForm = () => {
    if (!selectedSession) {
      return 'Please select a session'
    }

    if (requiresClassGroup(selectedReport) && (!selectedClass || !selectedGroup)) {
      return 'Please select both class and group'
    }

    if (requiresFilter(selectedReport)) {
      if (!selectedFilterType) {
        return 'Please select a filter type (Date/Class/Student)'
      }

      if (selectedFilterType === 'date') {
        if (!dateFrom || !dateTo) {
          return 'Please select both from and to dates'
        }
        if (new Date(dateFrom) > new Date(dateTo)) {
          return 'From date cannot be greater than to date'
        }
      }

      if (selectedFilterType === 'class' && !selectedClass) {
        return 'Please select a class'
      }

      if (selectedFilterType === 'student' && !selectedStudent) {
        return 'Please select a student'
      }
    }

    return null
  }

  const handleGenerateReport = async () => {
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    console.log('Generate PDF fees report:', selectedReport)

    // Prepare request body based on controller specification
    let requestBody = {
      sessionId: parseInt(selectedSession),
      schoolId: 1, // Consider getting this from context/props
      reportType: selectedReport,
      classId: null,
      groupId: null,
      filterType: null,
      fromDate: null,
      toDate: null,
      studentId: null,
      admissionNumber: null,
    }

    // Add class and group for reports that require them
    if (requiresClassGroup(selectedReport)) {
      requestBody.classId = parseInt(selectedClass)
      requestBody.groupId = parseInt(selectedGroup)
    }

    // Add filter-specific data
    if (requiresFilter(selectedReport)) {
      requestBody.filterType = selectedFilterType

      if (selectedFilterType === 'date') {
        requestBody.fromDate = dateFrom
        requestBody.toDate = dateTo
      } else if (selectedFilterType === 'class') {
        requestBody.classId = parseInt(selectedClass)
      } else if (selectedFilterType === 'student' && selectedStudent) {
        requestBody.studentId = selectedStudent.id
        requestBody.admissionNumber = selectedStudent.admissionNumber
      }
    }

    setLoading(true)
    try {
      console.log('Request body:', requestBody)

      const response = await reportManagementApi.downloadPdf('fees/allFees', requestBody)
      console.log('Response:', response)

      if (response.data instanceof Blob) {
        const pdfBlob = response.data
        const pdfUrl = window.URL.createObjectURL(pdfBlob)

        // Try to open in new window for inline viewing (matching controller's "inline" disposition)
        const newWindow = window.open(
          pdfUrl,
          '_blank',
          'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800',
        )

        if (!newWindow) {
          setError('Pop-up blocked! Please allow pop-ups for this site.')
          createDownloadFallback(pdfBlob, getReportFilename(selectedReport))
        } else {
          newWindow.document.title = getReportFilename(selectedReport)
          // Clean up the object URL after some time
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
        errorMessage = 'Invalid request parameters'
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

    // Match the naming convention from the controller
    const fileNameMap = {
      'all-receipt-book': 'all_receipt_book',
      'all-receipt-head': 'all_receipt_head',
      'fee-structure': 'fee_structure',
      'misc-fees-report': 'misc_fees_report',
      'concession-head': 'concession_head',
      'all-receipts': 'all_receipts',
      'cancelled-receipt': 'cancelled_receipt',
      'fee-collection': 'fee_collection',
    }

    const fileName = fileNameMap[reportType] || 'fee_report'
    return `${fileName}_${timestamp}.pdf`
  }

  // Helper functions to determine what UI elements to show
  const requiresClassGroup = (reportType) => {
    return ['fee-structure'].includes(reportType)
  }

  const requiresFilter = (reportType) => {
    return ['all-receipts', 'cancelled-receipt', 'fee-collection'].includes(reportType)
  }

  const renderClassGroupSelection = () => {
    if (!requiresClassGroup(selectedReport)) return null

    return (
      <CCard className="mt-3 mb-3">
        <CCardHeader>
          <strong>Select Class and Group</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CInputGroup>
                <CInputGroupText>Class *</CInputGroupText>
                <CFormSelect
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={classes}
                  disabled={loading}
                  required
                />
              </CInputGroup>
            </CCol>
            <CCol md={4}>
              <CInputGroup>
                <CInputGroupText>Group *</CInputGroupText>
                <CFormSelect
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  options={groups}
                  disabled={loading}
                  required
                />
              </CInputGroup>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    )
  }

  const renderFilterSelection = () => {
    if (!requiresFilter(selectedReport)) return null

    return (
      <CCard className="mt-3 mb-3">
        <CCardHeader>
          <strong>Select Filter Type *</strong>
        </CCardHeader>
        <CCardBody>
          {/* Filter Type Selection */}
          <CRow className="mb-3">
            <CCol md={12}>
              <div className="d-flex gap-4 flex-wrap">
                <CFormCheck
                  type="radio"
                  name="filterType"
                  id="dateFilter"
                  value="date"
                  label="Date Wise"
                  checked={selectedFilterType === 'date'}
                  onChange={() => handleFilterTypeChange('date')}
                />
                <CFormCheck
                  type="radio"
                  name="filterType"
                  id="classFilter"
                  value="class"
                  label="Class Wise"
                  checked={selectedFilterType === 'class'}
                  onChange={() => handleFilterTypeChange('class')}
                />
                {selectedReport === 'fee-collection' && (
                  <CFormCheck
                    type="radio"
                    name="filterType"
                    id="studentFilter"
                    value="student"
                    label="Student Wise"
                    checked={selectedFilterType === 'student'}
                    onChange={() => handleFilterTypeChange('student')}
                  />
                )}
              </div>
            </CCol>
          </CRow>

          {/* Date Range Selection */}
          {selectedFilterType === 'date' && (
            <>
              <CRow className="mb-2">
                <CCol md={12}>
                  <small className="text-muted">Select date range for the report</small>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>From Date *</CInputGroupText>
                    <CFormInput
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>To Date *</CInputGroupText>
                    <CFormInput
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      min={dateFrom}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
            </>
          )}

          {/* Class Selection */}
          {selectedFilterType === 'class' && (
            <>
              <CRow className="mb-2">
                <CCol md={12}>
                  <small className="text-muted">Select class for the report</small>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Class *</CInputGroupText>
                    <CFormSelect
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      options={classes}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
            </>
          )}

          {/* Student Search */}
          {selectedFilterType === 'student' && (
            <>
              <CRow className="mb-2">
                <CCol md={12}>
                  <small className="text-muted">Search and select a student for the report</small>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <div className="position-relative" ref={dropdownRef}>
                    <CInputGroup>
                      <CInputGroupText>Student *</CInputGroupText>
                      <CFormInput
                        placeholder="Search by admission number or name (min 2 chars)"
                        value={studentSearch}
                        onChange={(e) => handleStudentSearch(e.target.value)}
                        autoComplete="off"
                        required
                      />
                      {searchLoading && (
                        <CInputGroupText>
                          <CSpinner size="sm" />
                        </CInputGroupText>
                      )}
                    </CInputGroup>

                    {/* Student Search Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                      <div
                        className="position-absolute w-100 bg-white border rounded-bottom shadow-lg"
                        style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {searchResults.map((result, index) => (
                          <div
                            key={`${result.id}-${index}`}
                            className="p-2 border-bottom cursor-pointer"
                            onClick={() => handleStudentSelect(result)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: 'white',
                              color: 'black',
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
                          >
                            <strong>{result.admissionNumber}</strong> - {result.name}
                            <br />
                            <small className="text-muted">
                              {result.className} - {result.sectionName}
                            </small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedStudent && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small>
                        <strong>Selected:</strong> {selectedStudent.admissionNumber} -{' '}
                        {selectedStudent.name}
                        <br />
                        <strong>Class:</strong> {selectedStudent.className} -{' '}
                        {selectedStudent.sectionName}
                      </small>
                    </div>
                  )}
                </CCol>
              </CRow>
            </>
          )}
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Fees Information PDF Report</strong>
      </CCardHeader>
      <CCardBody>
        {error && (
          <CAlert color="danger" dismissible onClose={() => setError('')}>
            {error}
          </CAlert>
        )}

        <CForm>
          {/* Session Selection */}
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Select Session *</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Session</CInputGroupText>
                    <CFormSelect
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      options={sessions}
                      disabled={loading}
                      required
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Report Type Selection */}
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Select Report Type *</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="allReceiptBook"
                    value="all-receipt-book"
                    label="All Receipt Book"
                    checked={selectedReport === 'all-receipt-book'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="allReceiptHead"
                    value="all-receipt-head"
                    label="All Receipt Head"
                    checked={selectedReport === 'all-receipt-head'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="feeStructure"
                    value="fee-structure"
                    label="Fee Structure (Requires Class & Group)"
                    checked={selectedReport === 'fee-structure'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="miscFeesReport"
                    value="misc-fees-report"
                    label="Misc Fees Report"
                    checked={selectedReport === 'misc-fees-report'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="concessionHead"
                    value="concession-head"
                    label="Concession Head"
                    checked={selectedReport === 'concession-head'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="allReceipts"
                    value="all-receipts"
                    label="All Receipts (Requires Filter)"
                    checked={selectedReport === 'all-receipts'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="cancelledReceipt"
                    value="cancelled-receipt"
                    label="Cancelled Receipt (Requires Filter)"
                    checked={selectedReport === 'cancelled-receipt'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="feeCollection"
                    value="fee-collection"
                    label="Fee Collection (Requires Filter)"
                    checked={selectedReport === 'fee-collection'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Dynamic Selection Panels */}
          {renderClassGroupSelection()}
          {renderFilterSelection()}

          <CRow className="mt-4 justify-content-center">
            <CCol xs="auto">
              <CButton
                color="primary"
                onClick={handleGenerateReport}
                disabled={loading || !selectedSession}
                size="lg"
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Generating PDF...
                  </>
                ) : (
                  'View PDF Report'
                )}
              </CButton>
            </CCol>
            <CCol xs="auto">
              <CButton color="secondary" size="lg" onClick={resetFormFields} disabled={loading}>
                Reset Form
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AllFeesReport
