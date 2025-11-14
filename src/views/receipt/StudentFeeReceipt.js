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
  const currentStudentRef = useRef(null)
  const fetchAbortControllerRef = useRef(null)
  const [showGrandTotalAlert, setShowGrandTotalAlert] = useState(false)
  const [grandTotalAlertMessage, setGrandTotalAlertMessage] = useState('')
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
      if (fetchAbortControllerRef.current) {
        fetchAbortControllerRef.current.abort()
      }
      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [])

  useEffect(() => {
    if (studentId === '') {
      currentStudentRef.current = null
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
    console.log('🔄 Resetting student-specific data')

    if (fetchAbortControllerRef.current) {
      fetchAbortControllerRef.current.abort()
      fetchAbortControllerRef.current = null
    }

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

      setStudentId('')
      currentStudentRef.current = null

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
    const trimmedValue = value.trim()

    // If user clears the search or starts typing a new search, reset everything
    if (!trimmedValue) {
      setSearchResults([])
      setShowDropdown(false)
      resetStudentSpecificData() // This will clear all student-related data
      currentStudentRef.current = null
      setLastSearchQuery('')
      return
    }

    // If the search value is significantly different from current student ID and we have loaded data,
    // it means user is searching for a new student, so reset
    if (
      feeDataLoaded &&
      currentStudentRef.current &&
      !trimmedValue.toLowerCase().includes(currentStudentRef.current.toLowerCase())
    ) {
      console.log('🔄 User searching for different student, resetting data')
      currentStudentRef.current = null
      resetStudentSpecificData()
    }

    if (trimmedValue.length < MIN_SEARCH_LENGTH) {
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

    if (fetchAbortControllerRef.current) {
      console.log('⚠️ Aborting previous fetch operations')
      fetchAbortControllerRef.current.abort()
    }

    currentStudentRef.current = selectedStudent.admissionNumber

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

    const newAbortController = new AbortController()
    fetchAbortControllerRef.current = newAbortController

    try {
      // Fetch both student fees and receipts for the new student
      await Promise.all([
        fetchStudentFeesFromNewAPI(selectedStudent.admissionNumber, newAbortController.signal),
        fetchStudentReceipts(selectedStudent.admissionNumber, newAbortController.signal),
      ])

      if (currentStudentRef.current !== selectedStudent.admissionNumber) {
        console.log('⚠️ Student changed during fetch, discarding results')
        return
      }

      console.log('✅ Successfully loaded data for:', selectedStudent.admissionNumber)
    } catch (error) {
      console.error('Error fetching student data:', error)
      setError('Failed to load student data. Please try again.')
    } finally {
      if (currentStudentRef.current === selectedStudent.admissionNumber) {
        setLoading(false)
        fetchAbortControllerRef.current = null
      }
    }
  }

  const fetchStudentReceipts = async (admissionNumber) => {
    const fetchingFor = admissionNumber
    try {
      console.log('🧾 Fetching receipts for:', admissionNumber)
      const sessionIdToUse = formData.sessionId || defaultSession

      // Use the correct endpoint that matches your backend
      const response = await receiptManagementApi.getAll(
        `student-receipts/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      if (currentStudentRef.current !== fetchingFor) {
        console.log('⚠️ Discarding receipt data for old student:', fetchingFor)
        return
      }

      setReceipts(response || [])
      setReceiptsLoaded(true)
      console.log('✅ Receipts loaded:', response)
    } catch (error) {
      console.error('Error fetching receipts:', error)
      if (currentStudentRef.current === fetchingFor) {
        setReceipts([])
        setReceiptsLoaded(true)
      }
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
    const fetchingFor = admissionNumber
    setLoading(true)
    try {
      console.log('🔍 Fetching student fees from new API for:', admissionNumber)
      const sessionIdToUse = formData.sessionId || defaultSession

      const response = await receiptManagementApi.getAll(
        `student/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      console.log('🔍 API Response:', response)
      if (response.feeDetails && response.feeDetails.length > 0) {
        console.log('🔍 First fee detail:', response.feeDetails[0])
        if (!response.feeDetails[0].receiptHeadId) {
          console.error('❌ Backend is NOT sending receiptHeadId!')
        }
      }

      if (currentStudentRef.current !== fetchingFor) {
        console.log('⚠️ Discarding fee data for old student:', fetchingFor)
        return
      }

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
      if (currentStudentRef.current === fetchingFor) {
        setError('Failed to fetch student fee data')
        setStudentFeeResponse(null)
        setFeeDataLoaded(false)
      }
    } finally {
      if (currentStudentRef.current === fetchingFor) {
        setLoading(false)
      }
    }
  }

  const handleReset = () => {
    setStudentId('')
    currentStudentRef.current = null
    setSearchCache(new Map())
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

  const convertNewFeeDataToOldFormat = (newFeeData, selectedTermId) => {
    if (!newFeeData || !newFeeData.feeDetails) return []

    console.log('🔄 Converting fee data for term:', selectedTermId)
    console.log('📥 Input feeDetails:', newFeeData.feeDetails)

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
          const key = `${fee.termId}-${fee.receiptHeadId}` // ✅ Use receiptHeadId instead of name for uniqueness
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
          // ✅ Validation
          if (!fee.receiptHeadId) {
            console.error('❌ Missing receiptHeadId in source data:', fee)
          }

          const convertedItem = {
            term: fee.termName,
            termId: fee.termId,
            receiptHead: fee.receiptHeadName,
            receiptHeadId: fee.receiptHeadId, // ✅ This should be the ID number from backend
            prvBal: 0,
            fees: fee.originalFee,
            adjust: 0,
            concPercent:
              fee.concessionAmount > 0 ? (fee.concessionAmount / fee.originalFee) * 100 : 0,
            concAmount: fee.concessionAmount,
            selectedConcession: '',
            remarks: '',
            amount: 0,
            balance: fee.balanceAmount > 0 ? `${Math.round(fee.balanceAmount)} Dr` : '0',
            totalPreviousPaid: fee.paidAmount,
            feeId: fee.id,
            isFine: isFineRelated(fee.receiptHeadName),
          }

          // ✅ Debug log each converted item
          console.log('📤 Converted item:', {
            receiptHead: convertedItem.receiptHead,
            receiptHeadId: convertedItem.receiptHeadId,
            termId: convertedItem.termId,
          })

          convertedData.push(convertedItem)
        })
      })

    // ✅ Final validation
    const missingIds = convertedData.filter((item) => !item.receiptHeadId)
    if (missingIds.length > 0) {
      console.error('❌ Items missing receiptHeadId after conversion:', missingIds)
    } else {
      console.log('✅ All converted items have receiptHeadId')
    }

    console.log('📊 Final converted data:', convertedData)

    return convertedData
  }

  const handleTermSelect = (selectedTermId) => {
    setFormData((prev) => ({ ...prev, termId: selectedTermId }))

    if (studentFeeResponse) {
      const convertedTableData = convertNewFeeDataToOldFormat(studentFeeResponse, selectedTermId)

      console.log('📊 Converted table data:', convertedTableData)

      // ✅ Check first row for receiptHeadId
      if (convertedTableData.length > 0) {
        console.log('🔍 First row receiptHeadId:', convertedTableData[0].receiptHeadId)
        if (!convertedTableData[0].receiptHeadId) {
          console.error('❌ CRITICAL: receiptHeadId is missing in converted data!')
          setError('Fee data is missing receipt head information. Please contact support.')
          return
        }
      }

      setTableData(convertedTableData)
      calculateGrandTotal(convertedTableData)

      const selectedTermIdInt = parseInt(selectedTermId)

      const currentAndPreviousTermFees = studentFeeResponse.feeDetails.filter(
        (fee) => fee.termId <= selectedTermIdInt,
      )

      const hasUnpaidFees = currentAndPreviousTermFees.some((fee) => fee.balanceAmount > 0)
      const hasFeesForSelectedTerm = studentFeeResponse.feeDetails.some(
        (fee) => fee.termId === selectedTermIdInt,
      )
      setSelectedTermFullyPaid(!hasUnpaidFees && hasFeesForSelectedTerm)
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

  const handleAmountChange = (index, newAmount) => {
    const updatedTableData = [...tableData]

    // Parse as integer (whole number only)
    const amount = parseInt(newAmount, 10) || 0
    const fees = parseFloat(updatedTableData[index].fees || 0)
    const concessionAmount = parseFloat(updatedTableData[index].concAmount || 0)
    const totalPreviousPaid = parseFloat(updatedTableData[index].totalPreviousPaid || 0)

    // Calculate the fees after concession
    const feesAfterConcession = fees - concessionAmount

    // Calculate the previous balance (what the student still owes before this payment)
    const prevBalance = Math.max(0, feesAfterConcession - totalPreviousPaid)

    // Validate that the amount entered doesn't exceed the previous balance
    if (amount > prevBalance) {
      alert(
        `Amount cannot be greater than the previous balance. Previous Balance: ₹${Math.round(prevBalance)}`,
      )
      return
    }

    // Update the amount (store as whole number)
    updatedTableData[index].amount = amount

    // Calculate new balance after this payment - NEVER NEGATIVE
    const newBalance = Math.max(0, prevBalance - amount)

    // Update balance field
    if (newBalance <= 0) {
      updatedTableData[index].balance = '0'
    } else {
      updatedTableData[index].balance = `${Math.round(newBalance)} Dr`
    }

    console.log('📝 Updated row:', {
      index,
      receiptHeadId: updatedTableData[index].receiptHeadId, // ✅ Should be present
      amount: updatedTableData[index].amount,
    })

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('') // Clear custom grand total when manual changes are made
  }

  const saveFeeReceipt = async () => {
    try {
      // Validations
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
        setError('No fee data available to save')
        return
      }

      console.log('💾 Starting save process...')
      console.log('📋 Current tableData:', tableData)

      setSaveLoading(true)
      setError(null)

      const displayedTermIds = [...new Set(tableData.map((row) => row.termId))]
      console.log('📊 Displayed term IDs:', displayedTermIds)

      const selectedTermId = parseInt(formData.termId)
      if (!displayedTermIds.includes(selectedTermId)) {
        setError('Invalid term selection - term not found in fee data')
        setSaveLoading(false)
        return
      }

      const relevantTerms = terms.filter((term) => displayedTermIds.includes(term.termId))
      console.log('📊 Relevant terms:', relevantTerms)

      // Create a map to track all term entries that need to be sent
      const termPaymentMap = new Map()

      // Initialize all relevant terms with 0 amounts
      relevantTerms.forEach((term) => {
        // Find all receipt heads for this term in tableData
        const termRows = tableData.filter((row) => row.termId === term.termId)

        termRows.forEach((row) => {
          const key = `${term.termId}_${row.receiptHeadId}`
          termPaymentMap.set(key, {
            admissionNumber: studentId,
            sessionId: parseInt(formData.sessionId),
            termId: term.termId,
            receiptHeadId: row.receiptHeadId,
            paymentAmount: 0, // Initialize with 0
            termName: row.term,
            receiptHeadName: row.receiptHead,
          })
        })
      })

      // Update the map with actual amounts entered by user
      tableData.forEach((item) => {
        const amount = parseFloat(item.amount || 0)
        if (amount >= 0) {
          // Include even 0 amounts initially
          const key = `${item.termId}_${item.receiptHeadId}`

          // Validate required fields
          if (!item.receiptHeadId) {
            console.error('❌ Item missing receiptHeadId:', item)
            throw new Error(`Missing receipt head ID for ${item.receiptHead} in ${item.term}`)
          }

          if (!item.termId) {
            console.error('❌ Item missing termId:', item)
            throw new Error(`Missing term ID for ${item.receiptHead}`)
          }

          termPaymentMap.set(key, {
            admissionNumber: studentId,
            sessionId: parseInt(formData.sessionId),
            termId: item.termId,
            receiptHeadId: item.receiptHeadId,
            paymentAmount: amount,
            termName: item.term,
            receiptHeadName: item.receiptHead,
          })
        }
      })

      // ✅ CRITICAL FIX: Filter out zero-amount payments BEFORE validation
      const allPayments = Array.from(termPaymentMap.values())
      console.log('📦 All payments (before filtering):', allPayments)

      const payments = allPayments.filter((payment) => payment.paymentAmount > 0)
      console.log('✅ Filtered payments (only amount > 0):', payments)

      if (payments.length === 0) {
        setError('Please enter payment amount for at least one fee')
        setSaveLoading(false)
        return
      }

      // Double-check validation on filtered payments only
      const invalidPayments = payments.filter(
        (p) =>
          !p.admissionNumber ||
          !p.sessionId ||
          !p.termId ||
          p.receiptHeadId === null ||
          p.receiptHeadId === undefined ||
          p.paymentAmount === null ||
          p.paymentAmount === undefined ||
          p.paymentAmount <= 0, // ✅ Extra check
      )

      if (invalidPayments.length > 0) {
        console.error('❌ Invalid payments found:', invalidPayments)
        setError(
          'Some payment records are missing required information. Please refresh and try again.',
        )
        setSaveLoading(false)
        return
      }

      console.log('✅ All payments validated successfully')

      // Correct PaymentRequestDTO structure
      const paymentRequest = {
        admissionNumber: studentId,
        sessionId: parseInt(formData.sessionId),
        payments: payments, // ✅ Now contains only payments with amount > 0
        receivedBy: formData.receivedBy || 'School',
        paymentMode: formData.paymentMode,
        referenceDate: formData.referenceDate || null,
        referenceNumber: formData.referenceNumber || null,
        drawnOn: formData.drawnOn || null,
        remarks: formData.remarks || null,
        createdBy: 'Frontend User',
        generateReceiptWithPdf: true,
      }

      console.log('🚀 Final payment request:', JSON.stringify(paymentRequest, null, 2))

      const response = await receiptManagementApi.create('payment', paymentRequest)

      console.log('✅ Payment response:', response)

      setSuccess(`Payment processed successfully! Receipt: ${response.receiptNumber}`)

      // Refresh both fee data and receipts
      await Promise.all([fetchStudentFeesFromNewAPI(studentId), fetchStudentReceipts(studentId)])

      // Open PDF if available
      if (response.receiptPdfUrl) {
        window.open(response.receiptPdfUrl, '_blank')
      } else if (response.pdfUrl) {
        window.open(response.pdfUrl, '_blank')
      }

      // Reset term and table data after successful payment
      resetTermAndTableData()
    } catch (error) {
      console.error('❌ Error saving receipt:', error)
      console.error('Error details:', error.response?.data || error.message)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to save receipt. Please try again.'

      setError(errorMessage)
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
    // Only allow whole numbers
    const cleanValue = value.replace(/[^0-9]/g, '')
    const customAmount = parseInt(cleanValue, 10) || 0

    setCustomGrandTotal(cleanValue)

    if (customAmount <= 0) {
      // Reset all amounts to 0
      const resetTableData = tableData.map((row) => {
        const fees = parseFloat(row.fees || 0)
        const concAmount = parseFloat(row.concAmount || 0)
        const totalPreviousPaid = parseFloat(row.totalPreviousPaid || 0)
        const prevBalance = Math.max(0, fees - concAmount - totalPreviousPaid)

        return {
          ...row,
          amount: 0,
          balance: `${Math.round(prevBalance)} Dr`,
        }
      })
      setTableData(resetTableData)
      setGrandTotal(0)
      calculateTotalBalance(resetTableData)
      return
    }

    // Calculate total available balance (what student owes) - rounded
    const totalAvailableBalance = Math.round(
      tableData.reduce((sum, row) => {
        const fees = parseFloat(row.fees || 0)
        const concAmount = parseFloat(row.concAmount || 0)
        const previousPaid = parseFloat(row.totalPreviousPaid || 0)
        const prevBalance = Math.max(0, fees - concAmount - previousPaid)
        return sum + prevBalance
      }, 0),
    )

    // Check if amount exceeds total balance - Show alert instead of browser alert
    if (customAmount > totalAvailableBalance) {
      setGrandTotalAlertMessage(
        `Entered amount ₹${customAmount.toLocaleString()} exceeds total balance ₹${totalAvailableBalance.toLocaleString()}. Please enter a valid amount.`,
      )
      setShowGrandTotalAlert(true)
      setCustomGrandTotal('') // Clear the invalid input
      return
    }

    // FIRST: Zero out all amounts in tableData
    const resetTableData = tableData.map((row) => {
      const fees = parseFloat(row.fees || 0)
      const concAmount = parseFloat(row.concAmount || 0)
      const totalPreviousPaid = parseFloat(row.totalPreviousPaid || 0)
      const prevBalance = Math.max(0, fees - concAmount - totalPreviousPaid)

      return {
        ...row,
        amount: 0,
        balance: `${Math.round(prevBalance)} Dr`,
      }
    })

    // THEN: Distribute the amount from top to bottom
    const updatedTableData = [...resetTableData]

    // Group by term and sort by termId
    const groupedByTerm = {}
    updatedTableData.forEach((row, index) => {
      if (!groupedByTerm[row.termId]) {
        groupedByTerm[row.termId] = []
      }
      groupedByTerm[row.termId].push({ ...row, originalIndex: index })
    })

    const sortedTerms = Object.keys(groupedByTerm)
      .map((termId) => parseInt(termId))
      .sort((a, b) => a - b)

    let remainingAmount = customAmount

    // Distribute amount term by term, oldest first
    for (const termId of sortedTerms) {
      const termRows = groupedByTerm[termId]

      // First handle regular fees, then fines
      const regularRows = termRows.filter((row) => !row.isFine)
      const fineRows = termRows.filter((row) => row.isFine)

      // Process regular fees first
      for (const row of regularRows) {
        if (remainingAmount <= 0) break

        const fees = parseFloat(row.fees || 0)
        const concAmount = parseFloat(row.concAmount || 0)
        const previousPaid = parseFloat(row.totalPreviousPaid || 0)
        const prevBalance = Math.round(Math.max(0, fees - concAmount - previousPaid))

        if (prevBalance > 0) {
          const amountToAllocate = Math.min(remainingAmount, prevBalance)

          updatedTableData[row.originalIndex].amount = amountToAllocate

          const newBalance = prevBalance - amountToAllocate
          updatedTableData[row.originalIndex].balance = newBalance > 0 ? `${newBalance} Dr` : '0'

          remainingAmount -= amountToAllocate
        } else {
          updatedTableData[row.originalIndex].amount = 0
          updatedTableData[row.originalIndex].balance = '0'
        }
      }

      // Then process fines
      for (const row of fineRows) {
        if (remainingAmount <= 0) break

        const fees = parseFloat(row.fees || 0)
        const concAmount = parseFloat(row.concAmount || 0)
        const previousPaid = parseFloat(row.totalPreviousPaid || 0)
        const prevBalance = Math.round(Math.max(0, fees - concAmount - previousPaid))

        if (prevBalance > 0) {
          const amountToAllocate = Math.min(remainingAmount, prevBalance)

          updatedTableData[row.originalIndex].amount = amountToAllocate

          const newBalance = prevBalance - amountToAllocate
          updatedTableData[row.originalIndex].balance = newBalance > 0 ? `${newBalance} Dr` : '0'

          remainingAmount -= amountToAllocate
        } else {
          updatedTableData[row.originalIndex].amount = 0
          updatedTableData[row.originalIndex].balance = '0'
        }
      }
    }

    setTableData(updatedTableData)
    setGrandTotal(customAmount)
    calculateTotalBalance(updatedTableData)
  }

  const calculateTotalBalance = (rows) => {
    const totalBalanceAmount = Math.max(
      0,
      Math.round(
        rows.reduce((sum, row) => {
          if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
            sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
          } else if (typeof row.balance === 'number' && row.balance > 0) {
            sum += row.balance
          }
          return sum
        }, 0),
      ),
    )

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
          termPaid: 0, // ✅ Add separate paid tracking
          termFineTotal: 0,
          termFineBalance: 0,
          termFinePaid: 0, // ✅ Add fine paid tracking
        }
      }

      if (row.isFine) {
        groupedByTerm[row.term].fineRows.push(row)
        groupedByTerm[row.term].termFineTotal += parseFloat(row.amount || 0)
        groupedByTerm[row.term].termFinePaid += parseFloat(row.totalPreviousPaid || 0) // ✅ Track fine paid
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
      groupedByTerm[row.term].termPaid += parseFloat(row.totalPreviousPaid || 0) // ✅ Only previous payments

      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        groupedByTerm[row.term].termBalance += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      }
    })

    // Ensure no negative balances
    Object.values(groupedByTerm).forEach((term) => {
      term.termBalance = Math.max(0, term.termBalance)
      term.termFineBalance = Math.max(0, term.termFineBalance)
      term.termPaid = Math.max(0, term.termPaid)
      term.termFinePaid = Math.max(0, term.termFinePaid)
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

  const calculateTotalAmountAdded = () => {
    return groupedTableData().reduce((sum, term) => sum + term.termTotal, 0)
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
                        <br />
                        <small className="text-muted">{result.fatherName}</small>
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
              <h6 className="mb-0 fw-bold">Fee Details & Payment</h6>
            </div>
          </CCardHeader>
          <CCardBody className="py-2">
            {/* Show info if selected term is fully paid */}
            {selectedTermFullyPaid && (
              <CAlert color="info" className="mb-2 py-2">
                All fees for the selected term have been paid through previous receipts.
              </CAlert>
            )}
            <CTable
              bordered
              size="sm"
              className="mb-0"
              style={{
                fontSize: '0.875rem',
                tableLayout: 'fixed',
                width: '100%',
              }}
            >
              <colgroup>
                <col style={{ width: '30%' }} />
                <col style={{ width: '17.5%' }} />
                <col style={{ width: '17.5%' }} />
                <col style={{ width: '17.5%' }} />
                <col style={{ width: '17.5%' }} />
              </colgroup>
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell style={{ padding: '8px', paddingLeft: '48px' }}>
                    Term
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ padding: '8px', textAlign: 'right' }}>
                    Fees
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ padding: '8px', textAlign: 'right' }}>
                    Paid
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ padding: '8px', textAlign: 'right' }}>
                    Balance
                  </CTableHeaderCell>
                  <CTableHeaderCell style={{ padding: '8px', textAlign: 'right' }}>
                    Amount
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
            </CTable>
            <CAccordion>
              {groupedTableData().map((termGroup, groupIndex) => (
                <CAccordionItem key={groupIndex} itemKey={groupIndex}>
                  <CAccordionHeader>
                    <div className="w-100 me-3">
                      {/* Simple Table Format for Summary */}
                      <CTable
                        bordered
                        size="sm"
                        className="mb-0"
                        style={{
                          fontSize: '0.875rem',
                          tableLayout: 'fixed',
                          width: '100%',
                        }}
                      >
                        <colgroup>
                          <col style={{ width: '30%' }} />
                          <col style={{ width: '17.5%' }} />
                          <col style={{ width: '17.5%' }} />
                          <col style={{ width: '17.5%' }} />
                          <col style={{ width: '17.5%' }} />
                        </colgroup>
                        <CTableBody>
                          <CTableRow>
                            <CTableDataCell style={{ padding: '8px', fontWeight: '500' }}>
                              {termGroup.termName}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ padding: '8px', fontWeight: '500', textAlign: 'right' }}
                            >
                              ₹{Math.round(termGroup.termTotalFees)}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ padding: '8px', fontWeight: '500', textAlign: 'right' }}
                            >
                              ₹
                              {Math.round(
                                termGroup.termTotalFees -
                                  termGroup.termConcession -
                                  termGroup.termBalance,
                              )}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ padding: '8px', fontWeight: '500', textAlign: 'right' }}
                            >
                              ₹{Math.round(termGroup.termBalance)}
                            </CTableDataCell>
                            <CTableDataCell
                              style={{ padding: '8px', fontWeight: '500', textAlign: 'right' }}
                            >
                              ₹{Math.round(termGroup.termTotal)}
                            </CTableDataCell>
                          </CTableRow>
                        </CTableBody>
                      </CTable>
                    </div>
                  </CAccordionHeader>
                  <CAccordionBody>
                    {/* Regular Fees Section */}
                    {termGroup.regularRows.length > 0 && (
                      <>
                        <h6 className="mb-2">Regular Fees</h6>
                        <CTable
                          bordered
                          size="sm"
                          className="mb-0"
                          style={{ fontSize: '0.875rem', tableLayout: 'fixed', width: '100%' }}
                        >
                          <CTableHead className="table-light">
                            <CTableRow>
                              <CTableHeaderCell style={{ padding: '8px', width: '12%' }}>
                                Receipt Head
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                style={{ padding: '8px', width: '12%', textAlign: 'right' }}
                              >
                                Fees
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                style={{ padding: '8px', width: '12%', textAlign: 'right' }}
                              >
                                Concession
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                style={{ padding: '8px', width: '12%', textAlign: 'right' }}
                              >
                                Paid
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                style={{ padding: '8px', width: '12%', textAlign: 'right' }}
                              >
                                Prev Balance
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                style={{ padding: '8px', width: '12%', textAlign: 'right' }}
                              >
                                Amount
                              </CTableHeaderCell>
                              <CTableHeaderCell
                                style={{ padding: '8px', width: '12%', textAlign: 'right' }}
                              >
                                Balance
                              </CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {termGroup.regularRows.map((row, rowIndex) => {
                              const tableIndex = tableData.findIndex(
                                (item) =>
                                  item.term === row.term &&
                                  item.receiptHead === row.receiptHead &&
                                  !item.isFine,
                              )

                              const fees = parseFloat(row.fees || 0)
                              const concession = parseFloat(row.concAmount || 0)
                              const paid = parseFloat(row.totalPreviousPaid || 0)
                              const prevBalance = Math.max(0, fees - concession - paid)
                              const amount = parseFloat(row.amount || 0)
                              const newBalance = Math.max(0, prevBalance - amount)

                              return (
                                <CTableRow key={`regular-${rowIndex}`}>
                                  <CTableDataCell style={{ padding: '8px' }}>
                                    {row.receiptHead}
                                  </CTableDataCell>
                                  <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                    ₹{fees.toFixed(2)}
                                  </CTableDataCell>
                                  <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                    {concession > 0 ? `₹${concession.toFixed(2)}` : '-'}
                                  </CTableDataCell>
                                  <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                    ₹{paid.toFixed(2)}
                                  </CTableDataCell>
                                  <CTableDataCell
                                    style={{
                                      padding: '8px',
                                      textAlign: 'right',
                                      fontWeight: '500',
                                    }}
                                  >
                                    ₹{prevBalance.toFixed(2)}
                                  </CTableDataCell>
                                  <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                    <CFormInput
                                      type="text"
                                      size="sm"
                                      value={amount > 0 ? Math.round(amount).toString() : ''}
                                      onChange={(e) => {
                                        // Only allow digits, no decimals
                                        const value = e.target.value.replace(/[^0-9]/g, '')

                                        if (value === '' || value === '0') {
                                          handleAmountChange(tableIndex, '0')
                                          return
                                        }

                                        const numValue = parseInt(value, 10)
                                        if (!isNaN(numValue)) {
                                          handleAmountChange(tableIndex, numValue.toString())
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '')
                                        const numValue = parseInt(value, 10)
                                        if (!isNaN(numValue) && numValue > 0) {
                                          handleAmountChange(tableIndex, numValue.toString())
                                        } else {
                                          handleAmountChange(tableIndex, '0')
                                        }
                                      }}
                                      placeholder="0"
                                      style={{ textAlign: 'right', minWidth: '100px' }}
                                    />
                                  </CTableDataCell>
                                  <CTableDataCell
                                    style={{
                                      padding: '8px',
                                      textAlign: 'right',
                                      fontWeight: '500',
                                    }}
                                  >
                                    ₹{newBalance.toFixed(2)}
                                  </CTableDataCell>
                                </CTableRow>
                              )
                            })}

                            {/* Fine Rows - if present in this term */}
                            {termGroup.fineRows.length > 0 &&
                              termGroup.fineRows.map((row, rowIndex) => {
                                const tableIndex = tableData.findIndex(
                                  (item) =>
                                    item.term === row.term &&
                                    item.receiptHead === row.receiptHead &&
                                    item.isFine,
                                )

                                const fees = parseFloat(row.fees || 0)
                                const concession = parseFloat(row.concAmount || 0)
                                const paid = parseFloat(row.totalPreviousPaid || 0)
                                const prevBalance = Math.max(0, fees - concession - paid)
                                const amount = parseFloat(row.amount || 0)
                                const newBalance = Math.max(0, prevBalance - amount)

                                return (
                                  <CTableRow
                                    key={`fine-${rowIndex}`}
                                    style={{ backgroundColor: '#444444' }}
                                  >
                                    <CTableDataCell style={{ padding: '8px', fontWeight: '500' }}>
                                      {row.receiptHead}
                                    </CTableDataCell>
                                    <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                      ₹{fees.toFixed(2)}
                                    </CTableDataCell>
                                    <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                      {concession > 0 ? `₹${concession.toFixed(2)}` : '-'}
                                    </CTableDataCell>
                                    <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                      ₹{paid.toFixed(2)}
                                    </CTableDataCell>
                                    <CTableDataCell
                                      style={{
                                        padding: '8px',
                                        textAlign: 'right',
                                        fontWeight: '500',
                                      }}
                                    >
                                      ₹{prevBalance.toFixed(2)}
                                    </CTableDataCell>
                                    <CTableDataCell style={{ padding: '8px', textAlign: 'right' }}>
                                      <CFormInput
                                        type="text"
                                        size="sm"
                                        value={amount > 0 ? amount.toFixed(2) : ''}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/[^0-9.]/g, '')
                                          if (value === '' || value === '0' || value === '0.') {
                                            handleAmountChange(tableIndex, '0')
                                            return
                                          }

                                          const numValue = parseFloat(value)
                                          if (!isNaN(numValue)) {
                                            handleAmountChange(tableIndex, value)
                                          }
                                        }}
                                        onBlur={(e) => {
                                          const value = e.target.value.replace(/[^0-9.]/g, '')
                                          const numValue = parseFloat(value)
                                          if (!isNaN(numValue) && numValue > 0) {
                                            handleAmountChange(tableIndex, numValue.toFixed(2))
                                          } else {
                                            handleAmountChange(tableIndex, '0')
                                          }
                                        }}
                                        placeholder="0.00"
                                        style={{ textAlign: 'right', minWidth: '100px' }}
                                      />
                                    </CTableDataCell>
                                    <CTableDataCell
                                      style={{
                                        padding: '8px',
                                        textAlign: 'right',
                                        fontWeight: '500',
                                      }}
                                    >
                                      ₹{Math.max(0, Math.round(newBalance))}
                                    </CTableDataCell>
                                  </CTableRow>
                                )
                              })}

                            <CTableRow className="table-secondary">
                              <CTableDataCell style={{ padding: '8px', fontWeight: '600' }}>
                                Subtotal
                              </CTableDataCell>
                              <CTableDataCell
                                style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}
                              >
                                ₹{Math.round(termGroup.termTotalFees)}
                              </CTableDataCell>
                              <CTableDataCell
                                style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}
                              >
                                {termGroup.termConcession > 0
                                  ? `₹${Math.round(termGroup.termConcession)}`
                                  : '-'}
                              </CTableDataCell>
                              <CTableDataCell
                                style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}
                              >
                                ₹{Math.round(termGroup.termTotalFees - termGroup.termBalance)}
                              </CTableDataCell>
                              <CTableDataCell
                                style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}
                              >
                                ₹{Math.round(termGroup.termBalance)}
                              </CTableDataCell>
                              <CTableDataCell
                                style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}
                              >
                                ₹{Math.round(termGroup.termTotal)}
                              </CTableDataCell>
                            </CTableRow>
                          </CTableBody>
                        </CTable>
                      </>
                    )}
                  </CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>
            {/* Grand Total & Actions - Sticky Bottom */}
            <div className="border-top pt-2 mt-3">
              <CRow className="align-items-center">
                <CCol md={6}>
                  <div className="d-flex align-items-center">
                    <strong className="me-3">Grand Total:</strong>
                    <CFormInput
                      type="text"
                      value={
                        customGrandTotal ||
                        (grandTotal > 0 ? Math.round(grandTotal).toString() : '')
                      }
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        handleCustomGrandTotalChange(value)
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '')
                        const numValue = parseInt(value, 10)
                        if (!isNaN(numValue) && numValue > 0) {
                          handleCustomGrandTotalChange(numValue.toString())
                        }
                      }}
                      style={{ width: '150px' }}
                      size="sm"
                      disabled={isAllFeesPaid}
                      className="me-2"
                      placeholder="0"
                    />
                    <div className="small text-muted ms-3">
                      <div>Total Balance: ₹{Math.round(totalBalance)}</div>
                      <div>Amount Added: ₹{Math.round(calculateTotalAmountAdded())}</div>
                      {groupedTableData().reduce((sum, term) => sum + term.termFineBalance, 0) >
                        0 && (
                        <div>
                          Fine Balance: ₹
                          {Math.round(
                            groupedTableData().reduce((sum, term) => sum + term.termFineBalance, 0),
                          )}
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
                        'Save Receipt'
                      )}
                    </CButton>
                    <CButton color="danger" onClick={resetAllData}>
                      Reset All
                    </CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>

              {/* Payment Status Alert */}
              {isAllFeesPaid && (
                <CAlert color="info" className="mt-2 mb-0 py-2">
                  All fees for this term have been paid through previous receipts.
                </CAlert>
              )}
            </div>
          </CCardBody>
        </CCard>
      )}
      {/* Grand Total Alert */}
      {showGrandTotalAlert && (
        <CAlert
          color="warning"
          dismissible
          onClose={() => {
            setShowGrandTotalAlert(false)
            setGrandTotalAlertMessage('')
          }}
          className="mt-2"
        >
          {grandTotalAlertMessage}
        </CAlert>
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
