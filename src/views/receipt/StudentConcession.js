import React, { useEffect, useState, useRef } from 'react'
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
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
} from '@coreui/react'
import schoolManagementApi from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'
import concessionApi from '../../api/receiptManagementApi'

const StudentConcession = () => {
  const [studentData, setStudentData] = useState({
    name: '',
    className: '',
    sectionName: '',
    groupName: '',
    fatherName: '',
  })
  const [concessions, setConcessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [feeLoading, setFeeLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [studentId, setStudentId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [term, setTerm] = useState([])

  // Fee structure from class/group (base fees)
  const [students, setStudents] = useState([])
  const [baseFeeStructure, setBaseFeeStructure] = useState({})

  // Concession states
  const [concessionRefNo, setConcessionRefNo] = useState('')
  const [conHead, setConHead] = useState('')
  const [existingConcessionId, setExistingConcessionId] = useState(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Fee calculations with concessions applied
  const [feeCalculations, setFeeCalculations] = useState({})
  const [pendingConcessions, setPendingConcessions] = useState(null)

  // NEW: Cache and optimization states (from first component)
  const [searchCache, setSearchCache] = useState(new Map())
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [abortController, setAbortController] = useState(null)

  const [feeFormData, setFeeFormData] = useState({
    classId: null,
    groupId: null,
    admissionNumber: null,
  })

  // NEW: Refs and constants for optimization
  const dropdownRef = useRef(null)
  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  // NEW: Cache utility functions
  const getCacheKey = (query) => {
    return query.toLowerCase()
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

  useEffect(() => {
    fetchInitialData()

    // NEW: Close dropdown when clicking outside
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

  // 🔥 NEW: Watch for base fee structure changes and apply pending concessions
  useEffect(() => {
    if (Object.keys(baseFeeStructure).length > 0 && pendingConcessions) {
      console.log('🔥 BaseFeeStructure updated! Applying pending concessions...')
      setTimeout(() => {
        applyExistingConcessionsToStructure(baseFeeStructure, pendingConcessions)
        setPendingConcessions(null)
      }, 100)
    }
  }, [baseFeeStructure, pendingConcessions])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [termData, concessionData] = await Promise.all([
        schoolManagementApi.getAll('term/all'),
        schoolManagementApi.getAll('concession/all'),
      ])
      setTerm(termData)
      setConcessions(concessionData)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to fetch initial data')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (selectedStudent) => {
    setStudentId(selectedStudent.admissionNumber)
    setStudentData({
      name: selectedStudent.name || '',
      className: selectedStudent.className || '',
      sectionName: selectedStudent.sectionName || '',
      groupName: selectedStudent.groupName || '',
      fatherName: selectedStudent.fatherName || '',
    })
    setShowDropdown(false)
    setSearchResults([])
    setError(null)
    setSuccess(null)

    const updatedFormData = {
      ...feeFormData,
      admissionNumber: selectedStudent.admissionNumber,
      classId: null,
      groupId: null,
    }

    // First fetch the fee structure, then fetch existing concessions
    try {
      await searchStudentFeeByAdmissionNumber(updatedFormData)
      // After fee structure is loaded, fetch existing concessions
      await fetchExistingConcessionData(selectedStudent.admissionNumber)
    } catch (error) {
      console.error('Error in handleSelect:', error)
      setError('Failed to load student data')
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
      setDebounceTimeout(null)
    }
  }

  // NEW: Enhanced live search with caching and optimization
  const handleLiveSearch = async (value) => {
    setStudentId(value)

    // Clear results if input is empty
    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSearchLoading(false)
      resetAllData()
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

    const cacheKey = getCacheKey(value.trim())

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
        setSearchLoading(true)

        // Create new AbortController for this request
        const newAbortController = new AbortController()
        setAbortController(newAbortController)

        console.log('🌐 Making API call for:', value.trim())

        // Make API call with abort signal
        const response = await studentManagementApi.getById('search', value.trim(), {
          signal: newAbortController.signal,
        })

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
        setSearchLoading(false)
        setAbortController(null)
      }
    }, DEBOUNCE_DELAY)

    setDebounceTimeout(timeout)
  }

  // NEW: Reset button handler
  const handleReset = () => {
    setStudentId('')
    resetAllData()
    setSearchResults([])
    setShowDropdown(false)
  }

  // Fetch the base fee structure for the student's class/group
  const searchStudentFeeByAdmissionNumber = async (updatedFormData) => {
    setFeeLoading(true)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', updatedFormData)
      setStudents(students)

      if (students?.length > 0 && students[0]?.feeTerms) {
        const student = students[0]
        console.log('📊 Setting base fee structure:', student.feeTerms)
        setBaseFeeStructure(student.feeTerms)

        // Initialize fee calculations with base structure
        initializeBaseFeeCalculations(student.feeTerms)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setError('Failed to fetch student fee data')
    } finally {
      setFeeLoading(false)
    }
  }

  // Fetch existing concession data for the student
  const fetchExistingConcessionData = async (admissionNumber) => {
    try {
      console.log('🔍 Fetching existing concession for admission number:', admissionNumber)

      // 🔥 FIXED: Use the correct API endpoint
      const response = await concessionApi.getById('student-concession/details', admissionNumber)

      console.log('📥 Existing concession response:', response)

      if (response && response.id) {
        // Existing concession found - populate the form
        setExistingConcessionId(response.id)
        setIsUpdateMode(true)
        setConHead(response.concessionHeadId || '')
        setConcessionRefNo(response.concessionRefNo || '')

        console.log('✅ Found existing concession:', {
          id: response.id,
          concessionHeadId: response.concessionHeadId,
          concessionRefNo: response.concessionRefNo,
          feeCalculations: response.feeCalculations,
        })

        // 🔥 IMPROVED: Always store concessions for later application via useEffect
        console.log('⏳ Storing concessions for application via useEffect')
        setPendingConcessions(response.feeCalculations)

        setSuccess('Existing concession data loaded successfully')
      } else {
        console.log('ℹ️ No existing concession data found')
        resetConcessionData()
        setPendingConcessions(null)
      }
    } catch (error) {
      console.error('❌ Error in fetchExistingConcessionData:', error)

      if (error.response) {
        console.log('Error response status:', error.response.status)
        console.log('Error response data:', error.response.data)

        if (error.response.status === 404) {
          resetConcessionData()
          setPendingConcessions(null)
          console.log('ℹ️ No existing concession found for student:', admissionNumber)
        } else {
          setError('Failed to fetch existing concession data')
        }
      } else {
        console.error('Network or other error:', error.message)
        resetConcessionData()
        setPendingConcessions(null)
        setError('Failed to connect to server')
      }
    }
  }

  // Initialize fee calculations with base fee structure (no concessions)
  const initializeBaseFeeCalculations = (feeTerms) => {
    console.log('🔧 Initializing base fee calculations with:', feeTerms)
    const calculations = {}

    Object.keys(feeTerms).forEach((receiptHead) => {
      calculations[receiptHead] = {}
      Object.keys(feeTerms[receiptHead]).forEach((termId) => {
        const fee = feeTerms[receiptHead][termId]
        calculations[receiptHead][termId] = {
          fee,
          concPercent: 0,
          concAmount: 0,
          balance: fee,
          selectedConcession: '',
          remarks: '',
          detailId: null,
        }
      })
    })

    console.log('📋 Initialized calculations:', calculations)
    setFeeCalculations(calculations)
  }

  // Apply existing concessions to a specific fee structure
  const applyExistingConcessionsToStructure = (feeStructure, existingConcessions) => {
    console.log('🔧 === APPLYING CONCESSIONS TO STRUCTURE ===')
    console.log('📊 Fee structure:', feeStructure)
    console.log('📊 Existing concessions:', existingConcessions)

    const calculations = {}

    // Start with base fee structure
    Object.keys(feeStructure).forEach((receiptHead) => {
      calculations[receiptHead] = {}
      Object.keys(feeStructure[receiptHead]).forEach((termId) => {
        const fee = feeStructure[receiptHead][termId]

        // Check if there's an existing concession for this receipt head and term
        const existingConcession = existingConcessions[receiptHead]?.[termId]

        if (existingConcession) {
          console.log(
            `✅ Applying concession for ${receiptHead} term ${termId}:`,
            existingConcession,
          )

          // Always recalculate balance based on current fee and saved percentage/amount
          let calculatedBalance = fee
          let concAmount = 0

          // If percentage concession exists, calculate balance based on percentage
          if (existingConcession.concPercent && existingConcession.concPercent > 0) {
            concAmount = (fee * existingConcession.concPercent) / 100
            calculatedBalance = fee - concAmount

            calculations[receiptHead][termId] = {
              fee,
              concPercent: Number(existingConcession.concPercent),
              concAmount: 0, // Reset amount when percentage is used
              balance: Number(calculatedBalance.toFixed(2)),
              selectedConcession: existingConcession.selectedConcession || '',
              remarks: existingConcession.remarks || '',
              detailId: existingConcession.id,
            }
          }
          // If amount concession exists, calculate balance based on amount
          else if (existingConcession.concAmount && existingConcession.concAmount > 0) {
            concAmount = existingConcession.concAmount
            calculatedBalance = fee - concAmount

            calculations[receiptHead][termId] = {
              fee,
              concPercent: 0, // Reset percentage when amount is used
              concAmount: Number(existingConcession.concAmount),
              balance: Number(calculatedBalance.toFixed(2)),
              selectedConcession: existingConcession.selectedConcession || '',
              remarks: existingConcession.remarks || '',
              detailId: existingConcession.id,
            }
          }
          // No concession amount or percentage, but other data exists
          else {
            calculations[receiptHead][termId] = {
              fee,
              concPercent: 0,
              concAmount: 0,
              balance: fee,
              selectedConcession: existingConcession.selectedConcession || '',
              remarks: existingConcession.remarks || '',
              detailId: existingConcession.id,
            }
          }
        } else {
          // No existing concession - use base values
          calculations[receiptHead][termId] = {
            fee,
            concPercent: 0,
            concAmount: 0,
            balance: fee,
            selectedConcession: '',
            remarks: '',
            detailId: null,
          }
        }
      })
    })

    console.log('🎯 === FINAL CALCULATIONS ===')
    console.log('📋 Final calculations after applying concessions:', calculations)

    // Update the state
    setFeeCalculations(calculations)

    // Force re-renders to ensure UI updates
    setTimeout(() => {
      console.log('🔄 Force re-render 1 - spread operator...')
      setFeeCalculations((prev) => ({ ...prev }))
    }, 50)

    setTimeout(() => {
      console.log('🔄 Force re-render 2 - JSON parse/stringify...')
      setFeeCalculations((prev) => JSON.parse(JSON.stringify(prev)))
    }, 150)
  }

  const resetConcessionData = () => {
    setExistingConcessionId(null)
    setIsUpdateMode(false)
    setConHead('')
    setConcessionRefNo('')
    setPendingConcessions(null)
    // Keep the base fee structure but reset concessions
    if (Object.keys(baseFeeStructure).length > 0) {
      initializeBaseFeeCalculations(baseFeeStructure)
    }
  }

  const resetAllData = () => {
    setStudentId('')
    setStudentData({
      name: '',
      className: '',
      sectionName: '',
      groupName: '',
      fatherName: '',
    })
    setStudents([])
    setBaseFeeStructure({})
    setFeeCalculations({})
    setPendingConcessions(null)
    setConHead('')
    setConcessionRefNo('')
    setError(null)
    setSuccess(null)
    resetConcessionData()

    // Clear search-related state
    setLastSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)
  }

  const getTermName = (termId) => {
    const termObj = term.find((t) => t.id === parseInt(termId))
    return termObj ? termObj.name : `Term ${termId}`
  }

  const getAllTerms = () => {
    if (Object.keys(baseFeeStructure).length === 0) return []

    const termSet = new Set()
    Object.keys(baseFeeStructure).forEach((receiptHead) => {
      Object.keys(baseFeeStructure[receiptHead]).forEach((termId) => {
        termSet.add(termId)
      })
    })

    return Array.from(termSet).sort((a, b) => parseInt(a) - parseInt(b))
  }

  const getAllReceiptHeads = () => {
    return Object.keys(baseFeeStructure)
  }

  // UPDATED: Enhanced concession percentage change with mutual exclusivity
  const handleConcPercentChange = (receiptHead, termId, value) => {
    const percent = parseFloat(value) || 0
    const fee = baseFeeStructure[receiptHead]?.[termId] || 0

    if (percent > 100) {
      setError('Concession percentage cannot exceed 100%!')
      return
    }

    const concAmount = (fee * percent) / 100

    if (concAmount > fee) {
      setError(
        `Concession cannot exceed the fee amount of ₹${fee}. Please enter a lower percentage.`,
      )
      return
    }

    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          fee,
          concPercent: percent,
          concAmount: 0, // NEW: Clear amount when percentage is set
          balance: fee - concAmount,
        },
      },
    }))
    setError(null)
  }

  // UPDATED: Enhanced concession amount change with mutual exclusivity
  const handleConcAmountChange = (receiptHead, termId, value) => {
    const amount = parseFloat(value) || 0
    const fee = baseFeeStructure[receiptHead]?.[termId] || 0

    if (amount > fee) {
      setError(
        `Concession amount cannot exceed the fee amount of ₹${fee}. Please enter a lower value.`,
      )
      return
    }

    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          fee,
          concPercent: 0, // NEW: Clear percentage when amount is set
          concAmount: amount,
          balance: fee - amount,
        },
      },
    }))
    setError(null)
  }

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

  const handleRemarksChange = (receiptHead, termId, value) => {
    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          remarks: value,
        },
      },
    }))
  }

  const calculateTermTotals = (termId) => {
    let totalFees = 0
    let totalConcession = 0
    let totalBalance = 0

    getAllReceiptHeads().forEach((receiptHead) => {
      const fee = baseFeeStructure[receiptHead]?.[termId] || 0

      if (fee > 0) {
        totalFees += fee

        const calcData = feeCalculations[receiptHead]?.[termId]
        if (calcData) {
          if (calcData.concPercent > 0) {
            totalConcession += (fee * calcData.concPercent) / 100
          } else {
            totalConcession += calcData.concAmount || 0
          }
          totalBalance += calcData.balance || 0
        } else {
          totalBalance += fee
        }
      }
    })

    return {
      totalFees: Math.round(totalFees * 100) / 100,
      totalConcession: Math.round(totalConcession * 100) / 100,
      totalBalance: Math.round(totalBalance * 100) / 100,
    }
  }

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

    return {
      grandTotalFees: Math.round(grandTotalFees * 100) / 100,
      grandTotalConcession: Math.round(grandTotalConcession * 100) / 100,
      grandTotalBalance: Math.round(grandTotalBalance * 100) / 100,
    }
  }

  const renderTermTable = (termId) => {
    const receiptHeads = getAllReceiptHeads()
    const termName = getTermName(termId)

    const visibleReceiptHeads = receiptHeads
      .map((receiptHead) => ({
        receiptHead,
        fee: baseFeeStructure[receiptHead]?.[termId] || 0,
      }))
      .filter((item) => item.fee > 0)

    if (visibleReceiptHeads.length === 0) {
      return null
    }

    const termTotals = calculateTermTotals(termId)
    const rowItems = []

    visibleReceiptHeads.forEach((item, index) => {
      const { receiptHead, fee } = item

      const calcData = feeCalculations[receiptHead]?.[termId] || {
        fee,
        concPercent: 0,
        concAmount: 0,
        balance: fee,
        selectedConcession: '',
        remarks: '',
        detailId: null,
      }

      // Calculate displayed concession amount
      let displayedConcAmount = 0
      if (calcData.concPercent > 0) {
        displayedConcAmount = (fee * calcData.concPercent) / 100
      } else {
        displayedConcAmount = calcData.concAmount || 0
      }

      // Debug log for each row render
      console.log(`🔍 Rendering ${receiptHead} term ${termId}:`, calcData)

      rowItems.push(
        <CTableRow key={`${termId}-${receiptHead}`}>
          {index === 0 && (
            <CTableDataCell
              rowSpan={visibleReceiptHeads.length + 1}
              style={{ verticalAlign: 'middle', fontWeight: 'bold' }}
            >
              {termName}
            </CTableDataCell>
          )}
          <CTableDataCell>{receiptHead}</CTableDataCell>
          <CTableDataCell>₹{fee}</CTableDataCell>
          <CTableDataCell>
            <CFormInput
              type="number"
              value={calcData.concPercent || ''}
              onChange={(e) => handleConcPercentChange(receiptHead, termId, e.target.value)}
              min="0"
              max="100"
              step="0.01"
              placeholder="0"
              size="sm"
            />
          </CTableDataCell>
          <CTableDataCell>
            <CFormInput
              type="number"
              value={displayedConcAmount || ''}
              onChange={(e) => handleConcAmountChange(receiptHead, termId, e.target.value)}
              min="0"
              max={fee}
              step="0.01"
              placeholder="0"
              size="sm"
            />
          </CTableDataCell>
          <CTableDataCell>₹0</CTableDataCell>
          <CTableDataCell>₹{calcData.balance}</CTableDataCell>
          <CTableDataCell>
            <CFormSelect
              value={calcData.selectedConcession || ''}
              onChange={(e) => handleConcessionTypeChange(receiptHead, termId, e.target.value)}
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
              type="text"
              placeholder="Remarks"
              value={calcData.remarks || ''}
              onChange={(e) => handleRemarksChange(receiptHead, termId, e.target.value)}
              size="sm"
            />
          </CTableDataCell>
        </CTableRow>,
      )
    })

    if (visibleReceiptHeads.length > 0) {
      rowItems.push(
        <CTableRow
          key={`${termId}-total`}
          style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
        >
          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
            TOTAL
          </CTableDataCell>
          <CTableDataCell style={{ fontWeight: 'bold' }}>₹{termTotals.totalFees}</CTableDataCell>
          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
            ₹{termTotals.totalConcession}
          </CTableDataCell>
          <CTableDataCell style={{ fontWeight: 'bold' }}>₹0</CTableDataCell>
          <CTableDataCell style={{ fontWeight: 'bold' }}>₹{termTotals.totalBalance}</CTableDataCell>
          <CTableDataCell colSpan={2}></CTableDataCell>
        </CTableRow>,
      )
    }

    return rowItems
  }

  // UPDATED: Enhanced submit handler with concession head validation
  const handleSubmit = async () => {
    if (!studentId) {
      setError('Please select a student')
      return
    }

    // NEW: Check if concession head is selected
    if (!conHead) {
      setError('Please select concession head from dropdown')
      return
    }

    setSubmitLoading(true)
    setError(null)

    try {
      const grandTotals = calculateGrandTotals()

      // Filter fee calculations to only include entries with actual concessions
      const filteredFeeCalculations = {}
      Object.keys(feeCalculations).forEach((receiptHead) => {
        Object.keys(feeCalculations[receiptHead]).forEach((termId) => {
          const calc = feeCalculations[receiptHead][termId]
          if (
            (calc.concPercent && calc.concPercent > 0) ||
            (calc.concAmount && calc.concAmount > 0)
          ) {
            if (!filteredFeeCalculations[receiptHead]) {
              filteredFeeCalculations[receiptHead] = {}
            }
            filteredFeeCalculations[receiptHead][termId] = calc
          }
        })
      })

      const requestData = {
        admissionNumber: studentId,
        concessionHeadId: parseInt(conHead),
        concessionRefNo,
        feeCalculations: filteredFeeCalculations,
        totalFees: grandTotals.grandTotalFees,
        totalConcession: grandTotals.grandTotalConcession,
        totalBalance: grandTotals.grandTotalBalance,
      }

      let response
      console.log('📤 Request Data:', requestData)

      if (isUpdateMode && existingConcessionId) {
        response = await concessionApi.update(
          'student-concession/update',
          existingConcessionId,
          requestData,
        )
        setSuccess('Student concession updated successfully!')
      } else {
        response = await concessionApi.create('student-concession/add', requestData)
        setSuccess('Student concession created successfully!')
        setExistingConcessionId(response.id)
        setIsUpdateMode(true)
      }
    } catch (error) {
      console.error('Error saving concession:', error)
      setError('Failed to save concession data. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancel = () => {
    resetAllData()
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Concession Management</strong>
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
              {/* NEW: Combined Student Search and Info Card (matching first component UI) */}
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
                      {searchLoading && (
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

                  {/* Student Info - Display as text (matching first component style) */}
                  {studentData.name && (
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
                                <div className="fw-medium">{studentData.name}</div>
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Class:</small>
                                <div className="fw-medium">{studentData.className}</div>
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Father Name:</small>
                                <div className="fw-medium">{studentData.fatherName || 'N/A'}</div>
                              </div>
                            </CCol>
                            <CCol md={3}>
                              <div>
                                <small className="text-muted fw-bold">Section:</small>
                                <div className="fw-medium">{studentData.sectionName}</div>
                              </div>
                            </CCol>
                          </CRow>
                        </div>
                      </CCol>
                    </CRow>
                  )}
                </CCardBody>
              </CCard>

              {/* Concession Details Form */}
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>
                    Concession Head <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect value={conHead} onChange={(e) => setConHead(e.target.value)}>
                    <option value="">Select Concession Head</option>
                    {concessions.map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Concession Ref. No.</CFormLabel>
                  <CFormInput
                    value={concessionRefNo}
                    onChange={(e) => setConcessionRefNo(e.target.value)}
                    placeholder="Enter reference number"
                  />
                </CCol>
              </CRow>

              {feeLoading && (
                <div className="text-center mb-3">
                  <CSpinner color="primary" />
                  <p className="mt-2">Loading fee data...</p>
                </div>
              )}

              {Object.keys(baseFeeStructure).length > 0 && !feeLoading && (
                <CRow className="mb-3">
                  <CCol xs={12}>
                    <CTable bordered responsive striped>
                      <CTableHead>
                        <CTableRow style={{ backgroundColor: '#e9ecef' }}>
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

                        <CTableRow style={{ backgroundColor: '#dee2e6', fontWeight: 'bold' }}>
                          <CTableDataCell
                            colSpan={2}
                            style={{ fontWeight: 'bold', fontSize: '1.1em' }}
                          >
                            GRAND TOTAL
                          </CTableDataCell>
                          <CTableDataCell style={{ fontWeight: 'bold' }}>
                            ₹{calculateGrandTotals().grandTotalFees}
                          </CTableDataCell>
                          <CTableDataCell colSpan={2} style={{ fontWeight: 'bold' }}>
                            ₹{calculateGrandTotals().grandTotalConcession}
                          </CTableDataCell>
                          <CTableDataCell style={{ fontWeight: 'bold' }}>₹0</CTableDataCell>
                          <CTableDataCell style={{ fontWeight: 'bold' }}>
                            ₹{calculateGrandTotals().grandTotalBalance}
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
                  <CButton
                    color="primary"
                    onClick={handleSubmit}
                    disabled={feeLoading || submitLoading}
                  >
                    {submitLoading && <CSpinner size="sm" className="me-2" />}
                    {isUpdateMode ? 'Update Concession' : 'Save Concession'}
                  </CButton>
                  <CButton color="secondary" className="ms-2" onClick={handleCancel}>
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
