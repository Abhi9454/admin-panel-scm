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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CBadge,
  CContainer,
  CButtonGroup,
  CProgress,
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
  const [concessions, setConcessions] = useState([])

  // Fee structure states
  const [feeStructureData, setFeeStructureData] = useState(null)
  const [baseFeeStructure, setBaseFeeStructure] = useState({})
  const [feeStructureValid, setFeeStructureValid] = useState(false)

  // UI state management
  const [viewMode, setViewMode] = useState('view') // 'view' or 'edit'
  const [showConcessionForm, setShowConcessionForm] = useState(false)

  // Concession states
  const [concessionRefNo, setConcessionRefNo] = useState('')
  const [existingConcessionId, setExistingConcessionId] = useState(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // Fee calculations with concessions applied
  const [feeCalculations, setFeeCalculations] = useState({})
  const [pendingConcessions, setPendingConcessions] = useState(null)

  // Cache and optimization states
  const [searchCache, setSearchCache] = useState(new Map())
  const [lastSearchQuery, setLastSearchQuery] = useState('')
  const [abortController, setAbortController] = useState(null)

  const [sessions, setSessions] = useState([])
  const [defaultSession, setDefaultSession] = useState('')
  const [formData, setFormData] = useState({
    sessionId: '',
  })

  // Refs and constants for optimization
  const dropdownRef = useRef(null)
  const MIN_SEARCH_LENGTH = 2
  const DEBOUNCE_DELAY = 500

  // Cache utility functions
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

      if (abortController) {
        abortController.abort()
      }

      if (debounceTimeout) {
        clearTimeout(debounceTimeout)
      }
    }
  }, [])

  // Watch for base fee structure changes and apply pending concessions
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
      const [termData, sessionData, defaultSessionData, concessionData] = await Promise.all([
        schoolManagementApi.getAll('term/all'),
        schoolManagementApi.getAll('session/all'),
        schoolManagementApi.getAll('school-detail/session'),
        schoolManagementApi.getAll('concession/all'),
      ])
      setTerm(termData)
      setSessions(sessionData)
      setDefaultSession(defaultSessionData)
      setConcessions(concessionData)
      setFormData({ sessionId: defaultSessionData })
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

    try {
      await loadStudentFeeStructure(selectedStudent.admissionNumber)
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

  // Enhanced live search with caching and optimization
  const handleLiveSearch = async (value) => {
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      setSearchLoading(false)
      resetAllData()
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

    const cacheKey = getCacheKey(value.trim())

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
        setSearchLoading(true)

        const newAbortController = new AbortController()
        setAbortController(newAbortController)

        console.log('🌐 Making API call for:', value.trim())

        const response = await studentManagementApi.getById('search', value.trim(), {
          signal: newAbortController.signal,
        })

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
        setSearchLoading(false)
        setAbortController(null)
      }
    }, DEBOUNCE_DELAY)

    setDebounceTimeout(timeout)
  }

  const handleReset = () => {
    setStudentId('')
    resetAllData()
    setSearchResults([])
    setShowDropdown(false)
  }

  // Load student fee structure and initialize states
  const loadStudentFeeStructure = async (admissionNumber) => {
    setFeeLoading(true)
    try {
      const sessionIdToUse = formData.sessionId || defaultSession
      if (!sessionIdToUse) {
        setError('Session not selected')
        return
      }

      // Use the new concession API endpoint for fee structure
      const feeResponse = await concessionApi.getAll(
        `fee-structure/${admissionNumber}?sessionId=${sessionIdToUse}`,
      )

      if (feeResponse?.feeStructure && Object.keys(feeResponse.feeStructure).length > 0) {
        console.log('📊 Fee structure loaded:', feeResponse)

        // Store the complete fee structure data
        setFeeStructureData(feeResponse)
        setBaseFeeStructure(feeResponse.feeStructure)
        setFeeStructureValid(true)

        // Initialize calculations for concession editing
        initializeBaseFeeCalculations(feeResponse.feeStructure)

        // Set to view mode first
        setViewMode('view')
        setShowConcessionForm(false)

        setSuccess(
          `Fee structure loaded: ${feeResponse.totalReceiptHeads} receipt heads across ${feeResponse.totalTerms} terms (Total: ₹${feeResponse.totalFees})`,
        )
      } else {
        console.log('⚠️ No fee structure found for student')
        setError('No fee structure found for this student in the selected session')
        setFeeStructureData(null)
        setBaseFeeStructure({})
        setFeeCalculations({})
        setFeeStructureValid(false)
      }
    } catch (error) {
      console.error('Error fetching student fees:', error)
      if (error.response?.status === 404) {
        setError('No fee structure found for this student in the selected session')
      } else {
        setError('Failed to fetch student fee data')
      }
      setFeeStructureData(null)
      setBaseFeeStructure({})
      setFeeCalculations({})
      setFeeStructureValid(false)
    } finally {
      setFeeLoading(false)
    }
  }

  // Fetch existing concession data for the student
  const fetchExistingConcessionData = async (admissionNumber) => {
    try {
      console.log('🔍 Fetching existing concession for admission number:', admissionNumber)

      const response = await concessionApi.getAll(
        `concession/student/${admissionNumber}?sessionId=${formData.sessionId || defaultSession}`,
      )

      console.log('📥 Existing concession response:', response)

      if (response && response.id) {
        setExistingConcessionId(response.id)
        setIsUpdateMode(true)
        setConcessionRefNo(response.concessionRefNo || '')

        console.log('✅ Found existing concession:', {
          id: response.id,
          concessionRefNo: response.concessionRefNo,
          feeCalculations: response.feeCalculations,
        })

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
          remarks: '',
          concessionTitleId: '',
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

    Object.keys(feeStructure).forEach((receiptHead) => {
      calculations[receiptHead] = {}
      Object.keys(feeStructure[receiptHead]).forEach((termId) => {
        const fee = feeStructure[receiptHead][termId]

        const existingConcession = existingConcessions[receiptHead]?.[termId]

        if (existingConcession) {
          console.log(
            `✅ Applying concession for ${receiptHead} term ${termId}:`,
            existingConcession,
          )

          let calculatedBalance = fee
          let concAmount = 0

          if (
            existingConcession.concessionPercentage &&
            existingConcession.concessionPercentage > 0
          ) {
            concAmount = (fee * existingConcession.concessionPercentage) / 100
            calculatedBalance = fee - concAmount

            calculations[receiptHead][termId] = {
              fee,
              concPercent: Number(existingConcession.concessionPercentage),
              concAmount: 0,
              balance: Number(calculatedBalance.toFixed(2)),
              remarks: existingConcession.remarks || '',
              concessionTitleId: existingConcession.concessionTitleId || '',
              detailId: existingConcession.id,
            }
          } else if (
            existingConcession.concessionAmount &&
            existingConcession.concessionAmount > 0
          ) {
            concAmount = existingConcession.concessionAmount
            calculatedBalance = fee - concAmount

            calculations[receiptHead][termId] = {
              fee,
              concPercent: 0,
              concAmount: Number(existingConcession.concessionAmount),
              balance: Number(calculatedBalance.toFixed(2)),
              remarks: existingConcession.remarks || '',
              concessionTitleId: existingConcession.concessionTitleId || '',
              detailId: existingConcession.id,
            }
          } else {
            calculations[receiptHead][termId] = {
              fee,
              concPercent: 0,
              concAmount: 0,
              balance: fee,
              remarks: existingConcession.remarks || '',
              concessionTitleId: existingConcession.concessionTitleId || '',
              detailId: existingConcession.id,
            }
          }
        } else {
          calculations[receiptHead][termId] = {
            fee,
            concPercent: 0,
            concAmount: 0,
            balance: fee,
            remarks: '',
            concessionTitleId: '',
            detailId: null,
          }
        }
      })
    })

    console.log('🎯 === FINAL CALCULATIONS ===')
    console.log('📋 Final calculations after applying concessions:', calculations)

    setFeeCalculations(calculations)
  }

  const resetConcessionData = () => {
    setExistingConcessionId(null)
    setIsUpdateMode(false)
    setConcessionRefNo('')
    setPendingConcessions(null)
    setShowConcessionForm(false)
    setViewMode('view')
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
    setFeeStructureData(null)
    setBaseFeeStructure({})
    setFeeCalculations({})
    setPendingConcessions(null)
    setConcessionRefNo('')
    setError(null)
    setSuccess(null)
    setFeeStructureValid(false)
    setViewMode('view')
    setShowConcessionForm(false)
    resetConcessionData()

    setLastSearchQuery('')
    setSearchResults([])
    setShowDropdown(false)

    // Reset to default session
    setFormData({ sessionId: defaultSession })
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

  // Enhanced concession percentage change with mutual exclusivity
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
          concAmount: 0,
          balance: fee - concAmount,
        },
      },
    }))
    setError(null)
  }

  // Enhanced concession amount change with mutual exclusivity
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
          concPercent: 0,
          concAmount: amount,
          balance: fee - amount,
        },
      },
    }))
    setError(null)
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

  const handleConcessionTitleChange = (receiptHead, termId, value) => {
    setFeeCalculations((prev) => ({
      ...prev,
      [receiptHead]: {
        ...prev[receiptHead],
        [termId]: {
          ...prev[receiptHead][termId],
          concessionTitleId: value,
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

  // Render fee structure in view mode (read-only)
  const renderFeeStructureView = () => {
    if (!feeStructureData) return null

    return (
      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold text-success">📊 Student Fee Structure</h6>
            <div>
              <CBadge color="info" className="me-2">
                ₹{feeStructureData.totalFees.toLocaleString()} Total
              </CBadge>
              <CBadge color="secondary" className="me-2">
                {feeStructureData.totalTerms} Terms
              </CBadge>
              <CBadge color="primary">{feeStructureData.totalReceiptHeads} Receipt Heads</CBadge>
            </div>
          </div>
        </CCardHeader>
        <CCardBody className="py-2">
          <CAccordion>
            {getAllTerms().map((termId) => {
              const termName = getTermName(termId)
              const termFees = getAllReceiptHeads()
                .map((receiptHead) => ({
                  receiptHead,
                  fee: baseFeeStructure[receiptHead]?.[termId] || 0,
                }))
                .filter((item) => item.fee > 0)

              if (termFees.length === 0) return null

              const termTotal = termFees.reduce((sum, item) => sum + item.fee, 0)

              return (
                <CAccordionItem key={termId} itemKey={termId}>
                  <CAccordionHeader>
                    <div className="d-flex justify-content-between w-100 me-3">
                      <span className="fw-bold">📅 {termName}</span>
                      <CBadge color="success">₹{termTotal.toFixed(2)}</CBadge>
                    </div>
                  </CAccordionHeader>
                  <CAccordionBody>
                    <CTable bordered hover responsive size="sm">
                      <CTableHead className="table-success">
                        <CTableRow>
                          <CTableHeaderCell className="small py-1">
                            🧾 Receipt Head
                          </CTableHeaderCell>
                          <CTableHeaderCell className="small py-1 text-end">
                            💰 Fee Amount
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {termFees.map((item) => (
                          <CTableRow key={`${termId}-${item.receiptHead}`}>
                            <CTableDataCell className="small fw-bold">
                              {item.receiptHead}
                            </CTableDataCell>
                            <CTableDataCell className="small text-end fw-bold text-success">
                              ₹{item.fee.toFixed(2)}
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                        <CTableRow className="table-light">
                          <CTableDataCell className="small fw-bold">📊 Term Total</CTableDataCell>
                          <CTableDataCell className="small fw-bold text-end text-success">
                            ₹{termTotal.toFixed(2)}
                          </CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  </CAccordionBody>
                </CAccordionItem>
              )
            })}
          </CAccordion>

          {/* Action buttons for view mode */}
          <div className="mt-3 text-center">
            <CButtonGroup>
              <CButton
                color="primary"
                onClick={() => {
                  setViewMode('edit')
                  setShowConcessionForm(true)
                }}
                disabled={!feeStructureValid}
              >
                💰 {isUpdateMode ? 'Modify Concession' : 'Create Concession'}
              </CButton>
              {isUpdateMode && (
                <CButton color="info" variant="outline" onClick={() => setViewMode('edit')}>
                  📝 Edit Existing
                </CButton>
              )}
            </CButtonGroup>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  // Render concession editing form
  const renderConcessionEditForm = (termId) => {
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

    return (
      <CAccordionItem key={termId} itemKey={termId}>
        <CAccordionHeader>
          <div className="d-flex justify-content-between w-100 me-3">
            <span className="fw-bold">📅 {termName}</span>
            <span className="text-end">
              <CBadge color="warning" className="me-2">
                Balance: ₹{termTotals.totalBalance.toFixed(2)}
              </CBadge>
              {termTotals.totalConcession > 0 && (
                <CBadge color="success" className="me-2">
                  Concession: ₹{termTotals.totalConcession.toFixed(2)}
                </CBadge>
              )}
              <CBadge color="primary">Total: ₹{termTotals.totalFees.toFixed(2)}</CBadge>
            </span>
          </div>
        </CAccordionHeader>
        <CAccordionBody>
          <CTable bordered hover responsive size="sm">
            <CTableHead className="table-dark">
              <CTableRow>
                <CTableHeaderCell className="small py-1">🧾 Receipt Head</CTableHeaderCell>
                <CTableHeaderCell className="small py-1">💰 Fees</CTableHeaderCell>
                <CTableHeaderCell className="small py-1">📊 Conc (%)</CTableHeaderCell>
                <CTableHeaderCell className="small py-1">💵 Conc Amount</CTableHeaderCell>
                <CTableHeaderCell className="small py-1">📋 Balance</CTableHeaderCell>
                <CTableHeaderCell className="small py-1">🏷️ Concession Head</CTableHeaderCell>
                <CTableHeaderCell className="small py-1">📝 Remarks</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {visibleReceiptHeads.map((item) => {
                const { receiptHead, fee } = item

                const calcData = feeCalculations[receiptHead]?.[termId] || {
                  fee,
                  concPercent: 0,
                  concAmount: 0,
                  balance: fee,
                  remarks: '',
                  concessionTitleId: '',
                  detailId: null,
                }

                let displayedConcAmount = 0
                if (calcData.concPercent > 0) {
                  displayedConcAmount = (fee * calcData.concPercent) / 100
                } else {
                  displayedConcAmount = calcData.concAmount || 0
                }

                return (
                  <CTableRow key={`${termId}-${receiptHead}`}>
                    <CTableDataCell className="small fw-bold">{receiptHead}</CTableDataCell>
                    <CTableDataCell className="small text-end">₹{fee.toFixed(2)}</CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        value={calcData.concPercent || ''}
                        onChange={(e) =>
                          handleConcPercentChange(receiptHead, termId, e.target.value)
                        }
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        size="sm"
                        style={{ width: '80px', fontSize: '0.75rem' }}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        value={displayedConcAmount.toFixed(2) || ''}
                        onChange={(e) =>
                          handleConcAmountChange(receiptHead, termId, e.target.value)
                        }
                        min="0"
                        max={fee}
                        step="0.01"
                        placeholder="0"
                        size="sm"
                        style={{ width: '90px', fontSize: '0.75rem' }}
                      />
                    </CTableDataCell>
                    <CTableDataCell className="small text-end text-success fw-bold">
                      ₹{calcData.balance.toFixed(2)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormSelect
                        value={calcData.concessionTitleId || ''}
                        onChange={(e) =>
                          handleConcessionTitleChange(receiptHead, termId, e.target.value)
                        }
                        size="sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <option value="">Select Concession</option>
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
                        placeholder="Optional"
                        value={calcData.remarks || ''}
                        onChange={(e) => handleRemarksChange(receiptHead, termId, e.target.value)}
                        size="sm"
                        style={{ fontSize: '0.75rem' }}
                      />
                    </CTableDataCell>
                  </CTableRow>
                )
              })}

              {/* Term Total Row */}
              <CTableRow className="table-secondary">
                <CTableDataCell className="small fw-bold">📊 {termName} Total</CTableDataCell>
                <CTableDataCell className="small fw-bold text-end">
                  ₹{termTotals.totalFees.toFixed(2)}
                </CTableDataCell>
                <CTableDataCell colSpan={2} className="small fw-bold text-center">
                  ₹{termTotals.totalConcession.toFixed(2)}
                </CTableDataCell>
                <CTableDataCell className="small fw-bold text-end text-success">
                  ₹{termTotals.totalBalance.toFixed(2)}
                </CTableDataCell>
                <CTableDataCell colSpan={2}></CTableDataCell>
              </CTableRow>
            </CTableBody>
          </CTable>
        </CAccordionBody>
      </CAccordionItem>
    )
  }

  // Enhanced submit handler
  const handleSubmit = async () => {
    if (!studentId) {
      setError('Please select a student')
      return
    }

    if (!formData.sessionId) {
      setError('Please select a session')
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

            // Transform to match new DTO structure
            filteredFeeCalculations[receiptHead][termId] = {
              originalFee: calc.fee,
              concessionPercentage: calc.concPercent > 0 ? calc.concPercent : null,
              concessionAmount:
                calc.concPercent > 0 ? (calc.fee * calc.concPercent) / 100 : calc.concAmount,
              finalFee: calc.balance,
              concessionType: calc.concPercent > 0 ? 'PERCENTAGE' : 'AMOUNT',
              concessionTitleId: calc.concessionTitleId || null,
              remarks: calc.remarks || '',
            }
          }
        })
      })

      const requestData = {
        admissionNumber: studentId,
        sessionId: parseInt(formData.sessionId),
        concessionRefNo,
        remarks: '',
        approvedBy: 'System', // You can add a field for this
        feeCalculations: filteredFeeCalculations,
      }

      let response
      console.log('📤 Request Data:', requestData)

      if (isUpdateMode && existingConcessionId) {
        response = await concessionApi.update(
          `concession/update/${existingConcessionId}`,
          requestData,
        )
        setSuccess('Student concession updated successfully!')
      } else {
        response = await concessionApi.create('concession/create', requestData)
        setSuccess('Student concession created successfully!')
        setExistingConcessionId(response.id)
        setIsUpdateMode(true)
      }

      // Switch back to view mode after successful save
      setViewMode('view')
      setShowConcessionForm(false)
    } catch (error) {
      console.error('Error saving concession:', error)
      setError('Failed to save concession data. Please try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancel = () => {
    setViewMode('view')
    setShowConcessionForm(false)
    // Reset calculations to original state
    if (Object.keys(baseFeeStructure).length > 0) {
      initializeBaseFeeCalculations(baseFeeStructure)
    }
  }

  const grandTotals = calculateGrandTotals()

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
            <CCol md={10}>
              <h6 className="mb-0 fw-bold text-primary">💰 Student Concession Management</h6>
            </CCol>
            <CCol md={2} className="text-end">
              <CButtonGroup size="sm">
                <CButton color="outline-secondary" onClick={handleReset}>
                  🔄 Reset
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="py-2">
          <CRow className="g-2 align-items-end">
            {/* Student Search */}
            <CCol md={5}>
              <div className="position-relative" ref={dropdownRef}>
                <CFormInput
                  size="sm"
                  placeholder="Enter or Search Admission Number / Name *"
                  value={studentId}
                  onChange={(e) => handleLiveSearch(e.target.value)}
                  autoComplete="off"
                />
                <label className="small text-muted">Student Search</label>
                {searchLoading && (
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
                value={formData.sessionId}
                onChange={(e) => {
                  setFormData({ sessionId: e.target.value })
                  // Reset student data when session changes
                  if (studentId) {
                    resetAllData()
                  }
                }}
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
              {showConcessionForm && (
                <>
                  <CFormInput
                    size="sm"
                    value={concessionRefNo}
                    onChange={(e) => setConcessionRefNo(e.target.value)}
                    placeholder="Reference number"
                  />
                  <label className="small text-muted">Concession Ref. No.</label>
                </>
              )}
            </CCol>

            <CCol md={2} className="text-end">
              {isUpdateMode && (
                <CBadge color="warning" size="sm">
                  Update Mode
                </CBadge>
              )}
              {viewMode === 'edit' && (
                <CBadge color="info" size="sm">
                  Edit Mode
                </CBadge>
              )}
            </CCol>
          </CRow>

          {/* Student Info Display - Compact */}
          {studentData.name && (
            <CRow className="mt-2 p-2 bg-dark rounded">
              <CCol sm={3} className="small">
                <strong>📝 {studentData.name}</strong>
              </CCol>
              <CCol sm={2} className="small text-muted">
                🎓 {studentData.className}
              </CCol>
              <CCol sm={2} className="small text-muted">
                📚 {studentData.sectionName}
              </CCol>
              <CCol sm={3} className="small text-muted">
                👨‍👦 {studentData.fatherName || 'N/A'}
              </CCol>
              <CCol sm={2} className="small text-muted">
                👥 {studentData.groupName || 'N/A'}
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Loading Indicator */}
      {feeLoading && (
        <div className="text-center py-3">
          <CSpinner color="primary" />
          <p className="mt-2 small">Loading fee data...</p>
        </div>
      )}

      {/* Fee Structure View Mode */}
      {viewMode === 'view' && feeStructureData && renderFeeStructureView()}

      {/* Concession Edit Mode */}
      {viewMode === 'edit' && showConcessionForm && feeStructureData && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-warning">
                ✏️ {isUpdateMode ? 'Modify' : 'Create'} Concession
              </h6>
              <span className="text-muted small">
                {getAllTerms().length} Terms • {getAllReceiptHeads().length} Receipt Heads
              </span>
            </div>
          </CCardHeader>
          <CCardBody className="py-2">
            {/* Accordion for Terms */}
            <CAccordion>
              {getAllTerms().map((termId) => renderConcessionEditForm(termId))}
            </CAccordion>

            {/* Grand Total Summary - Compact */}
            <div className="bg-warning text-dark p-2 rounded mt-3">
              <CRow className="align-items-center">
                <CCol md={8}>
                  <div className="d-flex gap-3">
                    <span>
                      <strong>Total Fees:</strong> ₹{grandTotals.grandTotalFees.toFixed(2)}
                    </span>
                    <span>
                      <strong>Total Concession:</strong> ₹
                      {grandTotals.grandTotalConcession.toFixed(2)}
                    </span>
                    <span>
                      <strong>Final Amount:</strong> ₹{grandTotals.grandTotalBalance.toFixed(2)}
                    </span>
                  </div>
                </CCol>

                <CCol md={4} className="text-end">
                  <CButtonGroup size="sm">
                    <CButton
                      color="success"
                      onClick={handleSubmit}
                      disabled={feeLoading || submitLoading || !studentId || !formData.sessionId}
                    >
                      {submitLoading ? (
                        <>
                          <CSpinner size="sm" className="me-1" />
                          Saving...
                        </>
                      ) : (
                        <>💾 {isUpdateMode ? 'Update' : 'Save'} Concession</>
                      )}
                    </CButton>
                    <CButton color="outline-dark" onClick={handleCancel}>
                      ❌ Cancel
                    </CButton>
                  </CButtonGroup>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* No Data State */}
      {!studentId && !feeLoading && (
        <CCard className="mb-2 shadow-sm">
          <CCardBody className="text-center py-4">
            <div className="text-muted">
              <h5 className="mb-3">🔍 Search for a Student</h5>
              <p>
                Enter student admission number or name to view fee structure and manage concessions
              </p>
            </div>
          </CCardBody>
        </CCard>
      )}
    </CContainer>
  )
}

export default StudentConcession
