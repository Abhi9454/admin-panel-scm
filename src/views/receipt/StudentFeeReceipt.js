import React, { useEffect, useState, useRef } from 'react'
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
  const [showDropdown, setShowDropdown] = useState(false)
  const [tableData, setTableData] = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [customGrandTotal, setCustomGrandTotal] = useState('')
  const [feeDataLoaded, setFeeDataLoaded] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [defaultSession, setDefaultSession] = useState('')
  const [termTotals, setTermTotals] = useState({})
  const [studentExtraInfo, setStudentExtraInfo] = useState({
    className: '',
    studentName: '',
    groupName: '',
    section: '',
  })
  const searchTimeout = useRef(null)
  const dropdownRef = useRef(null)

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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchInitialData = async () => {
    try {
      const [sessionData, termData, defaultSession] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('term/all'),
        apiService.getAll('school-detail/session'),
      ])
      setSessions(sessionData)
      setTerms(termData)
      setDefaultSession(defaultSession)
      setFormData((prev) => ({
        ...prev,
        sessionId: defaultSession,
      }))
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
      handleTermSelect(value)
    }
  }

  const handleLiveSearch = async (value) => {
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
      section: selectedStudent.sectionName || '',
    })
    setShowDropdown(false)
  }

  useEffect(() => {
    if (studentId && formData.sessionId) {
      searchStudentFeeByAdmissionNumber()
    }
  }, [studentId, formData.sessionId])

  // Group data by terms and calculate term totals
  const handleTermSelect = (selectedTermId) => {
    if (!feeData || !feeData[0]?.feeTerms) return

    // Clear previous data for new term selection
    setTableData([])
    setTermTotals({})

    const feeTerms = feeData[0].feeTerms
    const selectedTermIdInt = parseInt(selectedTermId)
    const allTerms = [...terms]

    // Sort terms chronologically (assuming lower IDs come first)
    allTerms.sort((a, b) => a.id - b.id)

    // Find all terms up to and including the selected term
    const applicableTerms = allTerms.filter((term) => term.id <= selectedTermIdInt)

    let newTableData = []
    let newTermTotals = {}

    // Add data for each applicable term - grouped by term
    applicableTerms.forEach((term) => {
      const termId = term.id
      const termName = term.name
      let termTotal = 0
      let termItems = []

      for (const receiptHead in feeTerms) {
        const feeAmount = feeTerms[receiptHead][termId]

        if (feeAmount > 0) {
          termTotal += feeAmount
          termItems.push({
            term: termName,
            termId: termId,
            receiptHead: receiptHead,
            prvBal: 0,
            fees: feeAmount,
            adjust: 0,
            concession: 0,
            amount: feeAmount, // Set default amount equal to fees
            balance: '0', // Set default balance to 0
          })
        }
      }

      // Add termTotal to newTermTotals
      newTermTotals[termId] = termTotal

      // Add items to tableData
      newTableData = [...newTableData, ...termItems]
    })

    // Set the table data state
    setTableData(newTableData)
    setTermTotals(newTermTotals)

    // Recalculate the grand total
    calculateGrandTotal(newTableData)
    setCustomGrandTotal('') // Reset custom grand total when term changes
  }

  const calculateGrandTotal = (rows) => {
    // Calculate total amount
    const totalAmount = rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0)

    // Calculate total balance
    const totalBalanceAmount = rows.reduce((sum, row) => {
      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        // Add balance as Dr if it's negative (subtract amount from fees)
        sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      } else if (typeof row.balance === 'number' && row.balance < 0) {
        sum += Math.abs(row.balance)
      }
      return sum
    }, 0)

    // Update state with total amounts and total balance
    setGrandTotal(totalAmount)
    setTotalBalance(totalBalanceAmount)
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
  }, [formData.termId, feeData, terms])

  const handleAmountChange = (index, newAmount) => {
    const updatedTableData = [...tableData]
    const amount = parseFloat(newAmount) || 0
    const fees = updatedTableData[index].fees || 0

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
      updatedTableData[index].balance = `${(fees - amount).toFixed(2)} Dr`
    }

    // Update table data and recalculate the total balance
    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)

    // Reset custom grand total when individual amounts change
    setCustomGrandTotal('')
  }

  // Function to handle custom grand total input - sequential term priority
  const handleCustomGrandTotalChange = (value) => {
    const customAmount = parseFloat(value) || 0
    setCustomGrandTotal(value)

    if (customAmount <= 0) return

    // Get the original fees total
    const originalTotal = tableData.reduce((sum, row) => sum + parseFloat(row.fees || 0), 0)

    if (customAmount > originalTotal) {
      alert('Custom amount cannot be greater than total fees!')
      return
    }

    if (originalTotal <= 0) return

    // Create a copy of the table data
    const updatedTableData = [...tableData]

    // Sort terms chronologically
    const groupedTerms = {}
    updatedTableData.forEach((row) => {
      if (!groupedTerms[row.termId]) {
        groupedTerms[row.termId] = []
      }
      groupedTerms[row.termId].push(row)
    })

    // Convert to array and sort by termId
    const sortedTerms = Object.keys(groupedTerms)
      .map((termId) => ({
        termId: parseInt(termId),
        rows: groupedTerms[termId],
      }))
      .sort((a, b) => a.termId - b.termId)

    // Sequential distribution
    let remainingAmount = customAmount

    // First pass: Distribute amount sequentially by term
    for (const term of sortedTerms) {
      const termRows = term.rows
      const termTotal = termRows.reduce((sum, row) => sum + parseFloat(row.fees || 0), 0)

      // If we can fully fund this term
      if (remainingAmount >= termTotal) {
        // Fully fund all rows in this term
        termRows.forEach((row) => {
          const rowIndex = updatedTableData.findIndex(
            (r) => r.termId === row.termId && r.receiptHead === row.receiptHead,
          )

          if (rowIndex !== -1) {
            updatedTableData[rowIndex].amount = parseFloat(row.fees)
            updatedTableData[rowIndex].balance = '0'
          }
        })

        remainingAmount -= termTotal
      }
      // If we can only partially fund this term
      else if (remainingAmount > 0) {
        // Sort receipt heads within term to handle them in order
        const sortedRows = [...termRows]

        // Distribute remaining amount to rows in this term until exhausted
        for (const row of sortedRows) {
          const rowIndex = updatedTableData.findIndex(
            (r) => r.termId === row.termId && r.receiptHead === row.receiptHead,
          )

          if (rowIndex !== -1) {
            const fees = parseFloat(row.fees || 0)

            // If we can fully fund this row
            if (remainingAmount >= fees) {
              updatedTableData[rowIndex].amount = fees
              updatedTableData[rowIndex].balance = '0'
              remainingAmount -= fees
            }
            // Partially fund this row with whatever is left
            else if (remainingAmount > 0) {
              updatedTableData[rowIndex].amount = remainingAmount
              updatedTableData[rowIndex].balance = `${(fees - remainingAmount).toFixed(2)} Dr`
              remainingAmount = 0
            }
            // No funding left for this row
            else {
              updatedTableData[rowIndex].amount = 0
              updatedTableData[rowIndex].balance = `${fees.toFixed(2)} Dr`
            }
          }
        }
      }
      // If no remaining amount, set all subsequent terms to zero
      else {
        termRows.forEach((row) => {
          const rowIndex = updatedTableData.findIndex(
            (r) => r.termId === row.termId && r.receiptHead === row.receiptHead,
          )

          if (rowIndex !== -1) {
            updatedTableData[rowIndex].amount = 0
            updatedTableData[rowIndex].balance = `${parseFloat(row.fees).toFixed(2)} Dr`
          }
        })
      }
    }

    // Update table data and grand total
    setTableData(updatedTableData)
    setGrandTotal(customAmount)
    calculateTotalBalance(updatedTableData)
  }

  // Separate function to calculate only the total balance
  const calculateTotalBalance = (rows) => {
    const totalBalanceAmount = rows.reduce((sum, row) => {
      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        // Add balance as Dr if it's negative (subtract amount from fees)
        sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      } else if (typeof row.balance === 'number' && row.balance < 0) {
        sum += Math.abs(row.balance)
      }
      return sum
    }, 0)

    setTotalBalance(totalBalanceAmount)
  }

  // Group table data by term for display
  const groupedTableData = () => {
    const groupedByTerm = {}

    // Group rows by term
    tableData.forEach((row) => {
      if (!groupedByTerm[row.term]) {
        groupedByTerm[row.term] = {
          termName: row.term,
          termId: row.termId,
          rows: [],
          termTotal: 0,
        }
      }
      groupedByTerm[row.term].rows.push(row)
      groupedByTerm[row.term].termTotal += parseFloat(row.amount || 0)
    })

    // Sort by termId (assuming terms come in chronological order)
    return Object.values(groupedByTerm).sort((a, b) => a.termId - b.termId)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Fee Receipt</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol xs={6}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Search Student</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="mb-3 position-relative" ref={dropdownRef}>
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
                          {loading && (
                            <CSpinner
                              color="primary"
                              size="sm"
                              style={{ position: 'absolute', right: '20px', top: '15px' }}
                            />
                          )}

                          {/* Dropdown Results */}
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
                                  onClick={() => handleSelect(result)}
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

              {/* Student Info - Read-only fields */}
              <CRow className="mb-3">
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
                <CCol md={3}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel="Section"
                    type="text"
                    value={studentExtraInfo.section}
                    readOnly
                  />
                </CCol>
              </CRow>

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

            {tableData.length > 0 && (
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
                    {groupedTableData().map((termGroup, groupIndex) => (
                      <React.Fragment key={groupIndex}>
                        {termGroup.rows.map((row, rowIndex) => (
                          <CTableRow key={`${groupIndex}-${rowIndex}`}>
                            {/* Show term name only in the first row of each term group */}
                            {rowIndex === 0 ? (
                              <CTableDataCell rowSpan={termGroup.rows.length}>
                                {row.term}
                              </CTableDataCell>
                            ) : null}
                            <CTableDataCell>{row.receiptHead}</CTableDataCell>
                            <CTableDataCell>{row.prvBal}</CTableDataCell>
                            <CTableDataCell>{row.fees}</CTableDataCell>
                            <CTableDataCell>{row.adjust}</CTableDataCell>
                            <CTableDataCell>{row.concession}</CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                type="number"
                                value={row.amount}
                                onChange={(e) =>
                                  handleAmountChange(
                                    tableData.findIndex(
                                      (item) =>
                                        item.term === row.term &&
                                        item.receiptHead === row.receiptHead,
                                    ),
                                    e.target.value,
                                  )
                                }
                              />
                            </CTableDataCell>
                            <CTableDataCell>{row.balance}</CTableDataCell>
                          </CTableRow>
                        ))}
                        {/* Term subtotal row */}
                        <CTableRow style={{ backgroundColor: '#f0f0f0' }}>
                          <CTableHeaderCell colSpan={6}>
                            Term Total: {termGroup.termName}
                          </CTableHeaderCell>
                          <CTableHeaderCell>{termGroup.termTotal.toFixed(2)}</CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                    {/* Grand Total row with custom input */}
                    <CTableRow color="light" style={{ fontWeight: 'bold' }}>
                      <CTableHeaderCell colSpan={6}>Grand Total</CTableHeaderCell>
                      <CTableHeaderCell>
                        <CFormInput
                          type="number"
                          value={customGrandTotal || grandTotal}
                          onChange={(e) => handleCustomGrandTotalChange(e.target.value)}
                          style={{ fontWeight: 'bold' }}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell>
                        {totalBalance > 0 ? `${totalBalance.toFixed(2)} Dr` : '0'}
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentFeeReceipt
