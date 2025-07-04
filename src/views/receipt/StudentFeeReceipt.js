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
  const [totalConcession, setTotalConcession] = useState(0)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [defaultSession, setDefaultSession] = useState('')
  const [termTotals, setTermTotals] = useState({})
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

  const [existingConcessions, setExistingConcessions] = useState({})
  const [concessionLoading, setConcessionLoading] = useState(false)

  const [saveLoading, setSaveLoading] = useState(false)
  const [existingReceipts, setExistingReceipts] = useState([])
  const [showReceiptHistory, setShowReceiptHistory] = useState(false)

  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500 // Increased from 300ms

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

  // Helper function to filter existing results
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
    receiptNumber: '',
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

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)

      // Cancel any pending request on component unmount
      if (abortController) {
        abortController.abort()
      }

      // Clear any pending timeout
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
      console.log(formData.sessionId)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to fetch initial data')
    }
  }

  const resetStudentSpecificData = () => {
    setStudentExtraInfo({
      className: '',
      studentName: '',
      groupName: '',
      section: '',
    })
    setFeeData(null)
    setTableData([])
    setExistingConcessions({})
    setExistingReceipts([])
    setGrandTotal(0)
    setTotalBalance(0)
    setTotalConcession(0)
    setCustomGrandTotal('')
    setFeeDataLoaded(false)
    setShowReceiptHistory(false)
    setError(null)
    setSuccess(null)

    // Clear search-related state
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

    if (name === 'termId') {
      handleTermSelect(value)
    }
    if (name === 'sessionId') {
      setSearchCache(new Map())
      setLastSearchQuery('')
      setSearchResults([])
      setShowDropdown(false)

      resetStudentSpecificData()

      // Reset only the form fields except sessionId
      setFormData((prev) => ({
        receiptDate: new Date().toISOString().split('T')[0],
        receivedBy: 'School',
        paymentMode: '',
        sessionId: value, // Keep the newly selected sessionId
        registrationNumber: '',
        termId: '',
        receiptNumber: '',
        referenceDate: new Date().toISOString().split('T')[0],
        referenceNumber: '',
        drawnOn: '',
        totalAdvance: '',
        advanceDeduct: '',
        remarks: '',
      }))

      // Clear student ID to reset search
      setStudentId('')
    }
  }

  const handleLiveSearch = async (value) => {
    setStudentId(value)

    // Clear results if input is empty
    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      resetStudentSpecificData()
      setLastSearchQuery('')
      return
    }

    // Minimum character threshold optimization
    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    // Cancel previous request if exists
    if (abortController) {
      abortController.abort()
    }

    // Clear previous debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const sessionIdToUse = formData.sessionId || defaultSession

    if (!sessionIdToUse) {
      setError('Session not loaded yet. Please wait and try again.')
      return
    }

    const cacheKey = getCacheKey(value.trim(), sessionIdToUse)
    const lastCacheKey = getCacheKey(lastSearchQuery, sessionIdToUse)

    // Check if we can filter existing results (smart filtering optimization)
    if (canFilterExistingResults(value.trim(), lastSearchQuery, searchResults)) {
      console.log('🔍 Filtering existing results instead of API call')
      const filteredResults = filterExistingResults(searchResults, value.trim())
      setSearchResults(filteredResults)
      setShowDropdown(filteredResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    // Check cache first (caching optimization)
    if (searchCache.has(cacheKey)) {
      console.log('📋 Using cached results')
      const cachedResults = searchCache.get(cacheKey)
      setSearchResults(cachedResults)
      setShowDropdown(cachedResults.length > 0)
      setLastSearchQuery(value.trim())
      return
    }

    // Enhanced debouncing
    const timeout = setTimeout(async () => {
      try {
        setLoading(true)

        // Create new AbortController for this request
        const newAbortController = new AbortController()
        setAbortController(newAbortController)

        console.log('🌐 Making API call for:', value.trim())

        // Make API call with abort signal
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

        // Update cache (implement LRU by limiting cache size)
        const newCache = new Map(searchCache)

        // Implement simple LRU: if cache size > 50, remove oldest entries
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
        // Don't show error if request was aborted (user typed more characters)
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

    // Fetch existing concessions and receipts for this student
    await Promise.all([
      fetchExistingConcessions(selectedStudent.admissionNumber),
      fetchExistingReceipts(selectedStudent.admissionNumber),
    ])
  }

  // Reset button handler
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
      receiptNumber: '',
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

  // Fetch existing concessions for the student
  const fetchExistingConcessions = async (admissionNumber) => {
    setConcessionLoading(true)
    try {
      console.log('🔍 Fetching existing concessions for:', admissionNumber)
      const response = await concessionApi.getById('student-concession/details', admissionNumber)

      if (response && response.feeCalculations) {
        setExistingConcessions(response.feeCalculations)
        setSuccess('Existing concession data loaded successfully')
        console.log('✅ Found existing concessions:', response.feeCalculations)
      } else {
        setExistingConcessions({})
        console.log('ℹ️ No existing concessions found')
      }
    } catch (error) {
      console.error('Error fetching concessions:', error)
      if (error.response?.status === 404) {
        setExistingConcessions({})
        console.log('ℹ️ No existing concessions found for student:', admissionNumber)
      } else {
        setError('Failed to fetch existing concession data')
      }
    } finally {
      setConcessionLoading(false)
    }
  }

  // Fetch existing receipts for the student
  const fetchExistingReceipts = async (admissionNumber) => {
    try {
      console.log('🔍 Fetching existing receipts for:', admissionNumber)
      const receipts = await receiptManagementApi.getById(
        'fees-collection/student',
        admissionNumber,
      )
      setExistingReceipts(receipts || [])

      console.log(receipts)

      if (receipts && receipts.length > 0) {
        setSuccess(`Found ${receipts.length} existing receipt(s) for this student`)
        console.log('✅ Found existing receipts:', receipts)

        // Update table data if term is already selected
        if (formData.termId) {
          updateTableDataWithReceipts(receipts, formData.termId)
        }
      } else {
        console.log('ℹ️ No existing receipts found')
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
      setError('Failed to fetch existing receipts')
      setExistingReceipts([])
    }
  }

  // Calculate which terms should be displayed based on previous payments
  const getVisibleTerms = (selectedTermId, allTerms, receipts, feeData) => {
    if (!feeData || !feeData[0]?.feeTerms) return []

    const selectedTermIdInt = parseInt(selectedTermId)
    const sortedTerms = [...allTerms].sort((a, b) => a.id - b.id)
    const applicableTerms = sortedTerms.filter((term) => term.id <= selectedTermIdInt)

    // Calculate total payments from receipts
    let totalPaid = 0
    if (receipts && receipts.length > 0) {
      receipts.forEach((receipt) => {
        if (receipt.receiptDetails) {
          receipt.receiptDetails.forEach((detail) => {
            totalPaid += parseFloat(detail.amountPaid || 0)
          })
        }
      })
    }

    // Calculate cumulative term totals and determine which terms to show
    let cumulativeAmount = 0
    let remainingPayment = totalPaid
    const visibleTerms = []

    for (const term of applicableTerms) {
      const termId = term.id
      let termTotal = 0
      const feeTerms = feeData[0].feeTerms

      // Calculate term total
      for (const receiptHead in feeTerms) {
        const feeAmount = feeTerms[receiptHead][termId] || 0
        if (feeAmount > 0) {
          // Apply existing concessions
          const existingConcession = existingConcessions[receiptHead]?.[termId]
          let concAmount = 0
          if (existingConcession) {
            if (existingConcession.concPercent > 0) {
              concAmount = (feeAmount * existingConcession.concPercent) / 100
            } else {
              concAmount = existingConcession.concAmount || 0
            }
          }
          termTotal += feeAmount - concAmount
        }
      }

      cumulativeAmount += termTotal

      // If remaining payment is less than cumulative amount, this term has balance
      if (remainingPayment < cumulativeAmount) {
        visibleTerms.push(term)
      }
    }

    // If no terms have balance, show the selected term
    if (visibleTerms.length === 0) {
      const selectedTerm = sortedTerms.find((t) => t.id === selectedTermIdInt)
      if (selectedTerm) {
        visibleTerms.push(selectedTerm)
      }
    }

    return visibleTerms
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

  // New function to update table data with receipt information
  const updateTableDataWithReceipts = (receipts, selectedTermId = null) => {
    const termIdToUse = selectedTermId || formData.termId

    if (!feeData || !termIdToUse) return

    const selectedTermIdInt = parseInt(termIdToUse)
    const visibleTerms = getVisibleTerms(selectedTermIdInt, terms, receipts, feeData)

    let newTableData = []
    let newTermTotals = {}

    visibleTerms.forEach((term) => {
      const termId = term.id
      const termName = term.name
      let termTotal = 0
      let termItems = []

      const feeTerms = feeData[0].feeTerms

      for (const receiptHead in feeTerms) {
        const feeAmount = feeTerms[receiptHead][termId]

        if (feeAmount > 0) {
          // Check for existing concessions
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

          // Calculate final concession amount
          let finalConcessionAmount = 0
          if (concPercent > 0) {
            finalConcessionAmount = (feeAmount * concPercent) / 100
          } else {
            finalConcessionAmount = concAmount
          }

          // Calculate previous payments and balance from receipts
          const { totalPreviousPaid, previousBalance } = calculatePreviousPayments(
            receiptHead,
            termName,
            receipts,
          )

          // Calculate current amounts
          const amountAfterConcession = feeAmount - finalConcessionAmount
          const currentBalance = Math.max(0, amountAfterConcession - totalPreviousPaid)
          const displayBalance = currentBalance > 0 ? `${currentBalance.toFixed(2)} Dr` : '0'

          termTotal += Math.min(amountAfterConcession, amountAfterConcession - currentBalance)

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
            amount: Math.min(amountAfterConcession, amountAfterConcession - currentBalance),
            balance: displayBalance,
            totalPreviousPaid: totalPreviousPaid,
          })
        }
      }

      newTermTotals[termId] = termTotal
      newTableData = [...newTableData, ...termItems]
    })

    setTableData(newTableData)
    setTermTotals(newTermTotals)
    calculateGrandTotal(newTableData)
    setCustomGrandTotal('')
  }

  // Save fee receipt function
  const saveFeeReceipt = async () => {
    try {
      // Validation
      if (!formData.receiptNumber.trim()) {
        setError('Receipt number is required')
        return
      }

      if (!formData.paymentMode) {
        setError('Payment mode is required')
        return
      }

      if (!formData.termId) {
        setError('Term selection is required')
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

      setSaveLoading(true)
      setError(null)

      // Prepare the receipt data according to your API structure
      const receiptData = {
        receiptNumber: formData.receiptNumber.trim(),
        admissionNumber: studentId,
        studentName: studentExtraInfo.studentName,
        className: studentExtraInfo.className,
        sessionId: formData.sessionId,
        termId: formData.termId,
        receiptDate: formData.receiptDate,
        receivedBy: formData.receivedBy,
        paymentMode: formData.paymentMode,
        referenceDate: formData.referenceDate,
        referenceNumber: formData.referenceNumber,
        drawnOn: formData.drawnOn,
        totalAdvance: parseFloat(formData.totalAdvance || 0),
        advanceDeduct: parseFloat(formData.advanceDeduct || 0),
        remarks: formData.remarks,

        // Fee details
        feeDetails: tableData.map((item) => ({
          termId: item.termId,
          termName: item.term,
          receiptHead: item.receiptHead,
          previousBalance: parseFloat(item.prvBal || 0),
          feeAmount: parseFloat(item.fees || 0),
          adjustAmount: parseFloat(item.adjust || 0),
          concessionPercent: parseFloat(item.concPercent || 0),
          concessionAmount: parseFloat(item.concAmount || 0),
          concessionType: item.selectedConcession,
          amountPaid: parseFloat(item.amount || 0),
          balanceAmount:
            item.balance === '0' ? 0 : parseFloat(item.balance?.replace('Dr', '').trim() || 0),
          itemRemarks: item.remarks || '',
        })),

        // Totals
        totalFeeAmount: tableData.reduce((sum, item) => sum + parseFloat(item.fees || 0), 0),
        totalConcessionAmount: totalConcession,
        totalPaidAmount: parseFloat(customGrandTotal || grandTotal),
        totalBalanceAmount: totalBalance,
      }

      console.log('💾 Saving receipt data:', receiptData)

      // Call the API
      const response = await receiptManagementApi.create('fees-collection/create', receiptData)

      console.log('✅ Receipt saved successfully:', response)
      setSuccess(`Receipt ${formData.receiptNumber} created successfully!`)

      // Refresh existing receipts
      await fetchExistingReceipts(studentId)

      // Optionally reset form or keep it for viewing
      // resetAllData()
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

    // Reset form data to defaults
    setFormData({
      receiptDate: new Date().toISOString().split('T')[0],
      receivedBy: 'School',
      paymentMode: '',
      sessionId: defaultSession,
      registrationNumber: '',
      termId: '',
      receiptNumber: '',
      referenceDate: new Date().toISOString().split('T')[0],
      referenceNumber: '',
      drawnOn: '',
      totalAdvance: '',
      advanceDeduct: '',
      remarks: '',
    })
  }

  useEffect(() => {
    if (studentId && formData.sessionId) {
      searchStudentFeeByAdmissionNumber()
    }
  }, [studentId, formData.sessionId])

  // Modified handleTermSelect to use the new update function
  const handleTermSelect = (selectedTermId) => {
    if (!feeData || !feeData[0]?.feeTerms) return

    // Update form data
    setFormData((prev) => ({ ...prev, termId: selectedTermId }))

    // Update table data with both concessions and receipts, passing the selected term ID
    updateTableDataWithReceipts(existingReceipts, selectedTermId)
  }

  const calculateGrandTotal = (rows) => {
    // Calculate total amount
    const totalAmount = rows.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0)

    // Calculate total concession
    const totalConcessionAmount = rows.reduce(
      (sum, row) => sum + parseFloat(row.concAmount || 0),
      0,
    )

    // Calculate total balance
    const totalBalanceAmount = rows.reduce((sum, row) => {
      if (typeof row.balance === 'string' && row.balance.includes('Dr')) {
        sum += parseFloat(row.balance.replace('Dr', '').trim()) || 0
      } else if (typeof row.balance === 'number' && row.balance < 0) {
        sum += Math.abs(row.balance)
      }
      return sum
    }, 0)

    // Update state with totals
    setGrandTotal(totalAmount)
    setTotalConcession(totalConcessionAmount)
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
      setFeeDataLoaded(true)

      // If term is already selected and we have receipts, update table
      if (formData.termId && existingReceipts.length > 0) {
        updateTableDataWithReceipts(existingReceipts, formData.termId)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to fetch student fee data')
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
  }, [formData.termId, feeData, terms])

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

    // Update amount
    updatedTableData[index].amount = amount

    // Calculate balance
    if (amount === maxAllowedAmount) {
      updatedTableData[index].balance = '0'
    } else if (amount < maxAllowedAmount) {
      updatedTableData[index].balance = `${(maxAllowedAmount - amount).toFixed(2)} Dr`
    }

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('')
  }

  // Handle concession percentage change
  const handleConcPercentChange = (index, value) => {
    const updatedTableData = [...tableData]
    const percent = parseFloat(value) || 0
    const fees = updatedTableData[index].fees || 0

    if (percent > 100) {
      alert('Concession percentage cannot exceed 100%!')
      return
    }

    const concAmount = (fees * percent) / 100
    const newAmount = fees - concAmount

    updatedTableData[index].concPercent = percent
    updatedTableData[index].concAmount = concAmount
    updatedTableData[index].amount = newAmount
    updatedTableData[index].balance = '0'

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('')
  }

  // Handle concession amount change
  const handleConcAmountChange = (index, value) => {
    const updatedTableData = [...tableData]
    const amount = parseFloat(value) || 0
    const fees = updatedTableData[index].fees || 0

    if (amount > fees) {
      alert(`Concession amount cannot exceed the fee amount (₹${fees})!`)
      return
    }

    const newAmount = fees - amount

    updatedTableData[index].concPercent = 0
    updatedTableData[index].concAmount = amount
    updatedTableData[index].amount = newAmount
    updatedTableData[index].balance = '0'

    setTableData(updatedTableData)
    calculateGrandTotal(updatedTableData)
    setCustomGrandTotal('')
  }

  // Handle concession type change
  const handleConcessionTypeChange = (index, value) => {
    const updatedTableData = [...tableData]
    updatedTableData[index].selectedConcession = value
    setTableData(updatedTableData)
  }

  // Handle remarks change
  const handleRemarksChange = (index, value) => {
    const updatedTableData = [...tableData]
    updatedTableData[index].remarks = value
    setTableData(updatedTableData)
  }

  // Function to handle custom grand total input
  const handleCustomGrandTotalChange = (value) => {
    const customAmount = parseFloat(value) || 0
    setCustomGrandTotal(value)

    if (customAmount <= 0) return

    // Get the original fees total after concessions
    const originalTotal = tableData.reduce(
      (sum, row) => sum + (parseFloat(row.fees || 0) - parseFloat(row.concAmount || 0)),
      0,
    )

    if (customAmount > originalTotal) {
      alert('Custom amount cannot be greater than total fees after concessions!')
      return
    }

    // Sequential distribution logic (same as before but considering concessions)
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
            (r) => r.termId === row.termId && r.receiptHead === row.receiptHead,
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

  // Separate function to calculate only the total balance
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

  // Group table data by term for display
  const groupedTableData = () => {
    const groupedByTerm = {}

    tableData.forEach((row) => {
      if (!groupedByTerm[row.term]) {
        groupedByTerm[row.term] = {
          termName: row.term,
          termId: row.termId,
          rows: [],
          termTotal: 0,
          termConcession: 0,
        }
      }
      groupedByTerm[row.term].rows.push(row)
      groupedByTerm[row.term].termTotal += parseFloat(row.amount || 0)
      groupedByTerm[row.term].termConcession += parseFloat(row.concAmount || 0)
    })

    return Object.values(groupedByTerm).sort((a, b) => a.termId - b.termId)
  }

  // Check if payment mode requires reference fields
  const showReferenceFields = formData.paymentMode && formData.paymentMode !== 'Cash'

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Fee Receipt with Concession Management</strong>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}
            {success && (
              <CAlert color="success" dismissible onClose={() => setSuccess(null)}>
                {success}
              </CAlert>
            )}

            <CForm>
              {/* Combined Student Search and Info Card */}
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>Student Information</strong>
                  <CButton color="secondary" size="sm" className="float-end" onClick={handleReset}>
                    Reset
                  </CButton>
                </CCardHeader>
                <CCardBody>
                  {/* Search Row */}
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
                      {(loading || concessionLoading) && (
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
                            backgroundColor: 'white',
                          }}
                        >
                          {searchResults.map((result, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                backgroundColor: '#fff',
                                color: '#333',
                              }}
                              className="hover-item"
                              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8f9fa')}
                              onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
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

                  {/* Student Info - Display as text */}
                  {studentExtraInfo.studentName && (
                    <CRow className="mb-2">
                      <CCol md={12}>
                        <div
                          style={{
                            backgroundColor: '#333333',
                            padding: '12px',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6',
                          }}
                        >
                          <CRow>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Student Name:</small>
                                <div className="fw-medium">{studentExtraInfo.studentName}</div>
                                {existingReceipts.length > 0 && (
                                  <small className="text-info">
                                    📄 {existingReceipts.length} previous receipt(s)
                                    <CButton
                                      size="sm"
                                      color="link"
                                      className="p-0 ms-2"
                                      onClick={() => setShowReceiptHistory(!showReceiptHistory)}
                                    >
                                      {showReceiptHistory ? 'Hide' : 'View'}
                                    </CButton>
                                  </small>
                                )}
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Class:</small>
                                <div className="fw-medium">{studentExtraInfo.className}</div>
                                {Object.keys(existingConcessions).length > 0 && (
                                  <small className="text-success">💰 Concessions available</small>
                                )}
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Group:</small>
                                <div className="fw-medium">
                                  {studentExtraInfo.groupName || 'N/A'}
                                </div>
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Section:</small>
                                <div className="fw-medium">{studentExtraInfo.section}</div>
                              </div>
                            </CCol>
                          </CRow>
                        </div>
                      </CCol>
                    </CRow>
                  )}
                </CCardBody>
              </CCard>

              {/* Receipt History Collapse */}
              <CCollapse visible={showReceiptHistory}>
                <CCard className="mb-3">
                  <CCardHeader>Previous Receipts</CCardHeader>
                  <CCardBody>
                    {existingReceipts.length > 0 ? (
                      <CTable size="sm" striped>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Receipt No.</CTableHeaderCell>
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Term</CTableHeaderCell>
                            <CTableHeaderCell>Amount</CTableHeaderCell>
                            <CTableHeaderCell>Payment Mode</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {existingReceipts.map((receipt, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell>{receipt.receiptNumber}</CTableDataCell>
                              <CTableDataCell>
                                {new Date(receipt.receiptDate).toLocaleDateString()}
                              </CTableDataCell>
                              <CTableDataCell>{receipt.termName || receipt.termId}</CTableDataCell>
                              <CTableDataCell>
                                ₹{receipt.totalAmountPaid?.toFixed(2) || '0.00'}
                              </CTableDataCell>
                              <CTableDataCell>{receipt.paymentMode}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    ) : (
                      <p className="text-muted">No previous receipts found.</p>
                    )}
                  </CCardBody>
                </CCard>
              </CCollapse>

              {/* Receipt Details Form */}
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Date<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="date"
                    name="receiptDate"
                    value={formData.receiptDate}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={3}>
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
                <CCol md={3}>
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
              </CRow>

              {/* Payment Info */}
              <CRow className="mb-3">
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
                    floatingLabel={
                      <>
                        Receipt Number<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                    placeholder="Enter receipt number"
                  />
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

              {/* Conditional Reference Fields - Only show when payment mode is not Cash */}
              {showReferenceFields && (
                <CRow className="mb-3">
                  <CCol md={3}>
                    <CFormInput
                      type="date"
                      floatingClassName="mb-3"
                      floatingLabel="Reference Date"
                      name="referenceDate"
                      value={formData.referenceDate}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormInput
                      type="text"
                      floatingClassName="mb-3"
                      floatingLabel="Reference Number"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      placeholder="Enter reference number"
                    />
                  </CCol>
                  <CCol md={3}>
                    <CFormSelect
                      name="drawnOn"
                      floatingClassName="mb-3"
                      floatingLabel="Drawn On"
                      value={formData.drawnOn}
                      onChange={handleChange}
                    >
                      {drawnOnOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>{/* Empty column for spacing */}</CCol>
                </CRow>
              )}

              {/* General Remarks Row */}
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormInput
                    type="text"
                    floatingClassName="mb-3"
                    floatingLabel="General Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Enter any general remarks for this receipt"
                  />
                </CCol>
              </CRow>
            </CForm>

            {loading && (
              <div className="text-center mb-3">
                <CSpinner color="primary" />
                <p className="mt-2">Loading fee data...</p>
              </div>
            )}

            {tableData.length > 0 && (
              <div style={{ marginTop: '2rem', maxHeight: '500px', overflowY: 'auto' }}>
                <CTable bordered hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Term</CTableHeaderCell>
                      <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                      <CTableHeaderCell>Prv. Bal.</CTableHeaderCell>
                      <CTableHeaderCell>Fees</CTableHeaderCell>
                      <CTableHeaderCell>Adjust</CTableHeaderCell>
                      <CTableHeaderCell>Conc. %</CTableHeaderCell>
                      <CTableHeaderCell>Concession</CTableHeaderCell>
                      <CTableHeaderCell>Conc. Type</CTableHeaderCell>
                      <CTableHeaderCell>Amount</CTableHeaderCell>
                      <CTableHeaderCell>Balance</CTableHeaderCell>
                      <CTableHeaderCell>Remarks</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {groupedTableData().map((termGroup, groupIndex) => (
                      <React.Fragment key={groupIndex}>
                        {termGroup.rows.map((row, rowIndex) => {
                          const tableIndex = tableData.findIndex(
                            (item) =>
                              item.term === row.term && item.receiptHead === row.receiptHead,
                          )
                          return (
                            <CTableRow key={`${groupIndex}-${rowIndex}`}>
                              {/* Show term name only in the first row of each term group */}
                              {rowIndex === 0 ? (
                                <CTableDataCell rowSpan={termGroup.rows.length}>
                                  {row.term}
                                </CTableDataCell>
                              ) : null}
                              <CTableDataCell>{row.receiptHead}</CTableDataCell>
                              <CTableDataCell>₹{(row.prvBal || 0).toFixed(2)}</CTableDataCell>
                              <CTableDataCell>₹{row.fees}</CTableDataCell>
                              <CTableDataCell>{row.adjust}</CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="number"
                                  value={row.concPercent || ''}
                                  onChange={(e) =>
                                    handleConcPercentChange(tableIndex, e.target.value)
                                  }
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  size="sm"
                                  placeholder="0"
                                />
                              </CTableDataCell>
                              <CTableDataCell>₹{(row.concAmount || 0).toFixed(2)}</CTableDataCell>
                              <CTableDataCell>
                                <CFormSelect
                                  value={row.selectedConcession || ''}
                                  onChange={(e) =>
                                    handleConcessionTypeChange(tableIndex, e.target.value)
                                  }
                                  size="sm"
                                >
                                  <option value="">Select</option>
                                  {concessions.map((concession) => (
                                    <option key={concession.id} value={concession.id}>
                                      {concession.name}
                                    </option>
                                  ))}
                                </CFormSelect>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="number"
                                  value={row.amount}
                                  onChange={(e) => handleAmountChange(tableIndex, e.target.value)}
                                  min="0"
                                  step="0.01"
                                  size="sm"
                                />
                              </CTableDataCell>
                              <CTableDataCell>{row.balance}</CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="text"
                                  value={row.remarks || ''}
                                  onChange={(e) => handleRemarksChange(tableIndex, e.target.value)}
                                  placeholder="Remarks"
                                  size="sm"
                                />
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                        {/* Term subtotal row */}
                        <CTableRow style={{ backgroundColor: '#f0f0f0' }}>
                          <CTableHeaderCell colSpan={6}>
                            Term Total: {termGroup.termName}
                          </CTableHeaderCell>
                          <CTableHeaderCell>
                            ₹{termGroup.termConcession.toFixed(2)}
                          </CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                          <CTableHeaderCell>₹{termGroup.termTotal.toFixed(2)}</CTableHeaderCell>
                          <CTableHeaderCell colSpan={2}></CTableHeaderCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                    {/* Grand Total row with custom input */}
                    <CTableRow
                      color="light"
                      style={{ fontWeight: 'bold', backgroundColor: '#e9ecef' }}
                    >
                      <CTableHeaderCell colSpan={6}>Grand Total</CTableHeaderCell>
                      <CTableHeaderCell>₹{totalConcession.toFixed(2)}</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                      <CTableHeaderCell>
                        <CFormInput
                          type="number"
                          value={customGrandTotal || grandTotal}
                          onChange={(e) => handleCustomGrandTotalChange(e.target.value)}
                          style={{ fontWeight: 'bold' }}
                          min="0"
                          step="0.01"
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell>
                        {totalBalance > 0 ? `₹${totalBalance.toFixed(2)} Dr` : '₹0'}
                      </CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>
            )}

            {/* Action Buttons */}
            {tableData.length > 0 && (
              <CRow className="mt-3">
                <CCol xs={12} className="text-end">
                  <CButton
                    color="success"
                    onClick={saveFeeReceipt}
                    disabled={
                      saveLoading ||
                      loading ||
                      !formData.paymentMode ||
                      !formData.termId ||
                      !formData.receiptNumber.trim()
                    }
                    className="me-2"
                  >
                    {saveLoading && <CSpinner size="sm" className="me-2" />}
                    {saveLoading ? 'Saving...' : 'Generate Receipt'}
                  </CButton>
                  <CButton color="secondary" className="ms-2" onClick={resetAllData}>
                    Reset
                  </CButton>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentFeeReceipt
