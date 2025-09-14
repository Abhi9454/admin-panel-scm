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
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import apiService from '../../../api/schoolManagementApi'
import reportManagementApi from '../../../api/reportManagementApi'
import receiptManagementApi from '../../../api/receiptManagementApi'
import studentManagementApi from '../../../api/studentManagementApi'

const AllFeesReport = () => {
  const [selectedMainCategory, setSelectedMainCategory] = useState('fees-collection-reports')
  const [selectedSubReport, setSelectedSubReport] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedReceiptHead, setSelectedReceiptHead] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [receivedBy, setReceivedBy] = useState('ALL')
  const [payMode, setPayMode] = useState('ALL')
  const [currentSession, setCurrentSession] = useState(false)
  const [dueAsOn, setDueAsOn] = useState('PREVIOUS')
  const [feesReceivedAsOn, setFeesReceivedAsOn] = useState('')
  const [amountGreaterThan, setAmountGreaterThan] = useState('')
  const [withLeftStudents, setWithLeftStudents] = useState(false)
  const [withStandByStudents, setWithStandByStudents] = useState(false)
  const [concessionAsOn, setConcessionAsOn] = useState('')
  const [regNo, setRegNo] = useState('')

  // Student search specific states
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
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  // Main categories based on screenshots
  const mainCategories = [
    { value: 'fees-collection-reports', label: 'Fees Collection Reports' },
    { value: 'defaulter-student-list', label: 'Defaulter Student List' },
    { value: 'concession-reports', label: 'Concession Reports' },
    { value: 'student-account', label: 'Student Account' },
    { value: 'receipt-head-wise-detail', label: 'Receipt Head Wise Detail' },
  ]

  // Sub-reports for each main category
  const subReportsMap = {
    'fees-collection-reports': [
      { value: 'fees-collection-combine-detail', label: 'Fees Collection Combine Detail' },
      { value: 'fees-collection-head-wise-detail', label: 'Fees Collection Head Wise Detail' },
      { value: 'general-receipt-head-wise-detail', label: 'General Receipt Head Wise Detail' },
      { value: 'fees-collection-head-wise-summary', label: 'Fees Collection Head Wise Summary' },
      { value: 'fees-collection-detail', label: 'Fees Collection Detail' },
      { value: 'fees-collection-user-wise-detail', label: 'Fees Collection User Wise Detail' },
      { value: 'fees-collection-date-wise-summary', label: 'Fees Collection Date Wise Summary' },
      { value: 'fees-collection-horizontal-detail', label: 'Fees Collection Horizontal Detail' },
      {
        value: 'fees-collection-horizontal-daily-summary',
        label: 'Fees Collection Horizontal Daily Summary',
      },
      { value: 'fees-collection-register', label: 'Fees Collection Register' },
      { value: 'fees-collection-register-summary', label: 'Fees Collection Register Summary' },
      { value: 'print-all-receipts', label: 'Print All Receipts' },
      { value: 'print-all-general-receipts', label: 'Print All General Receipts' },
      { value: 'class-wise-summary', label: 'Class Wise Summary' },
      { value: 'general-receipt-user-wise-detail', label: 'General Receipt User Wise Detail' },
      { value: 'general-receipt-daily-summary', label: 'General Receipt Daily Summary' },
      { value: 'concessional-student-detail', label: 'Concessional Student Detail' },
      { value: 'concessional-student-list', label: 'Concessional Student List' },
    ],
    'defaulter-student-list': [
      { value: 'defaulter-student-detail', label: 'Defaulter Student Detail' },
      {
        value: 'defaulter-student-horizontal-detail',
        label: 'Defaulter Student Horizontal Detail',
      },
      { value: 'parents-intimation', label: 'Parents Intimation' },
      { value: 'generate-bank-challan', label: 'Generate Bank Challan' },
      { value: 'defaulter-student-register', label: 'Defaulter Student Register' },
      { value: 'defaulter-student-register-summary', label: 'Defaulter Student Register Summary' },
      { value: 'wing-wise-student-summary', label: 'Wing Wise Student Summary' },
      { value: 'stand-by-student-detail', label: 'Stand By Student Detail' },
      { value: 'student-outstanding-list', label: 'Student Outstanding List' },
    ],
    'concession-reports': [
      { value: 'concessional-student-register', label: 'Concessional Student Register' },
      {
        value: 'concessional-student-register-summary',
        label: 'Concessional Student Register Summary',
      },
    ],
    'student-account': [{ value: 'student-account-detail', label: 'Student Account Detail' }],
    'receipt-head-wise-detail': [
      { value: 'fees-receipt-head-wise-collection', label: 'Fees Receipt Head Wise Collection' },
      {
        value: 'general-receipt-head-wise-collection',
        label: 'General Receipt Head Wise Collection',
      },
    ],
  }

  // Utility functions for student search
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
    // Reset sub-report when main category changes
    setSelectedSubReport('')
    setPreview(null)
    resetFormFields()
  }, [selectedMainCategory])

  useEffect(() => {
    // Generate preview when valid form data is available
    if (selectedSubReport && selectedSession) {
      generatePreview()
    }
  }, [selectedSubReport, selectedSession, dateFrom, dateTo, selectedClass, regNo])

  useEffect(() => {
    // Reset student search when session changes
    if (selectedSession) {
      resetStudentSearch()
    }
  }, [selectedSession])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [sessionData, classData, sectionData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
      ])

      // Format data for dropdowns
      const formattedSessions = sessionData.map((session) => ({
        value: session.id.toString(),
        label: session.name,
      }))

      const formattedClasses = classData.map((cls) => ({
        value: cls.id.toString(),
        label: cls.name,
      }))

      const formattedSections = sectionData.map((section) => ({
        value: section.id.toString(),
        label: section.name,
      }))

      setSessions(formattedSessions)
      setClasses(formattedClasses)
      setSections(formattedSections)

      // Set default session
      if (sessionData.length > 0) {
        const currentSession = sessionData.find((s) => s.current) || sessionData[0]
        setSelectedSession(currentSession.id.toString())
      }

      // Set default dates
      const today = new Date().toISOString().split('T')[0]
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0]
      setDateFrom(firstDayOfMonth)
      setDateTo(today)
      setFeesReceivedAsOn(today)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load initial data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReceiptHeads = async () => {
    try {
      const response = await receiptManagementApi.getAll('receipt-head/all')
      const formattedHeads = response.map((head) => ({
        value: head.id.toString(),
        label: head.headName,
      }))
      setReceiptHeads(formattedHeads)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const resetFormFields = () => {
    setSelectedClass('')
    setSelectedSection('')
    setSelectedReceiptHead('')
    setReceivedBy('ALL')
    setPayMode('ALL')
    setCurrentSession(false)
    setDueAsOn('PREVIOUS')
    setAmountGreaterThan('')
    setWithLeftStudents(false)
    setWithStandByStudents(false)
    setConcessionAsOn('')
    setRegNo('')
    setPreview(null)
    resetStudentSearch()
  }

  const resetStudentSearch = () => {
    setStudentSearchValue('')
    setSearchResults([])
    setShowDropdown(false)
    setSelectedStudentInfo(null)
    setSearchCache(new Map())
    setLastSearchQuery('')
  }

  const handleMainCategoryChange = (category) => {
    setSelectedMainCategory(category)
    setError('')
  }

  const handleSubReportChange = (event) => {
    const value = event.target ? event.target.value : event
    setSelectedSubReport(value)
    setError('')
    setPreview(null)

    // Load receipt heads for receipt head wise reports
    if (value.includes('receipt-head-wise')) {
      fetchReceiptHeads()
    }

    // Reset student search when changing to/from student account report
    if (
      value === 'student-account-detail' ||
      (selectedSubReport === 'student-account-detail' && value !== 'student-account-detail')
    ) {
      resetStudentSearch()
    }
  }

  // Student search functionality
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

    // Check if we can filter existing results
    if (canFilterExistingResults(value.trim(), lastSearchQuery, searchResults)) {
      console.log('Filtering existing results instead of API call')
      const filteredResults = filterExistingResults(searchResults, value.trim())
      setSearchResults(filteredResults)
      setShowDropdown(filteredResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    // Check cache
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

        // Update cache
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

    // Specific validations based on report type
    if (selectedSubReport === 'student-account-detail' && !regNo) {
      return 'Please search and select a student for student account report'
    }

    if (requiresClass() && !selectedClass) {
      return 'Please select a class'
    }

    if (requiresDateRange() && (!dateFrom || !dateTo)) {
      return 'Please select date range'
    }

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      return 'From date cannot be greater than to date'
    }

    return null
  }

  const requiresClass = () => {
    return ['defaulter-student-detail', 'concessional-student-register'].includes(selectedSubReport)
  }

  const requiresDateRange = () => {
    return (
      selectedMainCategory === 'fees-collection-reports' ||
      selectedMainCategory === 'receipt-head-wise-detail'
    )
  }

  const requiresReceiptHead = () => {
    return selectedSubReport.includes('receipt-head-wise')
  }

  const requiresStudentSearch = () => {
    return selectedSubReport === 'student-account-detail'
  }

  const buildRequestBody = () => {
    return {
      sessionId: parseInt(selectedSession),
      schoolId: 1, // This should come from user context/authentication
      reportType: selectedSubReport,
      classId: selectedClass ? parseInt(selectedClass) : null,
      sectionId: selectedSection ? parseInt(selectedSection) : null,
      receiptHeadId: selectedReceiptHead ? parseInt(selectedReceiptHead) : null,
      receiptHeadName: selectedReceiptHead
        ? receiptHeads.find((h) => h.value === selectedReceiptHead)?.label
        : null,
      fromDate: dateFrom || null,
      toDate: dateTo || null,
      receivedBy: receivedBy !== 'ALL' ? receivedBy : null,
      payMode: payMode !== 'ALL' ? payMode : null,
      currentSession: currentSession,
      dueAsOn: dueAsOn,
      feesReceivedAsOn: feesReceivedAsOn || null,
      amountGreaterThan: amountGreaterThan ? parseFloat(amountGreaterThan) : null,
      withLeftStudents: withLeftStudents,
      withStandByStudents: withStandByStudents,
      concessionAsOn: concessionAsOn || null,
      regNo: regNo || null,
      admissionNumber: selectedStudentInfo ? selectedStudentInfo.admissionNumber : null,
      status: 'ACTIVE', // Default status
    }
  }

  const generatePreview = async () => {
    const validationError = validateForm()
    if (validationError) {
      return // Don't show preview if validation fails
    }

    setPreviewLoading(true)
    try {
      const requestBody = buildRequestBody()
      console.log('Preview request:', requestBody)

      const response = await reportManagementApi.post('reports/fees/preview', requestBody)
      setPreview(response.data)
    } catch (error) {
      console.error('Error generating preview:', error)
      setPreview(null)
    } finally {
      setPreviewLoading(false)
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

  const renderPreview = () => {
    if (!preview) return null

    return (
      <CCard className="mt-3 mb-3">
        <CCardHeader>
          <strong>Report Preview</strong>
        </CCardHeader>
        <CCardBody>
          {previewLoading ? (
            <div className="text-center">
              <CSpinner size="sm" className="me-2" /> Loading preview...
            </div>
          ) : (
            <CListGroup flush>
              <CListGroupItem className="d-flex justify-content-between align-items-center">
                <strong>Report Title:</strong>
                <span>{preview.reportTitle}</span>
              </CListGroupItem>
              <CListGroupItem className="d-flex justify-content-between align-items-center">
                <strong>Total Records:</strong>
                <span className="badge bg-primary rounded-pill">{preview.recordCount || 0}</span>
              </CListGroupItem>
              {preview.totalAmount && (
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <strong>Total Amount:</strong>
                  <span className="badge bg-success rounded-pill">
                    ₹{preview.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </CListGroupItem>
              )}
              {preview.dateRange && (
                <CListGroupItem className="d-flex justify-content-between align-items-center">
                  <strong>Date Range:</strong>
                  <span>{preview.dateRange}</span>
                </CListGroupItem>
              )}
              {preview.filterCriteria && (
                <CListGroupItem>
                  <strong>Applied Filters:</strong>
                  <div className="mt-1 text-muted small">{preview.filterCriteria}</div>
                </CListGroupItem>
              )}
            </CListGroup>
          )}
        </CCardBody>
      </CCard>
    )
  }

  const renderParameterInputs = () => {
    if (!selectedSubReport) return null

    return (
      <CCard className="mt-3 mb-3">
        <CCardHeader>
          <strong>Report Parameters</strong>
        </CCardHeader>
        <CCardBody>
          {/* Student Search for Student Account Report */}
          {requiresStudentSearch() && (
            <CRow className="mb-3">
              <CCol md={8}>
                <div className="position-relative" ref={dropdownRef}>
                  <CInputGroup>
                    <CInputGroupText>Search Student *</CInputGroupText>
                    <CFormInput
                      placeholder="Search by Name, Admission No, or Registration No"
                      value={studentSearchValue}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      autoComplete="off"
                    />
                  </CInputGroup>
                  {searchLoading && (
                    <CSpinner
                      color="primary"
                      size="sm"
                      style={{ position: 'absolute', right: '10px', top: '8px' }}
                    />
                  )}

                  {/* Student Search Dropdown */}
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
                          onMouseEnter={(e) => (e.target.style.backgroundColor = '#333333')}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = 'black')}
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

                {/* Selected Student Info Display */}
                {selectedStudentInfo && (
                  <div className="mt-2 p-2 bg-light rounded">
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
          )}

          {/* Regular Registration Number Input (fallback) */}
          {selectedMainCategory === 'student-account' && !requiresStudentSearch() && (
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>Registration No *</CInputGroupText>
                  <CFormInput
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="Enter registration number"
                  />
                </CInputGroup>
              </CCol>
            </CRow>
          )}

          {/* Date Range for Collection Reports */}
          {requiresDateRange() && (
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>From Date *</CInputGroupText>
                  <CFormInput
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
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
                  />
                </CInputGroup>
              </CCol>
            </CRow>
          )}

          {/* Receipt Head Selection */}
          {requiresReceiptHead() && (
            <CRow className="mb-3">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText>Receipt Head *</CInputGroupText>
                  <CFormSelect
                    value={selectedReceiptHead}
                    onChange={(e) => setSelectedReceiptHead(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Receipt Head</option>
                    {receiptHeads.map((head) => (
                      <option key={head.value} value={head.value}>
                        {head.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
              </CCol>
            </CRow>
          )}

          {/* Collection Report Parameters */}
          {selectedMainCategory === 'fees-collection-reports' && (
            <>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Received By</CInputGroupText>
                    <CFormSelect value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)}>
                      <option value="ALL">ALL</option>
                      <option value="School">School</option>
                      <option value="Bank">Bank</option>
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Pay Mode</CInputGroupText>
                    <CFormSelect value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                      <option value="ALL">ALL</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="DD">DD</option>
                      <option value="NEFT">NEFT/RTGS</option>
                      <option value="UPI">UPI</option>
                      <option value="SWIPE">Swipe</option>
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
              </CRow>
            </>
          )}

          {/* Defaulter Student Parameters */}
          {selectedMainCategory === 'defaulter-student-list' && (
            <>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Class</CInputGroupText>
                    <CFormSelect
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls.value} value={cls.value}>
                          {cls.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Due As On</CInputGroupText>
                    <CFormSelect value={dueAsOn} onChange={(e) => setDueAsOn(e.target.value)}>
                      <option value="PREVIOUS">Previous</option>
                      <option value="CURRENT">Current</option>
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Fees Received As On</CInputGroupText>
                    <CFormInput
                      type="date"
                      value={feesReceivedAsOn}
                      onChange={(e) => setFeesReceivedAsOn(e.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Amount Greater Than</CInputGroupText>
                    <CFormInput
                      type="number"
                      value={amountGreaterThan}
                      onChange={(e) => setAmountGreaterThan(e.target.value)}
                      placeholder="0"
                    />
                  </CInputGroup>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormCheck
                    id="withLeftStudents"
                    label="Include Left Students"
                    checked={withLeftStudents}
                    onChange={(e) => setWithLeftStudents(e.target.checked)}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    id="withStandByStudents"
                    label="Include Stand by Students"
                    checked={withStandByStudents}
                    onChange={(e) => setWithStandByStudents(e.target.checked)}
                  />
                </CCol>
              </CRow>
            </>
          )}

          {/* Concession Report Parameters */}
          {selectedMainCategory === 'concession-reports' && (
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>Class</CInputGroupText>
                  <CFormSelect
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.value} value={cls.value}>
                        {cls.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>Section</CInputGroupText>
                  <CFormSelect
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Section</option>
                    {sections.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </CFormSelect>
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>Concession As On</CInputGroupText>
                  <CFormInput
                    type="date"
                    value={concessionAsOn}
                    onChange={(e) => setConcessionAsOn(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
            </CRow>
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
                  </CInputGroup>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Main Category Selection */}
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Select Report Category *</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                {mainCategories.map((category) => (
                  <CCol md={6} key={category.value} className="mb-2">
                    <CFormCheck
                      type="radio"
                      name="mainCategory"
                      id={category.value}
                      value={category.value}
                      label={category.label}
                      checked={selectedMainCategory === category.value}
                      onChange={() => handleMainCategoryChange(category.value)}
                    />
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>

          {/* Sub Report Selection */}
          {selectedMainCategory && subReportsMap[selectedMainCategory] && (
            <CCard className="mb-3">
              <CCardHeader>
                <strong>Select Report Type *</strong>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  {subReportsMap[selectedMainCategory].map((subReport) => (
                    <CCol md={6} key={subReport.value} className="mb-2">
                      <CFormCheck
                        type="radio"
                        name="subReport"
                        id={subReport.value}
                        value={subReport.value}
                        label={subReport.label}
                        checked={selectedSubReport === subReport.value}
                        onChange={handleSubReportChange}
                      />
                    </CCol>
                  ))}
                </CRow>
              </CCardBody>
            </CCard>
          )}

          {/* Dynamic Parameter Inputs */}
          {renderParameterInputs()}

          {/* Preview Section */}
          {renderPreview()}

          <CRow className="mt-4 justify-content-center">
            <CCol xs="auto">
              <CButton
                color="primary"
                onClick={handleGenerateReport}
                disabled={loading || !selectedSession || !selectedSubReport}
                size="lg"
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Generating PDF...
                  </>
                ) : (
                  'Generate & View PDF Report'
                )}
              </CButton>
            </CCol>
            <CCol xs="auto">
              <CButton color="secondary" size="lg" onClick={resetFormFields} disabled={loading}>
                Reset Form
              </CButton>
            </CCol>
            {preview && preview.recordCount > 0 && (
              <CCol xs="auto">
                <CButton color="info" size="lg" onClick={generatePreview} disabled={previewLoading}>
                  {previewLoading ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> Refreshing...
                    </>
                  ) : (
                    'Refresh Preview'
                  )}
                </CButton>
              </CCol>
            )}
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AllFeesReport
