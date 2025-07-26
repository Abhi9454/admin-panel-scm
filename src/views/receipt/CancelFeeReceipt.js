import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
  CBadge,
  CContainer,
  CButtonGroup,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const ReceiptManagement = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [receipts, setReceipts] = useState([])
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [receiptDetails, setReceiptDetails] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [defaultSession, setDefaultSession] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchCache, setSearchCache] = useState(new Map())
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [abortController, setAbortController] = useState(null)
  const [studentExtraInfo, setStudentExtraInfo] = useState({
    className: '',
    studentName: '',
    groupName: '',
    section: '',
  })
  const dropdownRef = useRef(null)

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  const [formData, setFormData] = useState({
    sessionId: '',
  })

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
        student.name.toLowerCase().includes(lowerQuery) ||
        (student.className && student.className.toLowerCase().includes(lowerQuery)),
    )
  }

  useEffect(() => {
    fetchInitialData()

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
    if (studentId === '') {
      resetStudentSpecificData()
    }
  }, [studentId])

  const fetchInitialData = async () => {
    try {
      setSessionLoading(true)
      const [sessionData, defaultSession] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('school-detail/session'),
      ])
      setSessions(sessionData)
      setDefaultSession(defaultSession)
      setFormData((prev) => ({
        ...prev,
        sessionId: defaultSession,
      }))
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to fetch initial data')
    } finally {
      setSessionLoading(false)
    }
  }

  const resetStudentSpecificData = () => {
    setStudentExtraInfo({
      className: '',
      studentName: '',
      groupName: '',
      section: '',
    })
    setReceipts([])
    setError(null)
    setSuccess(null)
    setLastSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'sessionId') {
      setSearchCache(new Map())
      setLastSearchQuery('')
      setSearchResults([])
      setShowDropdown(false)
      resetStudentSpecificData()
      setStudentId('')
    }
  }

  const handleLiveSearch = async (value) => {
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      resetStudentSpecificData()
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

    const sessionIdToUse = formData.sessionId || defaultSession

    if (!sessionIdToUse) {
      if (sessionLoading) {
        return
      } else {
        setError('Session not loaded yet. Please wait and try again.')
        return
      }
    }

    const cacheKey = getCacheKey(value.trim(), sessionIdToUse)

    if (canFilterExistingResults(value.trim(), lastSearchQuery, searchResults)) {
      console.log('🔍 Filtering existing results instead of API call')
      const filteredResults = filterExistingResults(searchResults, value.trim())
      setSearchResults(filteredResults)
      setShowDropdown(filteredResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    if (searchCache.has(cacheKey)) {
      console.log('📋 Using cached results')
      const cachedResults = searchCache.get(cacheKey)
      setSearchResults(cachedResults)
      setShowDropdown(cachedResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)

        const newAbortController = new AbortController()
        setAbortController(newAbortController)

        console.log('🌐 Making API call for:', value.trim())

        const response = await studentManagementApi.fetch(
          'search-fees',
          {
            queryString: value.trim(),
            sessionId: sessionIdToUse,
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
          console.error('Search failed', error)
          setSearchResults([])
          setError('Search failed. Please try again.')
        }
      } finally {
        setLoading(false)
        setAbortController(null)
      }
    }, DEBOUNCE_DELAY)

    setDebounceTimeout(timeout)
  }

  const handleSelect = async (selectedStudent) => {
    setStudentId(selectedStudent.admissionNumber)
    setStudentExtraInfo({
      className: selectedStudent.className || '',
      studentName: selectedStudent.name || '',
      groupName: selectedStudent.groupName || '',
      section: selectedStudent.sectionName || '',
    })
    setShowDropdown(false)
    setError(null)
    setSuccess(null)

    // Fetch receipts for the selected student
    await fetchStudentReceipts(selectedStudent.admissionNumber)
  }

  const fetchStudentReceipts = async (admissionNumber) => {
    setLoading(true)
    try {
      console.log('🧾 Fetching receipts for:', admissionNumber)
      const sessionIdToUse = formData.sessionId || defaultSession

      const response = await receiptManagementApi.getAll(
        `fees-payment/student/${admissionNumber}`,
        {},
        {
          headers: {
            sessionId: sessionIdToUse.toString(),
          },
        },
      )

      setReceipts(response || [])
      console.log('✅ Receipts loaded:', response)
    } catch (error) {
      console.error('Error fetching receipts:', error)
      setError('Failed to fetch receipt data')
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewReceipt = async (receiptNumber) => {
    setLoading(true)
    try {
      const response = await receiptManagementApi.getAll(`fees-payment/details/${receiptNumber}`)
      setReceiptDetails(response)
      setSelectedReceipt(receiptNumber)
      setShowReceiptModal(true)
    } catch (error) {
      console.error('Error fetching receipt details:', error)
      setError('Failed to fetch receipt details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReceipt = async () => {
    if (!selectedReceipt) return

    setCancelLoading(true)
    try {
      await receiptManagementApi.create('fees-payment/receipt/cancel', {
        receiptNumber: selectedReceipt,
        reason: 'Cancelled by admin',
      })

      setSuccess(`Receipt ${selectedReceipt} cancelled successfully`)
      setShowCancelModal(false)
      setShowReceiptModal(false)

      // Refresh receipts
      if (studentId) {
        await fetchStudentReceipts(studentId)
      }
    } catch (error) {
      console.error('Error cancelling receipt:', error)
      setError('Failed to cancel receipt: ' + (error.message || 'Unknown error'))
    } finally {
      setCancelLoading(false)
    }
  }

  const openCancelModal = (receiptNumber) => {
    setSelectedReceipt(receiptNumber)
    setShowCancelModal(true)
  }

  const refreshStudentData = async () => {
    if (!studentId || !formData.sessionId) {
      setError('Please select a student and session first')
      return
    }

    setLoading(true)
    try {
      // Call refresh endpoint to regenerate fees and fix inconsistencies
      const response = await fetch(
        `/api/receipt/refresh/${studentId}?sessionId=${formData.sessionId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to refresh student data')
      }

      setSuccess('Student fee data refreshed successfully')

      // Reload receipts after refresh
      await fetchStudentReceipts(studentId)
    } catch (error) {
      console.error('Error refreshing student data:', error)
      setError('Failed to refresh student data: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStudentId('')
    resetStudentSpecificData()
    setFormData({
      sessionId: defaultSession,
    })
    setSearchResults([])
    setShowDropdown(false)
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      PAID: 'success',
      PARTIAL: 'warning',
      PENDING: 'secondary',
      CANCELLED: 'danger',
    }
    return <CBadge color={statusColors[status] || 'secondary'}>{status}</CBadge>
  }

  return (
    <CContainer fluid className="px-2">
      {/* Alerts */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-2">
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="mb-2">
          {success}
        </CAlert>
      )}

      {/* Student Search & Information */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <h6 className="mb-0 fw-bold text-primary">🧾 Receipt Management System</h6>
        </CCardHeader>
        <CCardBody className="py-2">
          <CRow className="g-2 align-items-end">
            {/* Student Search */}
            <CCol md={4}>
              <div className="position-relative" ref={dropdownRef}>
                <CFormInput
                  size="sm"
                  placeholder={sessionLoading ? 'Loading...' : 'Enter or Search Admission Number *'}
                  value={studentId}
                  onChange={(e) => handleLiveSearch(e.target.value)}
                  autoComplete="off"
                  disabled={sessionLoading}
                />
                <label className="small text-muted">Student ID</label>
                {(loading || sessionLoading) && (
                  <CSpinner
                    color="primary"
                    size="sm"
                    style={{ position: 'absolute', right: '10px', top: '8px' }}
                  />
                )}

                {/* Compact Dropdown Results */}
                {showDropdown && (
                  <div
                    className="position-absolute w-100 bg-secondary border rounded-bottom shadow-lg"
                    style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 border-bottom cursor-pointer hover-bg-dark"
                        onClick={() => handleSelect(result)}
                        style={{
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = '#111111')}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = '#444444')}
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
            </CCol>

            <CCol md={2}>
              <CFormSelect
                size="sm"
                name="sessionId"
                value={formData.sessionId}
                onChange={handleChange}
              >
                <option value="">Select Session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </CFormSelect>
              <label className="small text-muted">Session *</label>
            </CCol>

            {/* Quick Actions */}
            <CCol md={6} className="text-end">
              <CButtonGroup size="sm">
                {studentId && (
                  <CButton
                    color="outline-primary"
                    onClick={refreshStudentData}
                    disabled={loading || !formData.sessionId}
                  >
                    🔄 Refresh Data
                  </CButton>
                )}
                <CButton color="outline-secondary" onClick={handleReset}>
                  🔄 Reset
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>

          {/* Student Info Display */}
          {studentExtraInfo.studentName && (
            <CRow className="mt-2 p-2 bg-dark rounded">
              <CCol sm={3} className="small">
                <strong>📝 {studentExtraInfo.studentName}</strong>
              </CCol>
              <CCol sm={3} className="small text-muted">
                🎓 Class: {studentExtraInfo.className}
              </CCol>
              <CCol sm={3} className="small text-muted">
                👥 Group: {studentExtraInfo.groupName || 'N/A'}
              </CCol>
              <CCol sm={3} className="small text-muted">
                📚 Section: {studentExtraInfo.section}
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Receipt List */}
      {receipts.length > 0 && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-primary">📋 Receipt History</h6>
              <CBadge color="info">Total: {receipts.length} receipts</CBadge>
            </div>
          </CCardHeader>
          <CCardBody className="py-2">
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <CTable bordered hover responsive size="sm">
                <CTableHead className="table-dark">
                  <CTableRow>
                    <CTableHeaderCell className="small py-1">📋 Receipt #</CTableHeaderCell>
                    <CTableHeaderCell className="small py-1">💰 Amount</CTableHeaderCell>
                    <CTableHeaderCell className="small py-1">📅 Date</CTableHeaderCell>
                    <CTableHeaderCell className="small py-1">📊 Status</CTableHeaderCell>
                    <CTableHeaderCell className="small py-1">🔧 Items</CTableHeaderCell>
                    <CTableHeaderCell className="small py-1">⚡ Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {receipts.map((receipt, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="small fw-bold">
                        {receipt.receiptNumber}
                      </CTableDataCell>
                      <CTableDataCell className="small text-end">
                        {formatCurrency(receipt.totalAmount)}
                      </CTableDataCell>
                      <CTableDataCell className="small">
                        {formatDate(receipt.paymentDate)}
                      </CTableDataCell>
                      <CTableDataCell className="small">
                        {getStatusBadge(receipt.status)}
                      </CTableDataCell>
                      <CTableDataCell className="small text-center">
                        <CBadge color="secondary">{receipt.numberOfItems || 0}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButtonGroup size="sm">
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleViewReceipt(receipt.receiptNumber)}
                          >
                            👁️
                          </CButton>
                          {receipt.status !== 'CANCELLED' && (
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => openCancelModal(receipt.receiptNumber)}
                            >
                              ❌
                            </CButton>
                          )}
                        </CButtonGroup>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* Receipt Details Modal */}
      <CModal visible={showReceiptModal} onClose={() => setShowReceiptModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Receipt Details - {selectedReceipt}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {receiptDetails && (
            <div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Student:</strong> {receiptDetails.studentName}
                </CCol>
                <CCol md={6}>
                  <strong>Admission #:</strong> {receiptDetails.admissionNumber}
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <strong>Total Amount:</strong> {formatCurrency(receiptDetails.totalAmount)}
                </CCol>
                <CCol md={6}>
                  <strong>Payment Date:</strong> {formatDate(receiptDetails.paymentDate)}
                </CCol>
              </CRow>

              <h6 className="fw-bold mb-2">Fee Details:</h6>
              <CTable bordered size="sm">
                <CTableHead className="table-light">
                  <CTableRow>
                    <CTableHeaderCell>Term</CTableHeaderCell>
                    <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                    <CTableHeaderCell>Amount Paid</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {receiptDetails.paidFees?.map((fee, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{fee.termName}</CTableDataCell>
                      <CTableDataCell>
                        {fee.receiptHeadName}
                        {fee.feeType === 'FINE' && (
                          <CBadge color="danger" className="ms-1">
                            Fine
                          </CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{formatCurrency(fee.paidAmount)}</CTableDataCell>
                      <CTableDataCell>{getStatusBadge(fee.status)}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowReceiptModal(false)}>
            Close
          </CButton>
          {receiptDetails?.status !== 'CANCELLED' && (
            <CButton
              color="danger"
              onClick={() => {
                setShowReceiptModal(false)
                openCancelModal(selectedReceipt)
              }}
            >
              Cancel Receipt
            </CButton>
          )}
        </CModalFooter>
      </CModal>

      {/* Cancel Confirmation Modal */}
      <CModal visible={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Receipt Cancellation</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Are you sure you want to cancel receipt <strong>{selectedReceipt}</strong>?
          </p>
          <p className="text-danger small">
            <strong>Warning:</strong> This action will reverse all payments associated with this
            receipt and cannot be undone.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCancelModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleCancelReceipt} disabled={cancelLoading}>
            {cancelLoading ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-3">
          <CSpinner color="primary" />
          <p className="mt-2 small">Loading data...</p>
        </div>
      )}
    </CContainer>
  )
}

export default ReceiptManagement
