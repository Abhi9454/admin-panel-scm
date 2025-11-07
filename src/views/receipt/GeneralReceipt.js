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
  CContainer,
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'

const GeneralReceipt = () => {
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
    groupName: '',
    fatherName: '',
    motherName: '',
  })

  // Form states
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Master data
  const [payModeList, setPayModeList] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [sessions, setSessions] = useState([])
  const [defaultSession, setDefaultSession] = useState('')
  const [generalReceipts, setGeneralReceipts] = useState([])

  // Form data
  const [formData, setFormData] = useState({
    receiptHead: '',
    sessionId: '',
    issueDate: new Date().toISOString().split('T')[0],
    payModeId: '',
    receiptNumber: '',
    narration: '',
    fees: '',
    fine: '',
    posCharges: '',
    concession: '',
    received: '',
    receiptDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    remarks: '',
  })

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  useEffect(() => {
    fetchInitialData()

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

  // Auto-calculate received amount when fees, fine, posCharges change
  useEffect(() => {
    const fees = parseFloat(formData.fees) || 0
    const fine = parseFloat(formData.fine) || 0
    const posCharges = parseFloat(formData.posCharges) || 0
    const concession = parseFloat(formData.concession) || 0

    const totalReceived = fees + fine + posCharges - concession

    setFormData((prev) => ({
      ...prev,
      received: totalReceived.toFixed(2),
    }))
  }, [formData.fees, formData.fine, formData.posCharges, formData.concession])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [sessionData, defaultSessionData, payModeData, receiptHeadData, receiptsData] =
        await Promise.all([
          schoolManagementApi.getAll('session/all'),
          schoolManagementApi.getAll('school-detail/session'),
          schoolManagementApi.getAll('paymode/all'),
          apiService.getAll('receipt-head/all'),
          apiService.getAll('general-receipt/all'),
        ])

      setSessions(sessionData)
      setDefaultSession(defaultSessionData)
      setPayModeList(payModeData)
      setReceiptHeads(receiptHeadData)
      setGeneralReceipts(receiptsData)
      setFormData((prev) => ({
        ...prev,
        sessionId: defaultSessionData,
      }))
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
      setSearchLoading(false)
      resetStudentData()
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
      groupName: selectedStudent.groupName || '',
      fatherName: selectedStudent.fatherName || '',
      motherName: selectedStudent.motherName || '',
    })
    setShowDropdown(false)
    setSearchResults([])
    setError(null)
    setSuccess(null)
  }

  const resetStudentData = () => {
    setStudentData({
      name: '',
      admissionNumber: '',
      className: '',
      sectionName: '',
      groupName: '',
      fatherName: '',
      motherName: '',
    })
  }

  const handleReset = () => {
    setStudentId('')
    resetStudentData()
    setSearchResults([])
    setShowDropdown(false)
    setFormData({
      receiptHead: '',
      sessionId: defaultSession,
      issueDate: new Date().toISOString().split('T')[0],
      payModeId: '',
      receiptNumber: '',
      narration: '',
      fees: '',
      fine: '',
      posCharges: '',
      concession: '',
      received: '',
      receiptDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      remarks: '',
    })
    setError(null)
    setSuccess(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!studentData.admissionNumber) {
      setError('Please select a student')
      return false
    }

    if (!formData.receiptHead) {
      setError('Please select receipt head')
      return false
    }

    if (!formData.sessionId) {
      setError('Please select session')
      return false
    }

    if (!formData.payModeId) {
      setError('Please select payment mode')
      return false
    }

    if (!formData.fees && !formData.fine && !formData.posCharges) {
      setError('Please enter at least one amount (Fees/Fine/POS Charges)')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    setError(null)

    if (!validateForm()) {
      return
    }

    setSubmitLoading(true)

    try {
      const requestData = {
        ...formData,
        studentId: studentData.admissionNumber,
        receiptHead: parseInt(formData.receiptHead),
        sessionId: parseInt(formData.sessionId),
        payModeId: parseInt(formData.payModeId),
        fees: parseFloat(formData.fees) || 0,
        fine: parseFloat(formData.fine) || 0,
        posCharges: parseFloat(formData.posCharges) || 0,
        concession: parseFloat(formData.concession) || 0,
        received: parseFloat(formData.received) || 0,
      }

      await apiService.create('general-receipt/add', requestData)
      setSuccess('General receipt created successfully!')

      // Refresh receipts list
      const receiptsData = await apiService.getAll('general-receipt/all')
      setGeneralReceipts(receiptsData)

      // Reset form
      handleReset()
    } catch (error) {
      console.error('Error adding receipt:', error)
      setError('Failed to create receipt: ' + (error.response?.data?.message || error.message))
    } finally {
      setSubmitLoading(false)
    }
  }

  const handlePrint = (receiptId) => {
    console.log('Print Receipt ID:', receiptId)
    // Add print functionality here
    alert('Print functionality to be implemented')
  }

  const handleEdit = (receiptId) => {
    console.log('Edit Receipt ID:', receiptId)
    // Add edit functionality here
    alert('Edit functionality to be implemented')
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

      {/* Create General Receipt Card */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <CRow className="align-items-center">
            <CCol md={10}>
              <h6 className="mb-0 fw-bold text-primary">🧾 Create General Receipt</h6>
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
            <CCol md={4}>
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

            <CCol md={3}>
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

            <CCol md={3}>
              <CFormSelect
                size="sm"
                name="receiptHead"
                value={formData.receiptHead}
                onChange={handleChange}
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

            <CCol md={2}>
              <CFormSelect
                size="sm"
                name="payModeId"
                value={formData.payModeId}
                onChange={handleChange}
              >
                <option value="">Select Pay Mode</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="DD">DD</option>
                <option value="NEFT/RTGS">NEFT/RTGS</option>
                <option value="UPI">UPI</option>
                <option value="Swipe">Swipe</option>
                <option value="Application">Application</option>
              </CFormSelect>
              <label className="small text-muted">Payment Mode *</label>
            </CCol>
          </CRow>

          {/* Student Info Display */}
          {studentData.name && (
            <CRow className="mb-3 p-2 bg-dark rounded">
              <CCol sm={3} className="small">
                <strong>📝 Name:</strong> {studentData.name}
              </CCol>
              <CCol sm={2} className="small">
                <strong>Class:</strong> {studentData.className}
              </CCol>
              <CCol sm={2} className="small">
                <strong>Section:</strong> {studentData.sectionName}
              </CCol>
              <CCol sm={2} className="small">
                <strong>Group:</strong> {studentData.groupName || 'N/A'}
              </CCol>
              <CCol sm={3} className="small">
                <strong>Father:</strong> {studentData.fatherName || 'N/A'}
              </CCol>
            </CRow>
          )}

          {/* Receipt Details Section */}
          <div className="bg-secondary p-2 rounded mb-3">
            <h6 className="mb-2 fw-bold text-white">💰 Receipt Details</h6>
            <CRow className="g-2">
              <CCol md={3}>
                <CFormInput
                  size="sm"
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                />
                <label className="small text-muted">Issue Date</label>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  size="sm"
                  type="date"
                  name="receiptDate"
                  value={formData.receiptDate}
                  onChange={handleChange}
                />
                <label className="small text-muted">Receipt Date</label>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  size="sm"
                  name="receiptNumber"
                  placeholder="Auto-generated if empty"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                />
                <label className="small text-muted">Receipt Number (Optional)</label>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  size="sm"
                  name="referenceNumber"
                  placeholder="Cheque/DD/Transaction No"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                />
                <label className="small text-muted">Reference Number</label>
              </CCol>
            </CRow>
          </div>

          {/* Amount Details Section */}
          <div className="bg-secondary p-2 rounded mb-3">
            <h6 className="mb-2 fw-bold text-white">💵 Amount Details</h6>
            <CRow className="g-2">
              <CCol md={2}>
                <CFormInput
                  size="sm"
                  type="number"
                  name="fees"
                  placeholder="0.00"
                  value={formData.fees}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                <label className="small text-muted">Fees (₹)</label>
              </CCol>

              <CCol md={2}>
                <CFormInput
                  size="sm"
                  type="number"
                  name="fine"
                  placeholder="0.00"
                  value={formData.fine}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                <label className="small text-muted">Fine (₹)</label>
              </CCol>

              <CCol md={2}>
                <CFormInput
                  size="sm"
                  type="number"
                  name="posCharges"
                  placeholder="0.00"
                  value={formData.posCharges}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                <label className="small text-muted">POS Charges (₹)</label>
              </CCol>

              <CCol md={2}>
                <CFormInput
                  size="sm"
                  type="number"
                  name="concession"
                  placeholder="0.00"
                  value={formData.concession}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
                <label className="small text-muted">Concession (₹)</label>
              </CCol>

              <CCol md={2}>
                <CFormInput
                  size="sm"
                  type="number"
                  name="received"
                  value={formData.received}
                  readOnly
                  className="fw-bold"
                  style={{ backgroundColor: '#444444' }}
                />
                <label className="small text-success fw-bold">Total Received (₹)</label>
              </CCol>

              <CCol md={2} className="d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <CBadge color="success" className="fs-6 px-3 py-2">
                    ₹{formData.received || '0.00'}
                  </CBadge>
                  <div className="small text-muted">Final Amount</div>
                </div>
              </CCol>
            </CRow>
          </div>

          {/* Narration and Remarks Section */}
          <CRow className="g-2 mb-3">
            <CCol md={6}>
              <CFormInput
                size="sm"
                name="narration"
                placeholder="Enter payment narration"
                value={formData.narration}
                onChange={handleChange}
              />
              <label className="small text-muted">Narration</label>
            </CCol>

            <CCol md={6}>
              <CFormInput
                size="sm"
                name="remarks"
                placeholder="Additional remarks"
                value={formData.remarks}
                onChange={handleChange}
              />
              <label className="small text-muted">Remarks</label>
            </CCol>
          </CRow>

          {/* Submit Button */}
          <div className="text-end">
            <CButtonGroup>
              <CButton
                color="success"
                onClick={handleSubmit}
                disabled={submitLoading || !studentData.name}
              >
                {submitLoading ? (
                  <>
                    <CSpinner size="sm" className="me-1" />
                    Creating...
                  </>
                ) : (
                  <>💾 Create Receipt</>
                )}
              </CButton>
              <CButton color="outline-secondary" onClick={handleReset}>
                Clear
              </CButton>
            </CButtonGroup>
          </div>
        </CCardBody>
      </CCard>

      {/* All General Receipts Table */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <h6 className="mb-0 fw-bold text-info">📋 All General Receipts</h6>
        </CCardHeader>
        <CCardBody className="py-2">
          <CTable bordered hover responsive size="sm">
            <CTableHead className="table-light">
              <CTableRow>
                <CTableHeaderCell className="small">#</CTableHeaderCell>
                <CTableHeaderCell className="small">Receipt No.</CTableHeaderCell>
                <CTableHeaderCell className="small">Student Name</CTableHeaderCell>
                <CTableHeaderCell className="small">Class</CTableHeaderCell>
                <CTableHeaderCell className="small">Receipt Head</CTableHeaderCell>
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
              {generalReceipts.length > 0 ? (
                generalReceipts.map((receipt, index) => (
                  <CTableRow key={receipt.id}>
                    <CTableDataCell className="small">{index + 1}</CTableDataCell>
                    <CTableDataCell className="small fw-bold">
                      {receipt.receiptNumber}
                    </CTableDataCell>
                    <CTableDataCell className="small">
                      {receipt.studentName || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell className="small">{receipt.className || 'N/A'}</CTableDataCell>
                    <CTableDataCell className="small">
                      {receipt.receiptHeadName || 'N/A'}
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
                      {receipt.active ? (
                        <CBadge color="success">Active</CBadge>
                      ) : (
                        <CBadge color="danger">Cancelled</CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell className="small text-center">
                      <CButtonGroup size="sm">
                        <CButton
                          color="warning"
                          size="sm"
                          onClick={() => handleEdit(receipt.id)}
                          disabled={!receipt.active}
                        >
                          ✏️
                        </CButton>
                        <CButton color="primary" size="sm" onClick={() => handlePrint(receipt.id)}>
                          🖨️
                        </CButton>
                      </CButtonGroup>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="12" className="text-center text-muted">
                    No general receipts found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default GeneralReceipt
