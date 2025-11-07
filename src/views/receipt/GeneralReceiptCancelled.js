import React, { useEffect, useState, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
  CContainer,
  CBadge,
  CButtonGroup,
  CFormSelect,
} from '@coreui/react'
import studentManagementApi from '../../api/studentManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const GeneralReceiptCancelled = () => {
  // Student search states
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const dropdownRef = useRef(null)

  // Student data
  const [studentData, setStudentData] = useState({
    name: '',
    admissionNumber: '',
    className: '',
    sectionName: '',
  })

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [generalReceipts, setGeneralReceipts] = useState([])

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  useEffect(() => {
    // Close dropdown when clicking outside
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

  const handleLiveSearch = async (value) => {
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSearchLoading(false)
      resetStudentData()
      setGeneralReceipts([])
      return
    }

    if (value.trim().length < MIN_SEARCH_LENGTH) {
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
      } catch (error) {
        console.error('Search failed', error)
        setSearchResults([])
        setError('Search failed. Please try again.')
      } finally {
        setSearchLoading(false)
      }
    }, DEBOUNCE_DELAY)

    setDebounceTimeout(timeout)
  }

  const handleSelect = async (selectedStudent) => {
    setStudentId(selectedStudent.admissionNumber)
    setStudentData({
      name: selectedStudent.name || '',
      admissionNumber: selectedStudent.admissionNumber || '',
      className: selectedStudent.className || '',
      sectionName: selectedStudent.sectionName || '',
    })
    setShowDropdown(false)
    setSearchResults([])
    setError(null)
    setSuccess(null)

    // Fetch receipts for selected student
    await fetchGeneralReceipts(selectedStudent.admissionNumber)
  }

  const resetStudentData = () => {
    setStudentData({
      name: '',
      admissionNumber: '',
      className: '',
      sectionName: '',
    })
  }

  const handleReset = () => {
    setStudentId('')
    resetStudentData()
    setSearchResults([])
    setShowDropdown(false)
    setGeneralReceipts([])
    setError(null)
    setSuccess(null)
  }

  const fetchGeneralReceipts = async (admissionNumber) => {
    if (!admissionNumber) {
      setError('Please select a student')
      return
    }

    setLoading(true)
    try {
      const data = await receiptManagementApi.getAll(`general-receipt/search/${admissionNumber}`)
      setGeneralReceipts(Array.isArray(data) ? data : [])

      if (data.length === 0) {
        setError('No receipts found for this student')
      }
    } catch (error) {
      console.error('Error fetching general receipts:', error)
      setError('Failed to fetch receipts')
      setGeneralReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (receiptId, currentStatus) => {
    const newStatus = currentStatus ? false : true
    const statusText = newStatus ? 'Active' : 'Cancelled'

    if (
      !window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'cancel'} this receipt?`)
    ) {
      return
    }

    setLoading(true)
    try {
      await receiptManagementApi.create(`general-receipt/${receiptId}/deactivate`)

      // Update local state
      setGeneralReceipts((prevReceipts) =>
        prevReceipts.map((receipt) =>
          receipt.id === receiptId ? { ...receipt, active: newStatus } : receipt,
        ),
      )

      setSuccess(`Receipt ${newStatus ? 'activated' : 'cancelled'} successfully!`)
    } catch (error) {
      console.error('Error updating receipt status:', error)
      setError('Failed to update receipt status')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = (receiptId) => {
    console.log(`Printing receipt ${receiptId}`)
    alert('Print functionality to be implemented')
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

      {/* Search Card */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <CRow className="align-items-center">
            <CCol md={10}>
              <h6 className="mb-0 fw-bold text-primary">🔍 Search General Receipts</h6>
            </CCol>
            <CCol md={2} className="text-end">
              <CButton color="outline-secondary" size="sm" onClick={handleReset}>
                🔄 Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="py-2">
          {/* Student Search Section */}
          <CRow className="g-2 align-items-end mb-3">
            <CCol md={6}>
              <div className="position-relative" ref={dropdownRef}>
                <CFormInput
                  size="sm"
                  placeholder="Enter or Search Admission Number / Name *"
                  value={studentId}
                  onChange={(e) => handleLiveSearch(e.target.value)}
                  autoComplete="off"
                />
                <label className="small text-muted">Student Search *</label>
                {searchLoading && (
                  <CSpinner
                    color="primary"
                    size="sm"
                    style={{ position: 'absolute', right: '10px', top: '8px' }}
                  />
                )}

                {/* Search Dropdown */}
                {showDropdown && (
                  <div
                    className="position-absolute w-100 bg-secondary border rounded-bottom shadow-lg"
                    style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 border-bottom cursor-pointer"
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
          </CRow>

          {/* Student Info Display */}
          {studentData.name && (
            <CRow className="p-2 bg-dark rounded">
              <CCol sm={4} className="small">
                <strong>📝 Name:</strong> {studentData.name}
              </CCol>
              <CCol sm={3} className="small">
                <strong>🎓 Class:</strong> {studentData.className}
              </CCol>
              <CCol sm={3} className="small">
                <strong>📚 Section:</strong> {studentData.sectionName}
              </CCol>
              <CCol sm={2} className="small">
                <strong>🆔 Adm. No:</strong> {studentData.admissionNumber}
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Loading Indicator */}
      {loading && !generalReceipts.length && (
        <div className="text-center py-3">
          <CSpinner color="primary" />
          <p className="mt-2 small">Loading receipts...</p>
        </div>
      )}

      {/* Receipts Table */}
      {generalReceipts.length > 0 && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-warning">📋 General Receipts</h6>
              <CBadge color="info">{generalReceipts.length} Receipt(s) Found</CBadge>
            </div>
          </CCardHeader>
          <CCardBody className="py-2">
            <CTable bordered hover responsive size="sm">
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell className="small">#</CTableHeaderCell>
                  <CTableHeaderCell className="small">Receipt No.</CTableHeaderCell>
                  <CTableHeaderCell className="small">Student Name</CTableHeaderCell>
                  <CTableHeaderCell className="small">Pay Mode</CTableHeaderCell>
                  <CTableHeaderCell className="small text-end">Fees</CTableHeaderCell>
                  <CTableHeaderCell className="small text-end">Fine</CTableHeaderCell>
                  <CTableHeaderCell className="small text-end">Concession</CTableHeaderCell>
                  <CTableHeaderCell className="small text-end">Received</CTableHeaderCell>
                  <CTableHeaderCell className="small text-center">Status</CTableHeaderCell>
                  <CTableHeaderCell className="small text-center">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {generalReceipts.map((receipt, index) => (
                  <CTableRow key={receipt.id}>
                    <CTableDataCell className="small">{index + 1}</CTableDataCell>
                    <CTableDataCell className="small fw-bold">
                      {receipt.receiptNumber}
                    </CTableDataCell>
                    <CTableDataCell className="small">
                      {receipt.studentName || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell className="small">
                      {receipt.payModeName || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell className="small text-end">
                      ₹{receipt.fees?.toFixed(2) || '0.00'}
                    </CTableDataCell>
                    <CTableDataCell className="small text-end">
                      ₹{receipt.fine?.toFixed(2) || '0.00'}
                    </CTableDataCell>
                    <CTableDataCell className="small text-end text-success">
                      ₹{receipt.concession?.toFixed(2) || '0.00'}
                    </CTableDataCell>
                    <CTableDataCell className="small text-end fw-bold text-primary">
                      ₹{receipt.received?.toFixed(2) || '0.00'}
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">
                      <CFormSelect
                        size="sm"
                        value={receipt.active ? 'Active' : 'Cancelled'}
                        onChange={(e) => handleStatusChange(receipt.id, receipt.active)}
                        style={{
                          width: '110px',
                          fontSize: '0.75rem',
                          backgroundColor: receipt.active ? '#d1f2eb' : '#f8d7da',
                          color: receipt.active ? '#0f5132' : '#842029',
                          fontWeight: 'bold',
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Cancelled">Cancelled</option>
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">
                      <CButtonGroup size="sm">
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => handlePrint(receipt.id)}
                          title="Print Receipt"
                        >
                          🖨️
                        </CButton>
                      </CButtonGroup>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            {/* Summary Footer */}
            <div className="bg-light p-2 rounded mt-2">
              <CRow>
                <CCol md={3}>
                  <strong>Total Receipts:</strong> {generalReceipts.length}
                </CCol>
                <CCol md={3}>
                  <strong>Active:</strong>{' '}
                  <CBadge color="success">{generalReceipts.filter((r) => r.active).length}</CBadge>
                </CCol>
                <CCol md={3}>
                  <strong>Cancelled:</strong>{' '}
                  <CBadge color="danger">{generalReceipts.filter((r) => !r.active).length}</CBadge>
                </CCol>
                <CCol md={3} className="text-end">
                  <strong>Total Amount:</strong>{' '}
                  <span className="text-primary fw-bold">
                    ₹
                    {generalReceipts
                      .filter((r) => r.active)
                      .reduce((sum, r) => sum + (r.received || 0), 0)
                      .toFixed(2)}
                  </span>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* No Data State */}
      {!studentId && !loading && (
        <CCard className="mb-2 shadow-sm">
          <CCardBody className="text-center py-4">
            <div className="text-muted">
              <h5 className="mb-3">🔍 Search for a Student</h5>
              <p>Enter student admission number or name to view their general receipts</p>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* No Receipts Found State */}
      {studentData.name && generalReceipts.length === 0 && !loading && (
        <CCard className="mb-2 shadow-sm">
          <CCardBody className="text-center py-4">
            <div className="text-muted">
              <h5 className="mb-3">📭 No Receipts Found</h5>
              <p>No general receipts found for {studentData.name}</p>
            </div>
          </CCardBody>
        </CCard>
      )}
    </CContainer>
  )
}

export default GeneralReceiptCancelled
