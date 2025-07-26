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
  CAlert,
  CCollapse,
  CBadge,
  CContainer,
  CButtonGroup,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'
import concessionApi from '../../api/receiptManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const StudentFeeReceipt = () => {
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [concessions, setConcessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [tableData, setTableData] = useState([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [customGrandTotal, setCustomGrandTotal] = useState('')
  const [feeDataLoaded, setFeeDataLoaded] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [totalConcession, setTotalConcession] = useState(0)
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
  const searchTimeout = useRef(null)
  const dropdownRef = useRef(null)

  const [saveLoading, setSaveLoading] = useState(false)
  const [showReceiptHistory, setShowReceiptHistory] = useState(false)
  const [selectedTermFullyPaid, setSelectedTermFullyPaid] = useState(false)

  // NEW: Add state for new fee management system
  const [studentFeeResponse, setStudentFeeResponse] = useState(null)

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

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

  const [formData, setFormData] = useState({
    receiptDate: new Date().toISOString().split('T')[0],
    receivedBy: 'School',
    paymentMode: '',
    sessionId: '',
    registrationNumber: '',
    termId: '',
    referenceDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    drawnOn: '',
    totalAdvance: '',
    advanceDeduct: '',
    remarks: '',
  })

  const drawnOnOptions = [
    { value: '', label: 'Select Bank' },
    { value: 'SBI', label: 'State Bank of India' },
    { value: 'HDFC', label: 'HDFC Bank' },
    { value: 'ICICI', label: 'ICICI Bank' },
    { value: 'AXIS', label: 'Axis Bank' },
    { value: 'PNB', label: 'Punjab National Bank' },
    { value: 'BOI', label: 'Bank of India' },
    { value: 'CANARA', label: 'Canara Bank' },
    { value: 'UNION', label: 'Union Bank' },
    { value: 'OTHER', label: 'Other' },
  ]

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
      const [sessionData, termData, defaultSession, concessionData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('term/all'),
        apiService.getAll('school-detail/session'),
        apiService.getAll('concession/all'),
      ])
      setSessions(sessionData)
      setTerms(termData)
      setConcessions(concessionData)
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

  // REMOVED: No longer needed with new API - concessions are included in fee response
  const resetStudentSpecificData = () => {
    setStudentExtraInfo({
      className: '',
      studentName: '',
      groupName: '',
      section: '',
    })
    setTableData([])
    setGrandTotal(0)
    setTotalBalance(0)
    setTotalConcession(0)
    setCustomGrandTotal('')
    setFeeDataLoaded(false)
    setShowReceiptHistory(false)
    setSelectedTermFullyPaid(false)
    setError(null)
    setSuccess(null)

    // Reset new fee management state
    setStudentFeeResponse(null)

    setLastSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
  }

  const resetTermAndTableData = () => {
    setFormData((prev) => ({
      ...prev,
      termId: '',
    }))
    setTableData([])
    setGrandTotal(0)
    setTotalBalance(0)
    setTotalConcession(0)
    setCustomGrandTotal('')
    setSelectedTermFullyPaid(false)
    setError(null)
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
    if (name === 'sessionId') {
      setSearchCache(new Map())
      setLastSearchQuery('')
      setSearchResults([])
      setShowDropdown(false)

      resetStudentSpecificData()

      setFormData((prev) => ({
        receiptDate: new Date().toISOString().split('T')[0],
        receivedBy: 'School',
        paymentMode: '',
        sessionId: value,
        registrationNumber: '',
        termId: '',
        referenceDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        drawnOn: '',
        totalAdvance: '',
        advanceDeduct: '',
        remarks: '',
      }))

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

  // MODIFIED: Updated handleSelect to use new API
  const handleSelect = async (selectedStudent) => {
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
    setError(null)
    setSuccess(null)

    // Step 3: Call NEW API instead of old ones
    await Promise.all([fetchStudentFeesFromNewAPI(selectedStudent.admissionNumber)])
  }

  // NEW: Fetch student fees using new API (Step 3)
  const fetchStudentFeesFromNewAPI = async (admissionNumber) => {
    setLoading(true)
    try {
      console.log('🔍 Fetching student fees from new API for:', admissionNumber)
      const sessionIdToUse = formData.sessionId || defaultSession

      // Call the new receipt/student endpoint using getById
      const response = await receiptManagementApi.getAll(
        `student/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      setStudentFeeResponse(response)
      setFeeDataLoaded(true) // Step 4: Enable term selection dropdown

      // Update student info from response
      setStudentExtraInfo((prev) => ({
        ...prev,
        studentName: response.studentName || prev.studentName,
        className: response.className || prev.className,
        groupName: response.groupName || prev.groupName,
      }))

      console.log('✅ Student fees loaded from new API:', response)
    } catch (error) {
      console.error('Error fetching student fees from new API:', error)
      setError('Failed to fetch student fee data')
      setStudentFeeResponse(null)
      setFeeDataLoaded(false)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStudentId('')
    resetStudentSpecificData()
    setFormData({
      receiptDate: new Date().toISOString().split('T')[0],
      receivedBy: 'School',
      paymentMode: '',
      sessionId: defaultSession,
      registrationNumber: '',
      termId: '',
      referenceDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      drawnOn: '',
      totalAdvance: '',
      advanceDeduct: '',
      remarks: '',
    })
    setSearchResults([])
    setShowDropdown(false)
  }

  // NEW: Check if receipt head is fine-related
  const isFineRelated = (receiptHeadName) => {
    return receiptHeadName === 'FINE' || receiptHeadName.toLowerCase().includes('fine')
  }

  // NEW: Convert new fee data to old format for existing UI (Step 5)
  const convertNewFeeDataToOldFormat = (newFeeData, selectedTermId) => {
    if (!newFeeData || !newFeeData.feeDetails) return []

    const selectedTermIdInt = parseInt(selectedTermId)

    // Get all terms up to and including selected term with pending fees
    const termIds = new Set()
    newFeeData.feeDetails.forEach((fee) => {
      if (fee.termId <= selectedTermIdInt && fee.balanceAmount > 0) {
        termIds.add(fee.termId)
      }
    })

    // Also include selected term even if no balance (for display)
    termIds.add(selectedTermIdInt)

    const convertedData = []

    // Group fees by term
    Array.from(termIds)
      .sort((a, b) => a - b)
      .forEach((termId) => {
        const termFees = newFeeData.feeDetails.filter((fee) => fee.termId === termId)

        // Remove duplicates and filter zero values
        const uniqueFees = new Map()
        termFees.forEach((fee) => {
          const key = `${fee.termId}-${fee.receiptHeadName}`
          if (!uniqueFees.has(key)) {
            // Only include if there's a balance, original fee > 0, or if it's the selected term with any activity
            const hasBalance = fee.balanceAmount > 0
            const hasOriginalFee = fee.originalFee > 0
            const hasPaidAmount = fee.paidAmount > 0
            const isSelectedTerm = fee.termId === selectedTermIdInt

            if (hasBalance || (isSelectedTerm && (hasOriginalFee || hasPaidAmount))) {
              uniqueFees.set(key, fee)
            }
          }
        })

        uniqueFees.forEach((fee) => {
          convertedData.push({
            term: fee.termName,
            termId: fee.termId,
            receiptHead: fee.receiptHeadName,
            prvBal: 0, // Previous balance calculation can be added if needed
            fees: fee.originalFee,
            adjust: 0,
            concPercent:
              fee.concessionAmount > 0 ? (fee.concessionAmount / fee.originalFee) * 100 : 0,
            concAmount: fee.concessionAmount,
            selectedConcession: '',
            remarks: '',
            amount: fee.balanceAmount, // Set to balance amount for payment
            balance: fee.balanceAmount > 0 ? `${fee.balanceAmount.toFixed(2)} Dr` : '0',
            totalPreviousPaid: fee.paidAmount,
            feeId: fee.id, // Keep reference to original fee ID for payment processing
            isFine: isFineRelated(fee.receiptHeadName), // Mark if it's a fine
          })
        })
      })

    return convertedData
  }

  // UPDATED: Only use new fee data structure
  const handleTermSelect = (selectedTermId) => {
    setFormData((prev) => ({ ...prev, termId: selectedTermId }))

    if (studentFeeResponse) {
      // Handle term selection for new fee system
      const convertedTableData = convertNewFeeDataToOldFormat(studentFeeResponse, selectedTermId)
      setTableData(convertedTableData)
      calculateGrandTotal(convertedTableData)

      // Check if selected term is fully paid
      const selectedTermFees = studentFeeResponse.feeDetails.filter(
        (fee) => fee.termId === parseInt(selectedTermId),
      )
      const hasUnpaidFees = selectedTermFees.some((fee) => fee.balanceAmount > 0)
      setSelectedTermFullyPaid(!hasUnpaidFees && selectedTermFees.length > 0)
    }
  }

  // Keep all existing functions for backward compatibility
  const getVisibleTerms = (selectedTermId, allTerms, receipts, feeData) => {
    if (!feeData || !feeData[0]?.feeTerms) return []

    const selectedTermIdInt = parseInt(selectedTermId)
    const sortedTerms = [...allTerms].sort((a, b) => a.id - b.id)
    const applicableTerms = sortedTerms.filter((term) => term.id <= selectedTermIdInt)

    return applicableTerms
  }

  const calculatePreviousPayments = (receiptHead, termName, receipts) => {
    let totalPreviousPaid = 0
    let previousBalance = 0

    if (receipts && receipts.length > 0) {
      receipts.forEach((receipt) => {
        if (receipt.receiptDetails) {
          receipt.receiptDetails.forEach((detail) => {
            if (detail.receiptHead === receiptHead && detail.termName === termName) {
              totalPreviousPaid += parseFloat(detail.amountPaid || 0)
              previousBalance = parseFloat(detail.balanceAmount || 0)
            }
          })
        }
      })
    }

    return { totalPreviousPaid, previousBalance }
  }

  const updateTableDataWithReceipts = (receipts, selectedTermId = null) => {
    const termIdToUse = selectedTermId || formData.termId

    if (!feeData || !termIdToUse) return

    const selectedTermIdInt = parseInt(termIdToUse)
    const visibleTerms = getVisibleTerms(selectedTermIdInt, terms, receipts, feeData)

    let newTableData = []
    let selectedTermHasBalance = false

    visibleTerms.forEach((term) => {
      const termId = term.id
      const termName = term.name
      let termItems = []

      const feeTerms = feeData[0].feeTerms

      for (const receiptHead in feeTerms) {
        const feeAmount = feeTerms[receiptHead][termId]

        if (feeAmount > 0) {
          const existingConcession = existingConcessions[receiptHead]?.[termId]
          let concPercent = 0
          let concAmount = 0
          let selectedConcession = ''
          let remarks = ''

          if (existingConcession) {
            concPercent = existingConcession.concPercent || 0
            concAmount = existingConcession.concAmount || 0
            selectedConcession = existingConcession.selectedConcession || ''
            remarks = existingConcession.remarks || ''
          }

          let finalConcessionAmount = 0
          if (concPercent > 0) {
            finalConcessionAmount = (feeAmount * concPercent) / 100
          } else {
            finalConcessionAmount = concAmount
          }

          const { totalPreviousPaid, previousBalance } = calculatePreviousPayments(
            receiptHead,
            termName,
            receipts,
          )

          const amountAfterConcession = feeAmount - finalConcessionAmount
          const currentBalance = Math.max(0, amountAfterConcession - totalPreviousPaid)
          const displayBalance = currentBalance > 0 ? `${currentBalance.toFixed(2)} Dr` : '0'

          const amountBeingPaid = Math.min(currentBalance, amountAfterConcession)

          if (currentBalance > 0 || termId === selectedTermIdInt) {
            termItems.push({
              term: termName,
              termId: termId,
              receiptHead: receiptHead,
              prvBal: previousBalance,
              fees: feeAmount,
              adjust: 0,
              concPercent: concPercent,
              concAmount: finalConcessionAmount,
              selectedConcession: selectedConcession,
              remarks: remarks,
              amount: amountBeingPaid,
              balance: displayBalance,
              totalPreviousPaid: totalPreviousPaid,
            })

            if (termId === selectedTermIdInt && currentBalance > 0) {
              selectedTermHasBalance = true
            }
          }
        }
      }

      newTableData = [...newTableData, ...termItems]
    })

    setSelectedTermFullyPaid(
      selectedTermIdInt &&
        !selectedTermHasBalance &&
        newTableData.some((item) => item.termId === selectedTermIdInt),
    )

    setTableData(newTableData)
    calculateGrandTotal(newTableData)
    setCustomGrandTotal('')
  }

  // UPDATED: Use only new payment API
  const saveFeeReceipt = async () => {
    try {
      if (!formData.paymentMode) {
        alert('Payment mode is required')
        return
      }

      if (!formData.termId) {
        alert('Term selection is required')
        return
      }

      if (!studentId) {
        setError('Student selection is required')
        return
      }

      if (tableData.length === 0) {
        alert('No fee data available to save')
        return
      }

      setSaveLoading(true)
      setError(null)

      // Process payment using new API structure
      const payments = tableData
        .filter((item) => parseFloat(item.amount || 0) > 0)
        .map((item) => ({
          feePaymentId: item.feeId,
          paymentAmount: parseFloat(item.amount || 0),
        }))

      if (payments.length === 0) {
        setError('No payment amounts specified')
        return
      }

      const paymentRequest = {
        admissionNumber: studentId,
        sessionId: parseInt(formData.sessionId),
        payments: payments,
      }

      console.log('💾 Processing payment with new API:', paymentRequest)

      const response = await receiptManagementApi.create('payment', paymentRequest)

      alert(`Payment processed successfully! Receipt: ${response.receiptNumber}`)
      setSuccess(`Payment processed successfully! Receipt: ${response.receiptNumber}`)

      // Refresh fee data
      await fetchStudentFeesFromNewAPI(studentId)

      // Open PDF if available
      if (response.pdfUrl) {
        window.open(response.pdfUrl, '_blank')
      }

      resetTermAndTableData()
    } catch (error) {
      console.error('Error saving receipt:', error)
      setError(error.message || 'Failed to save receipt. Please try again.')
    } finally {
      setSaveLoading(false)
    }
  }

  const resetAllData = () => {
    setStudentId('')
    resetStudentSpecificData()

    setFormData({
      receiptDate: new Date().toISOString().split('T')[0],
      receivedBy: 'School',
      paymentMode: '',
      sessionId: defaultSession,
      registrationNumber: '',
      termId: '',
      referenceDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      drawnOn: '',
      totalAdvance: '',
      advanceDeduct: '',
      remarks: '',
    })
  }

  // REMOVED: Old fee mapping API no longer exists
  useEffect(() => {
    // No automatic API call needed - fee data is fetched when student is selected
  }, [studentId, formData.sessionId])

  const calculateGrandTotal = (rows) => {
    const totalAmount = rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0)

    const totalConcessionAmount = rows.reduce(
      (sum, row) => sum + parseFloat(row.concAmount || 0),
      0,
    )

    const totalBalanceAmount = rows.reduce((sum, row) => {
      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      } else if (typeof row.balance === 'number' && row.balance < 0) {
        sum += Math.abs(row.balance)
      }
      return sum
    }, 0)

    setGrandTotal(totalAmount)
    setTotalConcession(totalConcessionAmount)
    setTotalBalance(totalBalanceAmount)
  }

  // REMOVED: Old fee-mapping API method - replaced by new receipt/student API

  // REMOVED: Legacy filtered fee data logic - no longer needed

  const handleAmountChange = (index, newAmount) => {
    const updatedTableData = [...tableData]
    const amount = parseFloat(newAmount) || 0
    const fees = updatedTableData[index].fees || 0
    const concessionAmount = updatedTableData[index].concAmount || 0
    const maxAllowedAmount = fees - concessionAmount

    if (amount > maxAllowedAmount) {
      alert(
        `Value cannot be greater than the fee amount after concession (₹${maxAllowedAmount.toFixed(2)})!`,
      )
      return
    }

    updatedTableData[index].amount = amount

    if (amount === maxAllowedAmount) {
      updatedTableData[index].balance = '0'
    } else if (amount < maxAllowedAmount) {
      updatedTableData[index].balance = `${(maxAllowedAmount - amount).toFixed(2)} Dr`
    }

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('')
  }

  const handleConcessionChange = (index, value, isPercentage = false) => {
    const updatedTableData = [...tableData]
    const fees = updatedTableData[index].fees || 0

    if (isPercentage) {
      const percent = parseFloat(value) || 0
      if (percent > 100) {
        alert('Concession percentage cannot exceed 100%!')
        return
      }
      const concAmount = (fees * percent) / 100
      updatedTableData[index].concPercent = percent
      updatedTableData[index].concAmount = concAmount
    } else {
      const amount = parseFloat(value) || 0
      if (amount > fees) {
        alert(`Concession amount cannot exceed the fee amount (₹${fees})!`)
        return
      }
      updatedTableData[index].concPercent = 0
      updatedTableData[index].concAmount = amount
    }

    const newAmount = fees - updatedTableData[index].concAmount
    updatedTableData[index].amount = newAmount
    updatedTableData[index].balance = '0'

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('')
  }

  const handleConcessionTypeChange = (index, value) => {
    const updatedTableData = [...tableData]
    updatedTableData[index].selectedConcession = value
    setTableData(updatedTableData)
  }

  const handleRemarksChange = (index, value) => {
    const updatedTableData = [...tableData]
    updatedTableData[index].remarks = value
    setTableData(updatedTableData)
  }

  const handleCustomGrandTotalChange = (value) => {
    const customAmount = parseFloat(value) || 0
    setCustomGrandTotal(value)

    if (customAmount <= 0) return

    const originalTotal = tableData.reduce(
      (sum, row) => sum + (parseFloat(row.fees || 0) - parseFloat(row.concAmount || 0)),
      0,
    )

    if (customAmount > originalTotal) {
      alert('Custom amount cannot be greater than total fees after concessions!')
      return
    }

    const updatedTableData = [...tableData]
    const groupedTerms = {}

    updatedTableData.forEach((row) => {
      if (!groupedTerms[row.termId]) {
        groupedTerms[row.termId] = []
      }
      groupedTerms[row.termId].push(row)
    })

    const sortedTerms = Object.keys(groupedTerms)
      .map((termId) => ({
        termId: parseInt(termId),
        rows: groupedTerms[termId],
      }))
      .sort((a, b) => a.termId - b.termId)

    let remainingAmount = customAmount

    for (const term of sortedTerms) {
      const termRows = term.rows
      const termTotal = termRows.reduce(
        (sum, row) => sum + (parseFloat(row.fees || 0) - parseFloat(row.concAmount || 0)),
        0,
      )

      if (remainingAmount >= termTotal) {
        termRows.forEach((row) => {
          const rowIndex = updatedTableData.findIndex(
            (r) => r.termId === row.termId && r.receiptHead === row.receiptHead,
          )
          if (rowIndex !== -1) {
            const maxAmount = parseFloat(row.fees) - parseFloat(row.concAmount || 0)
            updatedTableData[rowIndex].amount = maxAmount
            updatedTableData[rowIndex].balance = '0'
          }
        })
        remainingAmount -= termTotal
      } else if (remainingAmount > 0) {
        for (const row of termRows) {
          const rowIndex = updatedTableData.findIndex(
            (r) => r.termId === row.termId && r.receiptHead === row.receiptHead,
          )
          if (rowIndex !== -1) {
            const maxAmount = parseFloat(row.fees) - parseFloat(row.concAmount || 0)
            if (remainingAmount >= maxAmount) {
              updatedTableData[rowIndex].amount = maxAmount
              updatedTableData[rowIndex].balance = '0'
              remainingAmount -= maxAmount
            } else if (remainingAmount > 0) {
              updatedTableData[rowIndex].amount = remainingAmount
              updatedTableData[rowIndex].balance = `${(maxAmount - remainingAmount).toFixed(2)} Dr`
              remainingAmount = 0
            } else {
              updatedTableData[rowIndex].amount = 0
              updatedTableData[rowIndex].balance = `${maxAmount.toFixed(2)} Dr`
            }
          }
        }
      } else {
        termRows.forEach((row) => {
          const rowIndex = updatedTableData.findIndex(
            (r) => r.termId === row.termId && r.receiptHead === r.receiptHead,
          )
          if (rowIndex !== -1) {
            const maxAmount = parseFloat(row.fees) - parseFloat(row.concAmount || 0)
            updatedTableData[rowIndex].amount = 0
            updatedTableData[rowIndex].balance = `${maxAmount.toFixed(2)} Dr`
          }
        })
      }
    }

    setTableData(updatedTableData)
    setGrandTotal(customAmount)
    calculateTotalBalance(updatedTableData)
  }

  const calculateTotalBalance = (rows) => {
    const totalBalanceAmount = rows.reduce((sum, row) => {
      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      } else if (typeof row.balance === 'number' && row.balance < 0) {
        sum += Math.abs(row.balance)
      }
      return sum
    }, 0)

    setTotalBalance(totalBalanceAmount)
  }

  const groupedTableData = () => {
    const groupedByTerm = {}

    // Filter out rows with zero fees and zero balance
    const filteredTableData = tableData.filter(
      (row) =>
        parseFloat(row.fees || 0) > 0 ||
        parseFloat(row.amount || 0) > 0 ||
        (typeof row.balance === 'string' &&
          row.balance.includes('Dr') &&
          parseFloat(row.balance.replace('Dr', '').trim()) > 0),
    )

    filteredTableData.forEach((row) => {
      if (!groupedByTerm[row.term]) {
        groupedByTerm[row.term] = {
          termName: row.term,
          termId: row.termId,
          regularRows: [],
          fineRows: [],
          termTotal: 0,
          termConcession: 0,
          termTotalFees: 0,
          termBalance: 0,
          termFineTotal: 0,
          termFineBalance: 0,
        }
      }

      // Separate regular fees from fines
      if (row.isFine) {
        groupedByTerm[row.term].fineRows.push(row)
        groupedByTerm[row.term].termFineTotal += parseFloat(row.amount || 0)
        if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
          groupedByTerm[row.term].termFineBalance +=
            parseFloat(row.balance.replace('Dr', '').trim()) || 0
        }
      } else {
        groupedByTerm[row.term].regularRows.push(row)
      }

      groupedByTerm[row.term].termTotal += parseFloat(row.amount || 0)
      groupedByTerm[row.term].termConcession += parseFloat(row.concAmount || 0)
      groupedByTerm[row.term].termTotalFees += parseFloat(row.fees || 0)

      // Calculate term balance
      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        groupedByTerm[row.term].termBalance += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      }
    })

    return Object.values(groupedByTerm).sort((a, b) => a.termId - b.termId)
  }

  const showReferenceFields = formData.paymentMode && formData.paymentMode !== 'Cash'

  // NEW: Calculate balance for selected term and above unpaid terms only
  const getRelevantTermBalances = () => {
    if (!studentFeeResponse || !formData.termId) return []

    const selectedTermIdInt = parseInt(formData.termId)
    const relevantTerms = []

    // Group fees by term and separate fines
    const termGroups = {}
    studentFeeResponse.feeDetails.forEach((fee) => {
      if (!termGroups[fee.termId]) {
        termGroups[fee.termId] = {
          termId: fee.termId,
          termName: fee.termName,
          totalBalance: 0,
          totalPaid: 0,
          fineBalance: 0,
          regularBalance: 0,
        }
      }
      termGroups[fee.termId].totalBalance += fee.balanceAmount
      termGroups[fee.termId].totalPaid += fee.paidAmount

      // Separate fine and regular balances
      if (isFineRelated(fee.receiptHeadName)) {
        termGroups[fee.termId].fineBalance += fee.balanceAmount
      } else {
        termGroups[fee.termId].regularBalance += fee.balanceAmount
      }
    })

    // Include selected term and terms above it with unpaid balances
    Object.values(termGroups).forEach((term) => {
      if (
        term.termId <= selectedTermIdInt &&
        (term.totalBalance > 0 || term.termId === selectedTermIdInt)
      ) {
        relevantTerms.push(term)
      }
    })

    return relevantTerms.sort((a, b) => a.termId - b.termId)
  }

  const getStudentStatusBadges = () => {
    const badges = []
    const relevantTerms = getRelevantTermBalances()

    // Only show badges for relevant terms (selected and above unpaid)
    relevantTerms.forEach((term) => {
      if (term.totalPaid > 0) {
        badges.push(
          <CBadge key={`paid-${term.termId}`} color="success" className="me-1">
            {term.termName} Paid: ₹{term.totalPaid.toFixed(2)}
          </CBadge>,
        )
      }
      if (term.regularBalance > 0) {
        badges.push(
          <CBadge key={`balance-${term.termId}`} color="warning" className="me-1">
            {term.termName} Balance: ₹{term.regularBalance.toFixed(2)}
          </CBadge>,
        )
      }
      if (term.fineBalance > 0) {
        badges.push(
          <CBadge key={`fine-${term.termId}`} color="danger" className="me-1">
            {term.termName} Fine: ₹{term.fineBalance.toFixed(2)}
          </CBadge>,
        )
      }
    })

    return badges
  }

  const isAllFeesPaid = selectedTermFullyPaid

  // NEW: Format concession display text
  const formatConcessionText = (row) => {
    if (row.concPercent > 0) {
      return `${row.concPercent.toFixed(1)}% (₹${row.concAmount.toFixed(2)})`
    } else if (row.concAmount > 0) {
      return `₹${row.concAmount.toFixed(2)}`
    }
    return '-'
  }

  return (
    <CContainer fluid className="px-2">
      {/* Alerts - Fixed at top */}
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

      {/* Student Search & Information - Compact Card */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <CRow className="align-items-center">
            <CCol md={8}>
              <h6 className="mb-0 fw-bold text-primary">🎓 Student Fee Receipt Management</h6>
            </CCol>
          </CRow>
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

            <CCol md={2}>
              <CFormSelect
                size="sm"
                name="termId"
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
              <label className="small text-muted">Term *</label>
            </CCol>

            {/* Quick Actions */}
            <CCol md={4} className="text-end">
              <CButtonGroup size="sm">
                <CButton color="outline-secondary" onClick={handleReset}>
                  🔄 Reset
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>

          {/* Student Info Display - Compact */}
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

      {/* Receipt Form - Compact Card */}
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold text-primary">💰 Receipt Details</h6>
            {formData.paymentMode && <CBadge color="primary">{formData.paymentMode}</CBadge>}
          </div>
        </CCardHeader>
        <CCardBody className="py-2">
          <CForm>
            {/* Main Form Fields - Compact Grid */}
            <CRow className="g-2 mb-2">
              <CCol md={2}>
                <CFormInput
                  size="sm"
                  type="date"
                  name="receiptDate"
                  value={formData.receiptDate}
                  onChange={handleChange}
                />
                <label className="small text-muted">📅 Date *</label>
              </CCol>
              <CCol md={2}>
                <CFormSelect
                  size="sm"
                  name="receivedBy"
                  value={formData.receivedBy}
                  onChange={handleChange}
                >
                  <option value="School">School</option>
                  <option value="Bank">Bank</option>
                </CFormSelect>
                <label className="small text-muted">🏢 Received By *</label>
              </CCol>
              <CCol md={2}>
                <CFormSelect
                  size="sm"
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option value="">Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="DD">DD</option>
                  <option value="NEFT/RTGS">NEFT/RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="Swipe">Swipe</option>
                  <option value="Application">Application</option>
                </CFormSelect>
                <label className="small text-muted">💳 Pay Mode *</label>
              </CCol>
              <CCol md={6}>
                <CFormInput
                  size="sm"
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter remarks"
                />
                <label className="small text-muted">📝 Remarks</label>
              </CCol>
            </CRow>

            {/* Reference Fields - Show only when needed */}
            {showReferenceFields && (
              <CRow className="g-2 p-2 bg-dark rounded">
                <CCol md={3}>
                  <CFormInput
                    size="sm"
                    type="date"
                    name="referenceDate"
                    value={formData.referenceDate}
                    onChange={handleChange}
                  />
                  <label className="small text-muted">📅 Reference Date</label>
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    size="sm"
                    type="text"
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                    placeholder="Reference Number"
                  />
                  <label className="small text-muted">🔢 Reference Number</label>
                </CCol>
                <CCol md={3}>
                  <CFormSelect
                    size="sm"
                    name="drawnOn"
                    value={formData.drawnOn}
                    onChange={handleChange}
                  >
                    {drawnOnOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </CFormSelect>
                  <label className="small text-muted">🏦 Drawn On</label>
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    size="sm"
                    type="text"
                    name="advanceDeduct"
                    value={formData.advanceDeduct}
                    onChange={handleChange}
                    placeholder="Advance Deduct"
                  />
                  <label className="small text-muted">💵 Advance Deduct</label>
                </CCol>
              </CRow>
            )}
          </CForm>
        </CCardBody>
      </CCard>

      {/* Fee Details & Payment - Accordion Format */}
      {tableData.length > 0 && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-primary">📊 Fee Details & Payment</h6>
            </div>
          </CCardHeader>
          <CCardBody className="py-2">
            {/* Show info if selected term is fully paid */}
            {selectedTermFullyPaid && (
              <CAlert color="info" className="mb-2 py-2">
                ✅ All fees for the selected term have been paid through previous receipts.
              </CAlert>
            )}

            {/* Accordion for Terms */}
            <CAccordion>
              {groupedTableData().map((termGroup, groupIndex) => (
                <CAccordionItem key={groupIndex} itemKey={groupIndex}>
                  <CAccordionHeader>
                    <div className="d-flex justify-content-between w-100 me-3">
                      <span className="fw-bold">📅 {termGroup.termName}</span>
                      <span className="text-end">
                        <CBadge color="warning" className="me-2">
                          Balance: ₹{termGroup.termBalance.toFixed(2)}
                        </CBadge>
                        {termGroup.termFineBalance > 0 && (
                          <CBadge color="danger" className="me-2">
                            Fine Balance: ₹{termGroup.termFineBalance.toFixed(2)}
                          </CBadge>
                        )}
                        <CBadge color="primary">
                          Total: ₹{termGroup.termTotalFees.toFixed(2)}
                        </CBadge>
                      </span>
                    </div>
                  </CAccordionHeader>
                  <CAccordionBody>
                    {/* Regular Fees Section */}
                    {termGroup.regularRows.length > 0 && (
                      <>
                        <h6 className="text-primary mb-2">📚 Regular Fees</h6>
                        <CTable bordered hover responsive size="sm" className="mb-3">
                          <CTableHead className="table-dark">
                            <CTableRow>
                              <CTableHeaderCell className="small py-1">
                                🧾 Receipt Head
                              </CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">💰 Fees</CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">
                                📉 Concession
                              </CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">💵 Amount</CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">📋 Balance</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {termGroup.regularRows.map((row, rowIndex) => {
                              const tableIndex = tableData.findIndex(
                                (item) =>
                                  item.term === row.term && item.receiptHead === row.receiptHead,
                              )
                              return (
                                <CTableRow key={`regular-${rowIndex}`}>
                                  <CTableDataCell className="small fw-bold">
                                    {row.receiptHead}
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-end">
                                    ₹{row.fees}
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-center">
                                    <span className="text-muted">{formatConcessionText(row)}</span>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      size="sm"
                                      value={row.amount}
                                      onChange={(e) =>
                                        handleAmountChange(tableIndex, e.target.value)
                                      }
                                      style={{ width: '100px', fontSize: '0.75rem' }}
                                      min="0"
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-end text-warning">
                                    {row.balance}
                                  </CTableDataCell>
                                </CTableRow>
                              )
                            })}
                            {/* Regular Fees Subtotal */}
                            <CTableRow className="table-secondary">
                              <CTableDataCell className="small fw-bold">
                                📊 Regular Fees Subtotal
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹
                                {termGroup.regularRows
                                  .reduce((sum, row) => sum + parseFloat(row.fees || 0), 0)
                                  .toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-center">
                                {termGroup.termConcession > 0 &&
                                  `₹${termGroup.termConcession.toFixed(2)}`}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹
                                {termGroup.regularRows
                                  .reduce((sum, row) => sum + parseFloat(row.amount || 0), 0)
                                  .toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹{(termGroup.termBalance - termGroup.termFineBalance).toFixed(2)} Dr
                              </CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                      </>
                    )}

                    {/* Fine/Penalty Section */}
                    {termGroup.fineRows.length > 0 && (
                      <>
                        <h6 className="text-danger mb-2">⚠️ Fines & Penalties</h6>
                        <CTable bordered hover responsive size="sm" className="mb-3">
                          <CTableHead className="table-danger">
                            <CTableRow>
                              <CTableHeaderCell className="small py-1">
                                🧾 Fine Type
                              </CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">💰 Amount</CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">
                                📉 Concession
                              </CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">💵 Payment</CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">📋 Balance</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {termGroup.fineRows.map((row, rowIndex) => {
                              const tableIndex = tableData.findIndex(
                                (item) =>
                                  item.term === row.term && item.receiptHead === row.receiptHead,
                              )
                              return (
                                <CTableRow key={`fine-${rowIndex}`} className="table-light">
                                  <CTableDataCell className="small fw-bold text-danger">
                                    {row.receiptHead}
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-end">
                                    ₹{row.fees}
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-center">
                                    <span className="text-muted">{formatConcessionText(row)}</span>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CFormInput
                                      type="number"
                                      size="sm"
                                      value={row.amount}
                                      onChange={(e) =>
                                        handleAmountChange(tableIndex, e.target.value)
                                      }
                                      style={{ width: '100px', fontSize: '0.75rem' }}
                                      min="0"
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-end text-danger">
                                    {row.balance}
                                  </CTableDataCell>
                                </CTableRow>
                              )
                            })}
                            {/* Fine Subtotal */}
                            <CTableRow className="table-warning">
                              <CTableDataCell className="small fw-bold">
                                ⚠️ Fine Subtotal
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹
                                {termGroup.fineRows
                                  .reduce((sum, row) => sum + parseFloat(row.fees || 0), 0)
                                  .toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-center">
                                {termGroup.fineRows.reduce(
                                  (sum, row) => sum + parseFloat(row.concAmount || 0),
                                  0,
                                ) > 0 &&
                                  `₹${termGroup.fineRows.reduce((sum, row) => sum + parseFloat(row.concAmount || 0), 0).toFixed(2)}`}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹{termGroup.termFineTotal.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end text-danger">
                                ₹{termGroup.termFineBalance.toFixed(2)} Dr
                              </CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                      </>
                    )}

                    {/* Term Grand Total */}
                    <div className="bg-info text-white p-2 rounded">
                      <CRow>
                        <CCol md={8}>
                          <strong>📊 {termGroup.termName} - Grand Total</strong>
                        </CCol>
                        <CCol md={4} className="text-end">
                          <strong>
                            Payment: ₹{termGroup.termTotal.toFixed(2)} | Balance: ₹
                            {termGroup.termBalance.toFixed(2)} Dr
                          </strong>
                        </CCol>
                      </CRow>
                    </div>
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>

            {/* Grand Total & Actions - Sticky Bottom */}
            <div className="bg-dark border-top pt-2 mt-3">
              <CRow className="align-items-center">
                <CCol md={6}>
                  <div className="d-flex align-items-center">
                    <strong className="me-3">💯 Grand Total:</strong>
                    <CFormInput
                      type="number"
                      value={customGrandTotal || grandTotal}
                      onChange={(e) => handleCustomGrandTotalChange(e.target.value)}
                      style={{ width: '120px' }}
                      size="sm"
                      disabled={isAllFeesPaid}
                      className="me-2"
                    />
                    <div className="small text-muted ms-3">
                      <div>
                        Regular Balance: ₹
                        {(
                          totalBalance -
                          groupedTableData().reduce((sum, term) => sum + term.termFineBalance, 0)
                        ).toFixed(2)}{' '}
                        Dr
                      </div>
                      {groupedTableData().reduce((sum, term) => sum + term.termFineBalance, 0) >
                        0 && (
                        <div className="text-danger">
                          Fine Balance: ₹
                          {groupedTableData()
                            .reduce((sum, term) => sum + term.termFineBalance, 0)
                            .toFixed(2)}{' '}
                          Dr
                        </div>
                      )}
                    </div>
                  </div>
                </CCol>

                <CCol md={6} className="text-end">
                  <CButtonGroup size="sm">
                    <CButton
                      color="success"
                      onClick={saveFeeReceipt}
                      disabled={saveLoading || loading}
                    >
                      {saveLoading ? (
                        <>
                          <CSpinner size="sm" className="me-1" />
                          Saving...
                        </>
                      ) : (
                        '💾 Save Receipt'
                      )}
                    </CButton>
                    <CButton color="danger" onClick={resetAllData}>
                      🔄 Reset All
                    </CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>

              {/* Payment Status Alert */}
              {isAllFeesPaid && (
                <CAlert color="info" className="mt-2 mb-0 py-2">
                  ✅ All fees for this term have been paid through previous receipts.
                </CAlert>
              )}
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="text-center py-3">
          <CSpinner color="primary" />
          <p className="mt-2 small">Loading fee data...</p>
        </div>
      )}
    </CContainer>
  )
}

export default StudentFeeReceipt
