import React, { useEffect, useState, useRef } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CBadge,
  CContainer,
  CButtonGroup,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import schoolManagementApi from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'
import miscFeeApi from '../../api/receiptManagementApi'

const StudentMiscFee = () => {
  const [studentData, setStudentData] = useState({
    name: '',
    className: '',
    sectionName: '',
    groupName: '',
  })
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [feeLoading, setFeeLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [studentId, setStudentId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)

  // Fee structure states
  const [feeStructureData, setFeeStructureData] = useState(null)
  const [receiptHeads, setReceiptHeads] = useState([])

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentTerm, setCurrentTerm] = useState(null)
  const [newMiscFee, setNewMiscFee] = useState({
    receiptHeadId: '',
    amount: '',
  })

  // Session states
  const [sessions, setSessions] = useState([])
  const [defaultSession, setDefaultSession] = useState('')
  const [formData, setFormData] = useState({
    sessionId: '',
  })

  const dropdownRef = useRef(null)
  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

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
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [sessionData, defaultSessionData, receiptHeadData] = await Promise.all([
        schoolManagementApi.getAll('session/all'),
        schoolManagementApi.getAll('school-detail/session'),
        miscFeeApi.getAll('receipt-head/all'),
      ])
      setSessions(sessionData)
      setDefaultSession(defaultSessionData)
      setReceiptHeads(receiptHeadData)
      setFormData({ sessionId: defaultSessionData })
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to fetch initial data')
    } finally {
      setLoading(false)
    }
  }

  const handleLiveSearch = async (value) => {
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      resetAllData()
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
      className: selectedStudent.className || '',
      sectionName: selectedStudent.sectionName || '',
      groupName: selectedStudent.groupName || '',
    })
    setShowDropdown(false)
    setSearchResults([])
    setError(null)
    setSuccess(null)

    await loadStudentFeeStructure(selectedStudent.admissionNumber)
  }

  const loadStudentFeeStructure = async (admissionNumber) => {
    setFeeLoading(true)
    try {
      const sessionIdToUse = formData.sessionId || defaultSession
      if (!sessionIdToUse) {
        setError('Session not selected')
        return
      }

      const response = await miscFeeApi.getAll(
        `misc-fee/student/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      if (response?.termWiseFees && response.termWiseFees.length > 0) {
        setFeeStructureData(response)
      } else {
        setError('No fee structure found for this student')
        setFeeStructureData(null)
      }
    } catch (error) {
      console.error('Error fetching fees:', error)
      setError('Failed to fetch student fee data')
      setFeeStructureData(null)
    } finally {
      setFeeLoading(false)
    }
  }

  const handleReset = () => {
    setStudentId('')
    resetAllData()
    setSearchResults([])
    setShowDropdown(false)
  }

  const resetAllData = () => {
    setStudentId('')
    setStudentData({
      name: '',
      className: '',
      sectionName: '',
      groupName: '',
    })
    setFeeStructureData(null)
    setError(null)
    setSuccess(null)
    setFormData({ sessionId: defaultSession })
  }

  const handleAddClick = (term) => {
    setCurrentTerm(term)
    setNewMiscFee({
      receiptHeadId: '',
      amount: '',
    })
    setShowAddModal(true)
  }

  const handleAddMiscFee = async () => {
    if (!newMiscFee.receiptHeadId || !newMiscFee.amount) {
      setError('Please select receipt head and enter amount')
      return
    }

    try {
      const requestData = {
        admissionNumber: studentId,
        termId: currentTerm.termId,
        receiptHeadId: parseInt(newMiscFee.receiptHeadId),
        amount: parseFloat(newMiscFee.amount),
      }

      await miscFeeApi.create('misc-fee/add', requestData)
      setSuccess('Misc fee added successfully!')
      setShowAddModal(false)

      // Reload fee structure
      await loadStudentFeeStructure(studentId)
    } catch (error) {
      console.error('Error adding misc fee:', error)
      setError('Failed to add misc fee: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteMiscFee = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this misc fee?')) {
      return
    }

    try {
      await miscFeeApi.delete(`misc-fee/delete/${entryId}`)
      setSuccess('Misc fee deleted successfully!')

      // Reload fee structure
      await loadStudentFeeStructure(studentId)
    } catch (error) {
      console.error('Error deleting misc fee:', error)
      setError('Failed to delete misc fee')
    }
  }

  const renderTermAccordion = () => {
    if (!feeStructureData) return null

    return (
      <CAccordion>
        {feeStructureData.termWiseFees.map((term) => (
          <CAccordionItem key={term.termId} itemKey={term.termId.toString()}>
            <CAccordionHeader>
              <div className="d-flex justify-content-between w-100 me-3">
                <span className="fw-bold">📅 {term.termName}</span>
                <div>
                  <CBadge color="primary" className="me-2">
                    Total: ₹{term.termTotal.toFixed(2)}
                  </CBadge>
                  {term.miscTotal > 0 && (
                    <CBadge color="info" className="me-2">
                      Misc: ₹{term.miscTotal.toFixed(2)}
                    </CBadge>
                  )}
                </div>
              </div>
            </CAccordionHeader>
            <CAccordionBody>
              {/* Regular Fees */}
              <div className="mb-3">
                <h6 className="text-success mb-2">📋 Regular Fees</h6>
                <CTable bordered size="sm">
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Paid</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {term.regularFees.length > 0 ? (
                      term.regularFees.map((fee, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>{fee.receiptHeadName}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            ₹{fee.amount.toFixed(2)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end text-info">
                            {fee.paidAmount > 0 ? `₹${fee.paidAmount.toFixed(2)}` : '-'}
                          </CTableDataCell>
                          <CTableDataCell className="text-end text-primary fw-bold">
                            ₹{fee.balanceAmount.toFixed(2)}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={4} className="text-center text-muted">
                          No regular fees
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>

              {/* Misc Fees */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-warning mb-0">💰 Miscellaneous Fees</h6>
                  <CButton color="success" size="sm" onClick={() => handleAddClick(term)}>
                    ➕ Add Misc Fee
                  </CButton>
                </div>
                <CTable bordered size="sm">
                  <CTableHead className="table-warning">
                    <CTableRow>
                      <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Amount</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Paid</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">Balance</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {term.miscFees.length > 0 ? (
                      term.miscFees.map((miscFee, idx) => (
                        <CTableRow key={idx}>
                          <CTableDataCell>{miscFee.receiptHeadName}</CTableDataCell>
                          <CTableDataCell className="text-end">
                            ₹{miscFee.amount.toFixed(2)}
                          </CTableDataCell>
                          <CTableDataCell className="text-end text-info">
                            {miscFee.paidAmount > 0 ? `₹${miscFee.paidAmount.toFixed(2)}` : '-'}
                          </CTableDataCell>
                          <CTableDataCell className="text-end text-primary fw-bold">
                            ₹{miscFee.balanceAmount.toFixed(2)}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteMiscFee(miscFee.entryId)}
                              disabled={miscFee.paidAmount > 0}
                            >
                              🗑️ Delete
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={5} className="text-center text-muted">
                          No misc fees added
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>

              {/* Term Summary */}
              <div className="bg-light p-2 rounded">
                <CRow>
                  <CCol md={4}>
                    <strong>Regular Total:</strong> ₹{term.regularTotal.toFixed(2)}
                  </CCol>
                  <CCol md={4}>
                    <strong>Misc Total:</strong> ₹{term.miscTotal.toFixed(2)}
                  </CCol>
                  <CCol md={4}>
                    <strong>Term Total:</strong> ₹{term.termTotal.toFixed(2)}
                  </CCol>
                </CRow>
              </div>
            </CAccordionBody>
          </CAccordionItem>
        ))}
      </CAccordion>
    )
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

      {/* Student Search Card */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <CRow className="align-items-center">
            <CCol md={10}>
              <h6 className="mb-0 fw-bold text-primary">💰 Student Miscellaneous Fee Management</h6>
            </CCol>
            <CCol md={2} className="text-end">
              <CButton color="outline-secondary" size="sm" onClick={handleReset}>
                🔄 Reset
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="py-2">
          <CRow className="g-2 align-items-end">
            {/* Student Search */}
            <CCol md={6}>
              <div className="position-relative" ref={dropdownRef}>
                <CFormInput
                  size="sm"
                  placeholder="Enter or Search Admission Number / Name *"
                  value={studentId}
                  onChange={(e) => handleLiveSearch(e.target.value)}
                  autoComplete="off"
                />
                <label className="small text-muted">Student Search</label>
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

            <CCol md={3}>
              <CFormSelect
                size="sm"
                value={formData.sessionId}
                onChange={(e) => {
                  setFormData({ sessionId: e.target.value })
                  if (studentId) {
                    resetAllData()
                  }
                }}
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
          </CRow>

          {/* Student Info Display */}
          {studentData.name && (
            <CRow className="mt-2 p-2 bg-dark rounded">
              <CCol sm={3} className="small">
                <strong>📝 {studentData.name}</strong>
              </CCol>
              <CCol sm={2} className="small text-muted">
                🎓 {studentData.className}
              </CCol>
              <CCol sm={2} className="small text-muted">
                📚 {studentData.sectionName}
              </CCol>
              <CCol sm={2} className="small text-muted">
                👥 {studentData.groupName || 'N/A'}
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Loading Indicator */}
      {feeLoading && (
        <div className="text-center py-3">
          <CSpinner color="primary" />
          <p className="mt-2 small">Loading fee data...</p>
        </div>
      )}

      {/* Fee Structure Display */}
      {feeStructureData && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <h6 className="mb-0 fw-bold text-success">📊 Fee Structure with Misc Fees</h6>
          </CCardHeader>
          <CCardBody className="py-2">{renderTermAccordion()}</CCardBody>
        </CCard>
      )}

      {/* No Data State */}
      {!studentId && !feeLoading && (
        <CCard className="mb-2 shadow-sm">
          <CCardBody className="text-center py-4">
            <div className="text-muted">
              <h5 className="mb-3">🔍 Search for a Student</h5>
              <p>Enter student admission number or name to manage miscellaneous fees</p>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* Add Misc Fee Modal */}
      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader>
          <CModalTitle>Add Miscellaneous Fee - {currentTerm?.termName}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="mb-3">
            <CCol>
              <CFormSelect
                value={newMiscFee.receiptHeadId}
                onChange={(e) => setNewMiscFee({ ...newMiscFee, receiptHeadId: e.target.value })}
              >
                <option value="">Select Receipt Head</option>
                {receiptHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.headName}
                  </option>
                ))}
              </CFormSelect>
              <label className="small text-muted">Receipt Head *</label>
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <CFormInput
                type="number"
                placeholder="Enter amount"
                value={newMiscFee.amount}
                onChange={(e) => setNewMiscFee({ ...newMiscFee, amount: e.target.value })}
                min="0"
                step="0.01"
              />
              <label className="small text-muted">Amount *</label>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleAddMiscFee}>
            Add Misc Fee
          </CButton>
        </CModalFooter>
      </CModal>
    </CContainer>
  )
}

export default StudentMiscFee
