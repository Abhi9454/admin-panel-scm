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
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CBadge,
  CContainer,
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

  // NEW: Accordion state management
  const [activeAccordionItems, setActiveAccordionItems] = useState([
    'student-search',
    'receipt-form',
  ])

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

    await Promise.all([
      fetchExistingConcessions(selectedStudent.admissionNumber),
      fetchExistingReceipts(selectedStudent.admissionNumber),
    ])
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

  const fetchExistingConcessions = async (admissionNumber) => {
    setConcessionLoading(true)
    try {
      console.log('🔍 Fetching existing concessions for:', admissionNumber)
      const response = await concessionApi.getById('student-concession/details', admissionNumber)

      if (response && response.feeCalculations) {
        setExistingConcessions(response.feeCalculations)
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

  const fetchExistingReceipts = async (admissionNumber) => {
    try {
      console.log('🔍 Fetching existing receipts for:', admissionNumber)
      const receipts = await receiptManagementApi.getById(
        'fees-collection/student',
        admissionNumber,
      )
      setExistingReceipts(receipts || [])

      if (receipts && receipts.length > 0) {
        setSuccess(`Found ${receipts.length} existing receipt(s) for this student`)
        console.log('✅ Found existing receipts:', receipts)

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

  const getVisibleTerms = (selectedTermId, allTerms, receipts, feeData) => {
    if (!feeData || !feeData[0]?.feeTerms) return []

    const selectedTermIdInt = parseInt(selectedTermId)
    const sortedTerms = [...allTerms].sort((a, b) => a.id - b.id)
    const applicableTerms = sortedTerms.filter((term) => term.id <= selectedTermIdInt)

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

    let cumulativeAmount = 0
    let remainingPayment = totalPaid
    const visibleTerms = []

    for (const term of applicableTerms) {
      const termId = term.id
      let termTotal = 0
      const feeTerms = feeData[0].feeTerms

      for (const receiptHead in feeTerms) {
        const feeAmount = feeTerms[receiptHead][termId] || 0
        if (feeAmount > 0) {
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

      if (remainingPayment < cumulativeAmount) {
        visibleTerms.push(term)
      }
    }

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

          const amountBeingPaid = amountAfterConcession - currentBalance

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
        }
      }

      newTableData = [...newTableData, ...termItems]
    })

    setTableData(newTableData)
    calculateGrandTotal(newTableData)
    setCustomGrandTotal('')
  }

  const saveFeeReceipt = async () => {
    try {
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

      const receiptData = {
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

        totalFeeAmount: tableData.reduce((sum, item) => sum + parseFloat(item.fees || 0), 0),
        totalConcessionAmount: totalConcession,
        totalPaidAmount: parseFloat(customGrandTotal || grandTotal),
        totalBalanceAmount: totalBalance,
      }

      console.log('💾 Saving receipt data:', receiptData)

      const response = await receiptManagementApi.create('fees-collection/create', receiptData)

      console.log('✅ Receipt saved successfully:', response)

      if (response.pdfUrl) {
        window.open(response.pdfUrl, '_blank')
      } else {
        setSuccess(`Receipt ${response.receiptNumber} created successfully!`)
      }

      resetTermAndTableData()
      await fetchExistingReceipts(studentId)
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

  useEffect(() => {
    if (studentId && formData.sessionId) {
      searchStudentFeeByAdmissionNumber()
    }
  }, [studentId, formData.sessionId])

  const handleTermSelect = (selectedTermId) => {
    if (!feeData || !feeData[0]?.feeTerms) return

    setFormData((prev) => ({ ...prev, termId: selectedTermId }))
    updateTableDataWithReceipts(existingReceipts, selectedTermId)
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

  const searchStudentFeeByAdmissionNumber = async () => {
    setLoading(true)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', {
        admissionNumber: studentId,
        sessionId: formData.sessionId,
      })
      setFeeData(students)
      console.log(students)
      setFeeDataLoaded(true)

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

  const showReferenceFields = formData.paymentMode && formData.paymentMode !== 'Cash'

  const getPaymentSummary = () => {
    if (tableData.length === 0) return null

    const totalDueAfterConcessions = tableData.reduce((sum, row) => {
      const feeAmount = parseFloat(row.fees || 0)
      const concessionAmount = parseFloat(row.concAmount || 0)
      return sum + (feeAmount - concessionAmount)
    }, 0)

    const totalActuallyPaid = tableData.reduce((sum, row) => {
      return sum + parseFloat(row.totalPreviousPaid || 0)
    }, 0)

    const remainingDue = Math.max(0, totalDueAfterConcessions - totalActuallyPaid)

    return {
      totalDue: totalDueAfterConcessions,
      actuallyPaid: totalActuallyPaid,
      remainingDue: remainingDue,
      isFullyPaid: totalActuallyPaid >= totalDueAfterConcessions && totalDueAfterConcessions > 0,
    }
  }

  // NEW: Function to get status badges for better visual feedback
  const getStudentStatusBadges = () => {
    const badges = []

    if (existingReceipts.length > 0) {
      badges.push(
        <CBadge key="receipts" color="info" className="me-1">
          {existingReceipts.length} Receipt(s)
        </CBadge>,
      )
    }

    if (Object.keys(existingConcessions).length > 0) {
      badges.push(
        <CBadge key="concessions" color="success" className="me-1">
          Concessions Available
        </CBadge>,
      )
    }

    if (tableData.length > 0) {
      const paymentSummary = getPaymentSummary()
      if (paymentSummary?.isFullyPaid) {
        badges.push(
          <CBadge key="paid" color="success" className="me-1">
            Fully Paid
          </CBadge>,
        )
      } else if (paymentSummary?.remainingDue > 0) {
        badges.push(
          <CBadge key="due" color="warning" className="me-1">
            ₹{paymentSummary.remainingDue.toFixed(2)} Due
          </CBadge>,
        )
      }
    }

    return badges
  }

  const calculateActualPaymentStatus = () => {
    if (tableData.length === 0) return false

    const totalDueAfterConcessions = tableData.reduce((sum, row) => {
      const feeAmount = parseFloat(row.fees || 0)
      const concessionAmount = parseFloat(row.concAmount || 0)
      return sum + (feeAmount - concessionAmount)
    }, 0)

    const totalActuallyPaid = tableData.reduce((sum, row) => {
      return sum + parseFloat(row.totalPreviousPaid || 0)
    }, 0)

    return totalActuallyPaid >= totalDueAfterConcessions && totalDueAfterConcessions > 0
  }

  const isAllFeesPaid = calculateActualPaymentStatus()
  const paymentSummary = getPaymentSummary()

  return (
    <CContainer fluid className="px-3">
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

      {/* Main Accordion Layout */}
      <CAccordion activeItemKey={activeAccordionItems} alwaysOpen className="shadow-sm">
        {/* Student Search & Info Section */}
        <CAccordionItem itemKey="student-search">
          <CAccordionHeader>
            <div className="d-flex align-items-center justify-content-between w-100 me-3">
              <strong>Student Information</strong>
              <div className="d-flex align-items-center">
                {getStudentStatusBadges()}
                {studentExtraInfo.studentName && (
                  <span className="text-muted small ms-2">
                    {studentExtraInfo.studentName} ({studentExtraInfo.className})
                  </span>
                )}
              </div>
            </div>
          </CAccordionHeader>
          <CAccordionBody className="pb-2">
            <CRow className="g-2">
              {/* Student Search */}
              <CCol md={6}>
                <div className="position-relative" ref={dropdownRef}>
                  <CFormInput
                    size="sm"
                    placeholder={
                      sessionLoading ? 'Loading...' : 'Enter or Search Admission Number *'
                    }
                    value={studentId}
                    onChange={(e) => handleLiveSearch(e.target.value)}
                    autoComplete="off"
                    disabled={sessionLoading}
                  />
                  {(loading || concessionLoading || sessionLoading) && (
                    <CSpinner
                      color="primary"
                      size="sm"
                      style={{ position: 'absolute', right: '10px', top: '8px' }}
                    />
                  )}

                  {/* Compact Dropdown Results */}
                  {showDropdown && (
                    <div
                      className="position-absolute w-100 bg-dark border rounded-bottom shadow-lg"
                      style={{ zIndex: 1050, maxHeight: '150px', overflowY: 'auto' }}
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
                          onMouseLeave={(e) => (e.target.style.backgroundColor = '#666666')}
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

              {/* Quick Actions */}
              <CCol md={4} className="text-end">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={() => setShowReceiptHistory(!showReceiptHistory)}
                  disabled={!existingReceipts.length}
                  className="me-1"
                >
                  History ({existingReceipts.length})
                </CButton>
                <CButton size="sm" color="outline-primary" onClick={handleReset}>
                  Reset
                </CButton>
              </CCol>
            </CRow>

            {/* Student Info Display - Compact */}
            {studentExtraInfo.studentName && (
              <CRow className="mt-2 p-2 bg-dark rounded">
                <CCol sm={3} className="small">
                  <strong>{studentExtraInfo.studentName}</strong>
                </CCol>
                <CCol sm={3} className="small text-muted">
                  Class: {studentExtraInfo.className}
                </CCol>
                <CCol sm={3} className="small text-muted">
                  Group: {studentExtraInfo.groupName || 'N/A'}
                </CCol>
                <CCol sm={3} className="small text-muted">
                  Section: {studentExtraInfo.section}
                </CCol>
              </CRow>
            )}

            {/* Receipt History - Compact Table */}
            <CCollapse visible={showReceiptHistory}>
              <div className="mt-2 p-2 border rounded bg-dark">
                <strong className="small">Previous Receipts:</strong>
                <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                  <CTable size="sm" className="mb-0 mt-1">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell className="py-1 small">Receipt#</CTableHeaderCell>
                        <CTableHeaderCell className="py-1 small">Date</CTableHeaderCell>
                        <CTableHeaderCell className="py-1 small">Amount</CTableHeaderCell>
                        <CTableHeaderCell className="py-1 small">Mode</CTableHeaderCell>
                        <CTableHeaderCell className="py-1 small">Action</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {existingReceipts.map((receipt, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell className="py-1 small">
                            {receipt.receiptNumber}
                          </CTableDataCell>
                          <CTableDataCell className="py-1 small">
                            {new Date(receipt.receiptDate).toLocaleDateString()}
                          </CTableDataCell>
                          <CTableDataCell className="py-1 small">
                            ₹{receipt.totalAmountPaid?.toFixed(2) || '0.00'}
                          </CTableDataCell>
                          <CTableDataCell className="py-1 small">
                            {receipt.paymentMode}
                          </CTableDataCell>
                          <CTableDataCell className="py-1">
                            <CButton
                              size="sm"
                              color="outline-primary"
                              onClick={() => window.open(receipt.pdfUrl, '_blank')}
                              className="py-0 px-1 small"
                            >
                              PDF
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </div>
            </CCollapse>
          </CAccordionBody>
        </CAccordionItem>

        {/* Receipt Form Section - Compact Grid */}
        <CAccordionItem itemKey="receipt-form">
          <CAccordionHeader>
            <strong>Receipt Details</strong>
            {formData.paymentMode && (
              <CBadge color="primary" className="ms-2">
                {formData.paymentMode}
              </CBadge>
            )}
          </CAccordionHeader>
          <CAccordionBody className="py-2">
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
                  <label className="small text-muted">Date *</label>
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
                  <label className="small text-muted">Received By *</label>
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
                  <label className="small text-muted">Pay Mode *</label>
                </CCol>
                <CCol md={2}>
                  <CFormInput
                    size="sm"
                    type="text"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Remarks"
                  />
                  <label className="small text-muted">Remarks</label>
                </CCol>
              </CRow>

              {/* Reference Fields - Show only when needed */}
              {showReferenceFields && (
                <CRow className="g-2 mb-2 p-2 bg-light rounded">
                  <CCol md={3}>
                    <CFormInput
                      size="sm"
                      type="date"
                      name="referenceDate"
                      value={formData.referenceDate}
                      onChange={handleChange}
                    />
                    <label className="small text-muted">Reference Date</label>
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
                    <label className="small text-muted">Reference Number</label>
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
                    <label className="small text-muted">Drawn On</label>
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
                    <label className="small text-muted">Advance Deduct</label>
                  </CCol>
                </CRow>
              )}
            </CForm>
          </CAccordionBody>
        </CAccordionItem>

        {/* Fee Details Section - Expandable Table */}
        {tableData.length > 0 && (
          <CAccordionItem itemKey="fee-details">
            <CAccordionHeader>
              <div className="d-flex justify-content-between w-100 me-3">
                <strong>Fee Details & Payment</strong>
                <div className="d-flex align-items-center">
                  {paymentSummary && (
                    <>
                      <CBadge color="info" className="me-1">
                        Total: ₹{paymentSummary.totalDue.toFixed(2)}
                      </CBadge>
                      <CBadge color="success" className="me-1">
                        Paid: ₹{paymentSummary.actuallyPaid.toFixed(2)}
                      </CBadge>
                      <CBadge color="warning">
                        Due: ₹{paymentSummary.remainingDue.toFixed(2)}
                      </CBadge>
                    </>
                  )}
                </div>
              </div>
            </CAccordionHeader>
            <CAccordionBody className="p-2">
              {/* Compact Fee Table */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <CTable bordered hover responsive size="sm" className="mb-2">
                  <CTableHead className="table-dark">
                    <CTableRow>
                      <CTableHeaderCell className="small py-1">Term</CTableHeaderCell>
                      <CTableHeaderCell className="small py-1">Head</CTableHeaderCell>
                      <CTableHeaderCell className="small py-1">Fees</CTableHeaderCell>
                      <CTableHeaderCell className="small py-1">Conc%</CTableHeaderCell>
                      <CTableHeaderCell className="small py-1">Conc₹</CTableHeaderCell>
                      <CTableHeaderCell className="small py-1">Amount</CTableHeaderCell>
                      <CTableHeaderCell className="small py-1">Balance</CTableHeaderCell>
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
                              {rowIndex === 0 ? (
                                <CTableDataCell
                                  rowSpan={termGroup.rows.length}
                                  className="small fw-bold"
                                >
                                  {row.term}
                                </CTableDataCell>
                              ) : null}
                              <CTableDataCell className="small">{row.receiptHead}</CTableDataCell>
                              <CTableDataCell className="small">₹{row.fees}</CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="number"
                                  size="sm"
                                  value={row.concPercent || ''}
                                  onChange={(e) =>
                                    handleConcPercentChange(tableIndex, e.target.value)
                                  }
                                  style={{ width: '60px' }}
                                  min="0"
                                  max="100"
                                />
                              </CTableDataCell>
                              <CTableDataCell className="small">
                                ₹{(row.concAmount || 0).toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="number"
                                  size="sm"
                                  value={row.amount}
                                  onChange={(e) => handleAmountChange(tableIndex, e.target.value)}
                                  style={{ width: '80px' }}
                                  min="0"
                                />
                              </CTableDataCell>
                              <CTableDataCell className="small">{row.balance}</CTableDataCell>
                            </CTableRow>
                          )
                        })}
                        {/* Term Subtotal */}
                        <CTableRow className="table-dark">
                          <CTableHeaderCell colSpan="5" className="small">
                            {termGroup.termName} Total
                          </CTableHeaderCell>
                          <CTableHeaderCell className="small fw-bold">
                            ₹{termGroup.termTotal.toFixed(2)}
                          </CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                        </CTableRow>
                      </React.Fragment>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Grand Total & Custom Amount - Sticky Bottom */}
              <div className="bg-dark border-top pt-2 sticky-bottom">
                <CRow className="align-items-center">
                  <CCol md={6}>
                    <div className="d-flex align-items-center">
                      <strong className="me-3">Grand Total:</strong>
                      <CFormInput
                        type="number"
                        value={customGrandTotal || grandTotal}
                        onChange={(e) => handleCustomGrandTotalChange(e.target.value)}
                        style={{ width: '120px' }}
                        size="sm"
                        disabled={isAllFeesPaid}
                        className="me-2"
                      />
                      <small className="text-muted">
                        Balance: {totalBalance > 0 ? `₹${totalBalance.toFixed(2)} Dr` : '₹0'}
                      </small>
                    </div>
                  </CCol>

                  <CCol md={6} className="text-end">
                    <CButton
                      color="success"
                      size="sm"
                      onClick={saveFeeReceipt}
                      disabled={
                        saveLoading ||
                        loading ||
                        !formData.paymentMode ||
                        !formData.termId ||
                        isAllFeesPaid
                      }
                      className="me-2"
                    >
                      {saveLoading && <CSpinner size="sm" className="me-1" />}
                      {saveLoading ? 'Saving...' : 'Save Receipt'}
                    </CButton>
                    <CButton color="outline-secondary" size="sm" onClick={resetAllData}>
                      Reset All
                    </CButton>
                  </CCol>
                </CRow>

                {/* Payment Status Alert */}
                {isAllFeesPaid && (
                  <CAlert color="info" className="mt-2 mb-0 py-2">
                    ✅ All fees for this term have been paid through previous receipts.
                  </CAlert>
                )}
              </div>
            </CAccordionBody>
          </CAccordionItem>
        )}
      </CAccordion>

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
