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
  const [receiptPdfLoading, setReceiptPdfLoading] = useState(false)
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

  // NEW: Receipt management state
  const [receipts, setReceipts] = useState([])
  const [selectedReceiptId, setSelectedReceiptId] = useState('')
  const [receiptsLoaded, setReceiptsLoaded] = useState(false)

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

  // COMPLETE reset function that replicates the reset button functionality
  const resetStudentSpecificData = () => {
    // Reset student info
    setStudentExtraInfo({
      className: '',
      studentName: '',
      groupName: '',
      section: '',
    })

    // Reset fee data
    setTableData([])
    setGrandTotal(0)
    setTotalBalance(0)
    setTotalConcession(0)
    setCustomGrandTotal('')
    setFeeDataLoaded(false)
    setShowReceiptHistory(false)
    setSelectedTermFullyPaid(false)

    // Reset alerts
    setError(null)
    setSuccess(null)

    // Reset new fee management state
    setStudentFeeResponse(null)

    // Reset receipt management state
    setReceipts([])
    setSelectedReceiptId('')
    setReceiptsLoaded(false)

    // Reset search related state
    setLastSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)

    // COMPLETE form reset - exactly like the reset button does
    setFormData({
      receiptDate: new Date().toISOString().split('T')[0],
      receivedBy: 'School',
      paymentMode: '',
      sessionId: defaultSession, // Keep the current session
      registrationNumber: '',
      termId: '', // This was missing - CRITICAL for term dropdown reset
      referenceDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      drawnOn: '',
      totalAdvance: '',
      advanceDeduct: '',
      remarks: '',
    })
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

    // If user clears the search or starts typing a new search, reset everything
    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      resetStudentSpecificData() // This will clear all student-related data
      setLastSearchQuery('')
      return
    }

    // If the search value is significantly different from current student ID and we have loaded data,
    // it means user is searching for a new student, so reset
    if (feeDataLoaded && value.trim() !== studentId && studentId) {
      resetStudentSpecificData()
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
      console.log('Filtering existing results instead of API call')
      const filteredResults = filterExistingResults(searchResults, value.trim())
      setSearchResults(filteredResults)
      setShowDropdown(filteredResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

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
        setLoading(true)

        const newAbortController = new AbortController()
        setAbortController(newAbortController)

        console.log('Making API call for:', value.trim())

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
    // First, do the complete reset (same as reset button)
    resetStudentSpecificData()

    // Then set the new student data
    setStudentId(selectedStudent.admissionNumber)

    // Update only the student-specific form data
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

    // Show loading state while fetching new data
    setLoading(true)

    try {
      // Fetch both student fees and receipts for the new student
      await Promise.all([
        fetchStudentFeesFromNewAPI(selectedStudent.admissionNumber),
        fetchStudentReceipts(selectedStudent.admissionNumber),
      ])
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to load student data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentReceipts = async (admissionNumber) => {
    try {
      console.log('🧾 Fetching receipts for:', admissionNumber)
      const sessionIdToUse = formData.sessionId || defaultSession

      // Use the correct endpoint that matches your backend
      const response = await receiptManagementApi.getAll(
        `student-receipts/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      setReceipts(response || [])
      setReceiptsLoaded(true)
      console.log('✅ Receipts loaded:', response)
    } catch (error) {
      console.error('Error fetching receipts:', error)
      setReceipts([])
      setReceiptsLoaded(true) // Still mark as loaded even if error, to enable dropdown
    }
  }

  const handleReceiptSelect = async (receiptNumber) => {
    if (!receiptNumber) {
      setSelectedReceiptId('')
      return
    }

    setSelectedReceiptId(receiptNumber)
    setReceiptPdfLoading(true)

    try {
      console.log('📄 Opening receipt PDF for:', receiptNumber)

      // Method 1: Try to get receipt details first to check if PDF URL exists
      try {
        const receiptDetails = await receiptManagementApi.getById('receipt-details', receiptNumber)

        if (receiptDetails && receiptDetails.pdfUrl) {
          // If PDF URL exists, open it directly
          window.open(
            receiptDetails.pdfUrl,
            '_blank',
            'width=800,height=600,scrollbars=yes,resizable=yes',
          )
          setSuccess(`Receipt PDF opened for ${receiptNumber}`)
          return
        }
      } catch (detailsError) {
        console.log('Receipt details not found, trying direct PDF download:', detailsError.message)
      }
    } catch (error) {
      console.error('Error handling receipt PDF:', error)
      setError(`Failed to open receipt PDF: ${error.message}`)
    } finally {
      setReceiptPdfLoading(false)
    }
  }

  // NEW: Fetch student fees using new API
  const fetchStudentFeesFromNewAPI = async (admissionNumber) => {
    setLoading(true)
    try {
      console.log('🔍 Fetching student fees from new API for:', admissionNumber)
      const sessionIdToUse = formData.sessionId || defaultSession

      const response = await receiptManagementApi.getAll(
        `student/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      setStudentFeeResponse(response)
      setFeeDataLoaded(true)

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

  // NEW: Convert new fee data to old format for existing UI
  const convertNewFeeDataToOldFormat = (newFeeData, selectedTermId) => {
    if (!newFeeData || !newFeeData.feeDetails) return []

    const selectedTermIdInt = parseInt(selectedTermId)

    const termIds = new Set()
    newFeeData.feeDetails.forEach((fee) => {
      if (fee.termId <= selectedTermIdInt && fee.balanceAmount > 0) {
        termIds.add(fee.termId)
      }
    })

    termIds.add(selectedTermIdInt)

    const convertedData = []

    Array.from(termIds)
      .sort((a, b) => a - b)
      .forEach((termId) => {
        const termFees = newFeeData.feeDetails.filter((fee) => fee.termId === termId)

        const uniqueFees = new Map()
        termFees.forEach((fee) => {
          const key = `${fee.termId}-${fee.receiptHeadName}`
          if (!uniqueFees.has(key)) {
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
            prvBal: 0,
            fees: fee.originalFee,
            adjust: 0,
            concPercent:
              fee.concessionAmount > 0 ? (fee.concessionAmount / fee.originalFee) * 100 : 0,
            concAmount: fee.concessionAmount,
            selectedConcession: '',
            remarks: '',
            amount: fee.balanceAmount,
            balance: fee.balanceAmount > 0 ? `${fee.balanceAmount.toFixed(2)} Dr` : '0',
            totalPreviousPaid: fee.paidAmount,
            feeId: fee.id,
            isFine: isFineRelated(fee.receiptHeadName),
          })
        })
      })

    return convertedData
  }

  const handleTermSelect = (selectedTermId) => {
    setFormData((prev) => ({ ...prev, termId: selectedTermId }))

    if (studentFeeResponse) {
      const convertedTableData = convertNewFeeDataToOldFormat(studentFeeResponse, selectedTermId)
      setTableData(convertedTableData)
      calculateGrandTotal(convertedTableData)

      const selectedTermFees = studentFeeResponse.feeDetails.filter(
        (fee) => fee.termId === parseInt(selectedTermId),
      )
      const hasUnpaidFees = selectedTermFees.some((fee) => fee.balanceAmount > 0)
      setSelectedTermFullyPaid(!hasUnpaidFees && selectedTermFees.length > 0)
    }
  }

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

  // FIXED: Updated amount change validation logic
  const handleAmountChange = (index, newAmount) => {
    const updatedTableData = [...tableData]
    const amount = parseFloat(newAmount) || 0
    const fees = updatedTableData[index].fees || 0
    const concessionAmount = updatedTableData[index].concAmount || 0
    const totalPreviousPaid = updatedTableData[index].totalPreviousPaid || 0

    // Calculate the fees after concession
    const feesAfterConcession = fees - concessionAmount

    // Calculate the balance remaining (what the student still owes)
    const balanceRemaining = Math.max(0, feesAfterConcession - totalPreviousPaid)

    // Validate that the amount entered doesn't exceed the balance remaining
    if (amount > balanceRemaining) {
      alert(
        `Amount cannot be greater than the balance remaining. Balance: ₹${balanceRemaining.toFixed(2)}`,
      )
      return
    }

    // Update the amount
    updatedTableData[index].amount = amount

    // Calculate new balance after this payment
    const newBalanceAfterPayment = balanceRemaining - amount

    if (newBalanceAfterPayment <= 0) {
      updatedTableData[index].balance = '0'
    } else {
      updatedTableData[index].balance = `${newBalanceAfterPayment.toFixed(2)} Dr`
    }

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('')
  }

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
        receivedBy: formData.receivedBy || 'School',
        paymentMode: formData.paymentMode,
        referenceDate: formData.referenceDate || null,
        referenceNumber: formData.referenceNumber || null,
        drawnOn: formData.drawnOn || null,
        remarks: formData.remarks || null,
        createdBy: 'Frontend User',
        generateReceiptWithPdf: true,
      }

      console.log('💾 Processing payment with new API:', paymentRequest)

      const response = await receiptManagementApi.create('payment', paymentRequest)

      alert(`Payment processed successfully! Receipt: ${response.receiptNumber}`)
      setSuccess(`Payment processed successfully! Receipt: ${response.receiptNumber}`)

      // Refresh both fee data and receipts
      await Promise.all([fetchStudentFeesFromNewAPI(studentId), fetchStudentReceipts(studentId)])

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

      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        groupedByTerm[row.term].termBalance += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      }
    })

    return Object.values(groupedByTerm).sort((a, b) => a.termId - b.termId)
  }

  const showReferenceFields = formData.paymentMode && formData.paymentMode !== 'Cash'

  const getRelevantTermBalances = () => {
    if (!studentFeeResponse || !formData.termId) return []

    const selectedTermIdInt = parseInt(formData.termId)
    const relevantTerms = []

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

      if (isFineRelated(fee.receiptHeadName)) {
        termGroups[fee.termId].fineBalance += fee.balanceAmount
      } else {
        termGroups[fee.termId].regularBalance += fee.balanceAmount
      }
    })

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
      } else if (term.fineBalance === 0 || term.fineBalance == null) {
        badges.push(
          <CBadge key={`fine-${term.termId}`} color="danger" className="me-1">
            {term.termName} Fine: ₹0.0
          </CBadge>,
        )
      }
    })

    return badges
  }

  const isAllFeesPaid = selectedTermFullyPaid

  const formatConcessionText = (row) => {
    if (row.concPercent > 0) {
      return `${row.concPercent.toFixed(1)}% (₹${row.concAmount.toFixed(2)})`
    } else if (row.concAmount > 0) {
      return `₹${row.concAmount.toFixed(2)}`
    }
    return '-'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`
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
            <CCol md={3}>
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

            {/* PDF Loading Indicator */}
            {receiptPdfLoading && (
              <CAlert color="info" className="mb-2">
                <div className="d-flex align-items-center">
                  <CSpinner size="sm" className="me-2" />
                  <span>Opening receipt PDF...</span>
                </div>
              </CAlert>
            )}
            {/* NEW: Receipt Dropdown */}
            <CCol md={2}>
              <CFormSelect
                size="sm"
                value={selectedReceiptId}
                onChange={(e) => handleReceiptSelect(e.target.value)}
                disabled={!receiptsLoaded}
              >
                <option value="">
                  {receiptsLoaded
                    ? receipts.length === 0
                      ? 'No Receipts Found'
                      : 'Select Receipt'
                    : 'Receipts...'}
                </option>
                {receipts.map((receipt) => (
                  <option key={receipt.receiptNumber} value={receipt.receiptNumber}>
                    {receipt.receiptNumber}
                  </option>
                ))}
              </CFormSelect>
              <label className="small text-muted">🧾 Previous Receipts</label>
            </CCol>

            {/* Quick Actions */}
            <CCol md={3} className="text-end">
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

          {/* Receipt Summary - Show when receipts are loaded */}
          {receiptsLoaded && receipts.length > 0 && (
            <CRow className="mt-2 p-2 bg-info rounded">
              <CCol className="small">
                <strong>🧾 Receipt Summary:</strong>
                <span className="ms-2">
                  Total Receipts:{' '}
                  <CBadge color="light" className="text-dark">
                    {receipts.length}
                  </CBadge>
                </span>
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
                        <CBadge color="primary" className="me-2">
                          Total: ₹{termGroup.termTotalFees.toFixed(2)}
                        </CBadge>
                        <CBadge color="secondary" className="me-2">
                          Paid : ₹
                          {termGroup.termTotalFees.toFixed(2) - termGroup.termBalance.toFixed(2)}
                        </CBadge>
                        <CBadge color="info" className="me-2">
                          Balance: ₹{termGroup.termBalance.toFixed(2)}
                        </CBadge>
                        {termGroup.termFineBalance > 0 && (
                          <CBadge color="danger" className="me-2">
                            Fine Balance: ₹{termGroup.termFineBalance.toFixed(2)}
                          </CBadge>
                        )}
                        {termGroup.termFineBalance === 0 && (
                          <CBadge color="danger" className="me-2">
                            Fine Balance: ₹0.0
                          </CBadge>
                        )}
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
                              <CTableHeaderCell className="small py-1">💰 Paid</CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">📋 Balance</CTableHeaderCell>
                              <CTableHeaderCell className="small py-1">💵 Amount</CTableHeaderCell>
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
                                  <CTableDataCell className="small text-end text-warning">
                                    ₹{row.totalPreviousPaid}
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-end text-warning">
                                    {row.balance}
                                  </CTableDataCell>
                                  <CTableDataCell className="small text-end">
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
                                </CTableRow>
                              )
                            })}
                            {termGroup.fineRows.length > 0 && (
                              <>
                                {termGroup.fineRows.map((row, rowIndex) => {
                                  const tableIndex = tableData.findIndex(
                                    (item) =>
                                      item.term === row.term &&
                                      item.receiptHead === row.receiptHead,
                                  )
                                  return (
                                    <CTableRow key={`fine-${rowIndex}`}>
                                      <CTableDataCell className="small fw-bold text-danger">
                                        {row.receiptHead}
                                      </CTableDataCell>
                                      <CTableDataCell className="small text-end">
                                        ₹{row.fees}
                                      </CTableDataCell>
                                      <CTableDataCell className="small text-center">
                                        <span className="text-muted">
                                          {formatConcessionText(row)}
                                        </span>
                                      </CTableDataCell>
                                      <CTableDataCell className="small text-end">
                                        ₹{row.totalPreviousPaid}
                                      </CTableDataCell>
                                      <CTableDataCell className="small text-end text-danger">
                                        {row.balance}
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
                                    </CTableRow>
                                  )
                                })}
                              </>
                            )}
                            {/* Regular Fees Subtotal */}
                            <CTableRow className="table-secondary">
                              <CTableDataCell className="small fw-bold">
                                📊 Fees Subtotal
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹{termGroup.termTotalFees.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                {termGroup.termConcession > 0 &&
                                  `₹${termGroup.termConcession.toFixed(2)}`}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹
                                {termGroup.termTotalFees.toFixed(2) -
                                  termGroup.termBalance.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹{termGroup.termBalance.toFixed(2)} Dr
                              </CTableDataCell>
                              <CTableDataCell className="small fw-bold text-end">
                                ₹
                                {termGroup.regularRows
                                  .reduce((sum, row) => sum + parseFloat(row.amount || 0), 0)
                                  .toFixed(2)}
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
