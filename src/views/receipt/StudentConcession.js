import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import schoolManagementApi from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'

const StudentConcession = () => {
  const [payModeList, setPayModeList] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [studentData, setStudentData] = useState({
    name: '',
    className: '',
    sectionName: '',
    groupName: '',
    fatherName: '',
  })
  const [concessionId, setConcessionId] = useState(null)
  const [concessions, setConcessions] = useState([])
  const [feeData, setFeeData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [studentId, setStudentId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [term, setTerm] = useState([])
  const [students, setStudents] = useState([])
  const [concessionState, setConcessionState] = useState({})
  const [generalReceipts, setGeneralReceipts] = useState([])
  const [concessionRefNo, setConcessionRefNo] = useState('')
  const [conHead, setConHead] = useState('')

  // State to track fee data with calculations
  const [feeCalculations, setFeeCalculations] = useState({})

  const [feeFormData, setFeeFormData] = useState({
    classId: null,
    groupId: null,
    admissionNumber: null,
  })

  useEffect(() => {
    fetchPayModes()
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [termData] = await Promise.all([schoolManagementApi.getAll('term/all')])
      setTerm(termData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayModes = async () => {
    try {
      const [concessionData] = await Promise.all([schoolManagementApi.getAll('concession/all')])
      setConcessions(concessionData)
    } catch (error) {
      console.error('Error fetching concessions:', error)
    }
  }

  const handleSelect = (admissionNumber, name, className, sectionName, groupName, fatherName) => {
    setStudentId(admissionNumber)
    setStudentData({ name, className, sectionName, groupName, fatherName })
    setShowDropdown(false) // This should hide the dropdown
    const updatedFormData = {
      ...feeFormData,
      admissionNumber,
      classId: null,
      groupId: null,
    }
    searchStudentFeeByAdmissionNumber(updatedFormData)

    // Ensure dropdown is hidden
    setTimeout(() => setShowDropdown(false), 0)
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

  const searchStudentFeeByAdmissionNumber = async (updatedFormData) => {
    setLoading(true)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', updatedFormData)
      setStudents(students)

      // Initialize fee calculations structure
      if (students?.length > 0 && students[0]?.feeTerms) {
        const student = students[0]
        initializeFeeCalculations(student.feeTerms)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeFeeCalculations = (feeTerms) => {
    // Create a structured object for calculations
    const calculations = {}

    // For each receipt head (fee type)
    Object.keys(feeTerms).forEach((receiptHead) => {
      calculations[receiptHead] = {}

      // For each term within this receipt head
      Object.keys(feeTerms[receiptHead]).forEach((termId) => {
        const fee = feeTerms[receiptHead][termId]
        calculations[receiptHead][termId] = {
          fee, // Original fee amount
          concPercent: 0, // Concession percentage
          concAmount: 0, // Concession amount
          balance: fee, // Balance (fee - concession)
          selectedConcession: '', // Selected concession type
        }
      })
    })

    setFeeCalculations(calculations)
  }

  const getTermName = (termId) => {
    const termObj = term.find((t) => t.id === parseInt(termId))
    return termObj ? termObj.name : termId
  }

  // Helper to get all terms present in the fee data
  const getAllTerms = () => {
    if (!students.length || !students[0]?.feeTerms) return []

    // Create an array with all terms 1-7
    const allTermIds = []
    for (let i = 1; i <= 7; i++) {
      allTermIds.push(i.toString())
    }

    return allTermIds
  }

  // Helper to get all receipt heads
  const getAllReceiptHeads = () => {
    if (!students.length || !students[0]?.feeTerms) return []
    return Object.keys(students[0].feeTerms)
  }

  // Handle percentage concession change
  const handleConcPercentChange = (receiptHead, termId, value) => {
    const percent = parseFloat(value) || 0
    const fee =
      feeCalculations[receiptHead][termId]?.fee ||
      students[0]?.feeTerms?.[receiptHead]?.[termId] ||
      0

    // Calculate concession amount based on percentage
    const concAmount = (fee * percent) / 100

    // Prevent negative balance
    if (concAmount > fee) {
      alert(`Concession cannot exceed the fee amount of ${fee}. Please enter a lower percentage.`)
      return
    }

    // Update the state
    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          fee,
          concPercent: percent,
          concAmount: 0, // Reset direct concession amount
          balance: fee - concAmount,
        },
      },
    }))
  }

  // Handle direct concession amount change
  const handleConcAmountChange = (receiptHead, termId, value) => {
    const amount = parseFloat(value) || 0
    const fee =
      feeCalculations[receiptHead][termId]?.fee ||
      students[0]?.feeTerms?.[receiptHead]?.[termId] ||
      0

    // Prevent negative balance
    if (amount > fee) {
      alert(`Concession amount cannot exceed the fee amount of ${fee}. Please enter a lower value.`)
      return
    }

    // Update the state
    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          fee,
          concPercent: 0, // Reset percentage
          concAmount: amount,
          balance: fee - amount,
        },
      },
    }))
  }

  // Handle concession type selection
  const handleConcessionTypeChange = (receiptHead, termId, value) => {
    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          selectedConcession: value,
        },
      },
    }))
  }

  // Calculate term totals
  const calculateTermTotals = (termId) => {
    let totalFees = 0
    let totalConcession = 0
    let totalBalance = 0

    getAllReceiptHeads().forEach((receiptHead) => {
      // Get fee directly from student data for consistent calculation
      const fee = students[0]?.feeTerms?.[receiptHead]?.[termId] || 0

      if (fee > 0) {
        totalFees += fee || 0

        // Add either percentage-based or direct concession
        const calcData = feeCalculations[receiptHead]?.[termId]
        if (calcData) {
          if (calcData.concPercent > 0) {
            totalConcession += (fee * calcData.concPercent) / 100
          } else {
            totalConcession += calcData.concAmount || 0
          }

          totalBalance += calcData.balance || 0
        } else {
          // If no calculation data exists yet, balance equals fee
          totalBalance += fee
        }
      }
    })

    return { totalFees, totalConcession, totalBalance }
  }

  // Calculate grand totals across all terms
  const calculateGrandTotals = () => {
    let grandTotalFees = 0
    let grandTotalConcession = 0
    let grandTotalBalance = 0

    getAllTerms().forEach((termId) => {
      const termTotals = calculateTermTotals(termId)
      grandTotalFees += termTotals.totalFees
      grandTotalConcession += termTotals.totalConcession
      grandTotalBalance += termTotals.totalBalance
    })

    return { grandTotalFees, grandTotalConcession, grandTotalBalance }
  }

  // Render the fee table for a specific term
  const renderTermTable = (termId) => {
    const receiptHeads = getAllReceiptHeads()
    const termName = getTermName(termId)

    // Check if this term has any fees directly from student data
    let hasAnyFees = false
    const visibleReceiptHeads = []

    // Pre-calculate which receipt heads have fees for this term
    receiptHeads.forEach((receiptHead) => {
      const fee = students[0]?.feeTerms?.[receiptHead]?.[termId] || 0
      if (fee > 0) {
        hasAnyFees = true
        visibleReceiptHeads.push({
          receiptHead,
          fee,
        })
      }
    })

    // Skip rendering if no fees for this term
    if (!hasAnyFees) {
      return null
    }

    const termTotals = calculateTermTotals(termId)
    const rowItems = []

    // Create row items for each receipt head
    visibleReceiptHeads.forEach((item, index) => {
      const { receiptHead, fee } = item

      // Initialize calculation data if it doesn't exist yet
      if (!feeCalculations[receiptHead] || !feeCalculations[receiptHead][termId]) {
        if (!feeCalculations[receiptHead]) {
          setFeeCalculations((prev) => ({
            ...prev,
            [receiptHead]: {},
          }))
        }

        setFeeCalculations((prev) => ({
          ...prev,
          [receiptHead]: {
            ...prev[receiptHead],
            [termId]: {
              fee,
              concPercent: 0,
              concAmount: 0,
              balance: fee,
              selectedConcession: '',
            },
          },
        }))
      }

      const calcData = feeCalculations[receiptHead]?.[termId] || {
        fee,
        concPercent: 0,
        concAmount: 0,
        balance: fee,
        selectedConcession: '',
      }

      rowItems.push(
        <CTableRow key={`${termId}-${receiptHead}`}>
          {index === 0 && (
            <CTableDataCell
              rowSpan={visibleReceiptHeads.length + 1}
              style={{ verticalAlign: 'middle' }}
            >
              {termName}
            </CTableDataCell>
          )}
          <CTableDataCell>{receiptHead}</CTableDataCell>
          <CTableDataCell>{fee}</CTableDataCell>
          <CTableDataCell>
            <CFormInput
              type="number"
              value={calcData.concPercent || ''}
              onChange={(e) => handleConcPercentChange(receiptHead, termId, e.target.value)}
              min="0"
              max="100"
            />
          </CTableDataCell>
          <CTableDataCell>
            <CFormInput
              type="number"
              value={calcData.concAmount || ''}
              onChange={(e) => handleConcAmountChange(receiptHead, termId, e.target.value)}
              min="0"
              max={fee}
            />
          </CTableDataCell>
          <CTableDataCell></CTableDataCell>
          <CTableDataCell>{calcData.balance}</CTableDataCell>
          <CTableDataCell>
            <CFormSelect
              value={calcData.selectedConcession || ''}
              onChange={(e) => handleConcessionTypeChange(receiptHead, termId, e.target.value)}
            >
              <option value="">Select</option>
              {concessions.map((concession) => (
                <option key={concession.id} value={concession.id}>
                  {concession.name}
                </option>
              ))}
            </CFormSelect>
          </CTableDataCell>
          <CTableDataCell></CTableDataCell>
        </CTableRow>,
      )
    })

    // Add total row for this term
    if (visibleReceiptHeads.length > 0) {
      rowItems.push(
        <CTableRow key={`${termId}-total`} style={{ backgroundColor: '#f0f0f0' }}>
          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
            TOTAL
          </CTableDataCell>
          <CTableDataCell style={{ fontWeight: 'bold' }}>{termTotals.totalFees}</CTableDataCell>
          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
            {termTotals.totalConcession}
          </CTableDataCell>
          <CTableDataCell></CTableDataCell>
          <CTableDataCell style={{ fontWeight: 'bold' }}>{termTotals.totalBalance}</CTableDataCell>
          <CTableDataCell colSpan={2}></CTableDataCell>
        </CTableRow>,
      )
    }

    return rowItems.length > 0 ? rowItems : null
  }

  const handleUpdate = () => {
    // Implement the update logic here
    console.log('Updating concession data:', feeCalculations)
    // Call API to update the concessions
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Concession</strong>
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
                      <CRow className="mb-3 position-relative">
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
                                  onClick={() =>
                                    handleSelect(
                                      result.admissionNumber,
                                      result.name,
                                      result.className,
                                      result.sectionName,
                                      result.groupName,
                                      result.fatherName,
                                    )
                                  }
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
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Adm No.</CFormLabel>
                  <CFormInput value={studentId || ''} readOnly />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Name</CFormLabel>
                  <CFormInput value={studentData.name || ''} readOnly />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Father Name</CFormLabel>
                  <CFormInput value={studentData.fatherName || ''} readOnly />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Class</CFormLabel>
                  <CFormInput value={studentData.className || ''} readOnly />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Con. Head</CFormLabel>
                  <CFormSelect value={conHead} onChange={(e) => setConHead(e.target.value)}>
                    <option value="">Select</option>
                    <option value="RAWAN STUDENTS">RAWAN STUDENTS</option>
                    <option value="TEACHING STAFF">TEACHING STAFF</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Concession Ref. No.</CFormLabel>
                  <CFormInput
                    value={concessionRefNo}
                    onChange={(e) => setConcessionRefNo(e.target.value)}
                  />
                </CCol>
              </CRow>

              {students.length > 0 && students[0]?.feeTerms && (
                <CRow className="mb-3">
                  <CCol xs={12}>
                    <CTable bordered responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Term</CTableHeaderCell>
                          <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                          <CTableHeaderCell>Fees</CTableHeaderCell>
                          <CTableHeaderCell>Conc(%)</CTableHeaderCell>
                          <CTableHeaderCell>Con.</CTableHeaderCell>
                          <CTableHeaderCell>Received</CTableHeaderCell>
                          <CTableHeaderCell>Balance</CTableHeaderCell>
                          <CTableHeaderCell>Adjust Head</CTableHeaderCell>
                          <CTableHeaderCell>Remarks</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {getAllTerms().map((termId) => renderTermTable(termId))}

                        {/* Grand Total row */}
                        <CTableRow style={{ backgroundColor: '#e0e0e0' }}>
                          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
                            GRAND TOTAL
                          </CTableDataCell>
                          <CTableDataCell style={{ fontWeight: 'bold' }}>
                            {calculateGrandTotals().grandTotalFees}
                          </CTableDataCell>
                          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
                            {calculateGrandTotals().grandTotalConcession}
                          </CTableDataCell>
                          <CTableDataCell style={{ fontWeight: 'bold' }}>0</CTableDataCell>
                          <CTableDataCell style={{ fontWeight: 'bold' }}>
                            {calculateGrandTotals().grandTotalBalance}
                          </CTableDataCell>
                          <CTableDataCell colSpan={2}></CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  </CCol>
                </CRow>
              )}

              <CRow className="mt-3">
                <CCol xs={12} className="text-end">
                  <CButton color="primary" onClick={handleUpdate}>
                    Update
                  </CButton>
                  <CButton color="secondary" className="ms-2">
                    Cancel
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentConcession
