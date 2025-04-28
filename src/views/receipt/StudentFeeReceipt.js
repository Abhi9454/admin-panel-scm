import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'

const StudentFeeReceipt = () => {
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(false)
  const [studentId, setStudentId] = useState('')
  const [feeData, setFeeData] = useState(null)
  const [filteredFeeData, setFilteredFeeData] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [tableData, setTableData] = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [feeDataLoaded, setFeeDataLoaded] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [studentExtraInfo, setStudentExtraInfo] = useState({
    className: '',
    studentName: '',
    groupName: '',
  })
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    receivedBy: 'School',
    paymentMode: '',
    sessionId: '',
    registrationNumber: '',
    termId: '',
    receiptNumber: '',
    totalAdvance: '',
    advanceDeduct: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [sessionData, termData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('term/all'),
      ])
      setSessions(sessionData)
      setTerms(termData)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === 'termId') {
      handleTermSelect(value) // 👈 call this when term changes
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    if (!studentId.trim()) return
    try {
      const response = await studentManagementApi.getById('search', studentId)
      console.log('This is response of search ', response)
      setSearchResults(response)
      setShowModal(true)
    } catch (error) {
      console.error('Search failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (selectedStudent) => {
    setStudentId(selectedStudent.admissionNumber)
    setFormData((prev) => ({
      ...prev,
      admissionNumber: selectedStudent.admissionNumber,
    }))
    setStudentExtraInfo({
      className: selectedStudent.className || '',
      studentName: selectedStudent.name || '',
      groupName: selectedStudent.groupName || '',
    })
    setShowModal(false)
  }

  useEffect(() => {
    if (studentId) {
      searchStudentFeeByAdmissionNumber()
    }
  }, [studentId])

  const handleTermSelect = (selectedTermId) => {
    if (!feeData || !feeData[0]?.feeTerms) return

    const feeTerms = feeData[0].feeTerms
    const newTableData = []
    const selectedTermName =
      terms.find((term) => term.id === parseInt(selectedTermId))?.name || 'Unknown Term'

    for (const receiptHead in feeTerms) {
      const feeAmount = feeTerms[receiptHead][selectedTermId]

      if (feeAmount > 0) {
        newTableData.push({
          term: selectedTermName,
          receiptHead: receiptHead,
          prvBal: 0, // You can set dynamic values here if needed
          fees: feeAmount,
          adjust: 0,
          concession: 0,
          amount: feeAmount,
          balance: 0 - feeAmount,
        })
      }
    }

    // Set the table data state
    setTableData((prevData) => [...prevData, ...newTableData])

    // Recalculate the grand total
    calculateGrandTotal([...tableData, ...newTableData])
  }

  const calculateGrandTotal = (rows) => {
    // Calculate total amount
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0)

    // Calculate total balance (only considering 'Dr' values)
    const totalBalance = rows.reduce((sum, row) => {
      if (row.balance.includes('Dr')) {
        // Add balance as Dr if it's negative (subtract amount from fees)
        sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      }
      return sum
    }, 0)

    // Update state with total amounts and total balance
    setGrandTotal(totalAmount)
    setTotalBalance(totalBalance) // Assuming you have a state for balance total
  }
  const searchStudentFeeByAdmissionNumber = async () => {
    setLoading(true)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', {
        admissionNumber: studentId,
        sessionId: formData.sessionId,
      })
      setFeeData(students)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('This is student fee map', feeData)
    if (!feeData) {
      setFilteredFeeData(null)
      return
    }

    const selectedTermId = parseInt(formData.termId)
    const termFeeDetails = {}

    Object.entries(feeData[0]?.feeTerms || {}).forEach(([receiptHead, termMap]) => {
      if (termMap[selectedTermId] > 0) {
        termFeeDetails[receiptHead] = termMap[selectedTermId]
      }
    })

    setFilteredFeeData(termFeeDetails)
    setFeeDataLoaded(true)
    console.log('THis is filered fee data ', filteredFeeData)
  }, [formData.termId, feeData, terms])

  const totalAmount = filteredFeeData
    ? Object.values(filteredFeeData).reduce((sum, value) => sum + value, 0)
    : 0

  const handleAmountChange = (index, newAmount) => {
    const updatedTableData = [...tableData]
    const amount = parseFloat(newAmount)
    const fees = updatedTableData[index].fees

    if (amount > fees) {
      // Show an alert if the amount is greater than the fee
      alert('Value cannot be greater than Fee!')
      return // Exit the function to prevent further updates
    }

    // Update amount
    updatedTableData[index].amount = amount

    // If the amount equals the fees, set balance to '0'
    if (amount === fees) {
      updatedTableData[index].balance = '0'
    } else if (amount < fees) {
      // If the amount is less than fees, subtract amount from fees and show balance as 'Dr'
      updatedTableData[index].balance = `${fees - amount} Dr`
    }

    // Update table data and recalculate the total balance
    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
  }

  useEffect(() => {
    // Assuming the table data is initially loaded with the correct fees and amount
    const initialTableData = [...tableData]

    // Set initial balance to '0' after term selection
    initialTableData.forEach((row, index) => {
      if (row.amount === row.fees) {
        initialTableData[index].balance = '0'
      } else {
        // Set the initial balance as 'Dr' if the amount is less than the fee
        initialTableData[index].balance = `${row.fees - row.amount} Dr`
      }
    })

    setTableData(initialTableData)
  }, [formData.termId]) // Re-run when termId changes

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Fee Receipt</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              {/* Form Part */}
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Date<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    name="receivedBy"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Received By<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    value={formData.receivedBy}
                    onChange={handleChange}
                  >
                    <option value="School">School</option>
                    <option value="Bank">Bank</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    name="sessionId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Session<span style={{ color: 'red' }}> *</span>
                      </>
                    }
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
                </CCol>
              </CRow>

              {/* Student Info */}
              <CRow className="mb-3">
                <CCol md={3}>
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
                  <CButton color="primary" onClick={handleSearch} className="mt-2">
                    Search
                  </CButton>
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel="Student Name"
                    type="text"
                    value={studentExtraInfo.studentName}
                    readOnly
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel="Class"
                    type="text"
                    value={studentExtraInfo.className}
                    readOnly
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel="Group"
                    type="text"
                    value={studentExtraInfo.groupName}
                    readOnly
                  />
                </CCol>
              </CRow>

              {/* Payment Info */}
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormSelect
                    name="termId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Term<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    disabled={!feeDataLoaded}
                    value={formData.termId}
                    onChange={handleChange}
                  >
                    <option value="">Select Term</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormSelect
                    name="paymentMode"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Pay Mode<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    value={formData.paymentMode}
                    onChange={handleChange}
                  >
                    <option value="">Select Payment Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="DD">DD</option>
                    <option value="NEFT/RTGS">NEFT/RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Swipe">Swipe</option>
                    <option value="Application">Application</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="text"
                    floatingClassName="mb-3"
                    floatingLabel={<>Total Advance</>}
                    name="totalAdvance"
                    value={formData.totalAdvance}
                    readOnly
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="text"
                    floatingClassName="mb-3"
                    floatingLabel={<>Advance Deduct</>}
                    name="advanceDeduct"
                    value={formData.advanceDeduct}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
            </CForm>
            <div style={{ marginTop: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
              <CTable bordered hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Term</CTableHeaderCell>
                    <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                    <CTableHeaderCell>Prv. Bal.</CTableHeaderCell>
                    <CTableHeaderCell>Fees</CTableHeaderCell>
                    <CTableHeaderCell>Adjust</CTableHeaderCell>
                    <CTableHeaderCell>Concession</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Balance</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableData.map((row, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{row.term}</CTableDataCell>
                      <CTableDataCell>{row.receiptHead}</CTableDataCell>
                      <CTableDataCell>{row.prvBal}</CTableDataCell>
                      <CTableDataCell>{row.fees}</CTableDataCell>
                      <CTableDataCell>{row.adjust}</CTableDataCell>
                      <CTableDataCell>{row.concession}</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          value={row.amount}
                          onChange={(e) => handleAmountChange(index, e.target.value)}
                        />
                      </CTableDataCell>
                      {/* Conditionally show balance based on amount change */}
                      <CTableDataCell>{row.balance ? row.balance : ''}</CTableDataCell>
                    </CTableRow>
                  ))}
                  <CTableRow color="light">
                    <CTableHeaderCell colSpan={6}>Grand Total</CTableHeaderCell>
                    <CTableHeaderCell>{grandTotal}</CTableHeaderCell>
                    {/* Add total balance here, if needed */}
                    <CTableHeaderCell>{totalBalance}</CTableHeaderCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      {loading && <CSpinner color="primary" />}
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
                    <CButton color="primary" size="sm" onClick={() => handleSelect(student)}>
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
    </CRow>
  )
}

export default StudentFeeReceipt
