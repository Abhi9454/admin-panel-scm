import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
  CBadge,
  CSpinner,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const FeeLastDate = () => {
  // Basic data states
  const [terms, setTerms] = useState([])
  const [selectedTermId, setSelectedTermId] = useState('')

  // Table data states
  const [feeBills, setFeeBills] = useState([])
  const [feeLastDates, setFeeLastDates] = useState([])
  const [tableData, setTableData] = useState([])
  const [showTable, setShowTable] = useState(false)

  // Loading and message states
  const [initialLoading, setInitialLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [savingIds, setSavingIds] = useState(new Set())
  const [alerts, setAlerts] = useState([])

  // Load initial dropdowns data
  useEffect(() => {
    loadInitialData()
  }, [])

  const addAlert = (type, message) => {
    const id = Date.now()
    setAlerts((prev) => [...prev, { id, type, message }])

    // Auto remove alert after 5 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id))
    }, 5000)
  }

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const loadInitialData = async () => {
    setInitialLoading(true)
    try {
      // Load dropdowns data
      const [termsRes] = await Promise.all([
        schoolManagementApi.getAll('term/all').catch((err) => {
          console.error('Failed to load terms:', err)
          return []
        }),
      ])
      setTerms(Array.isArray(termsRes) ? termsRes : [])
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleViewData = async () => {
    if (!selectedTermId) {
      addAlert('warning', 'Please select both Term and Receipt Book')
      return
    }

    setFetchingData(true)
    setShowTable(false)

    try {
      // Step 1: Fetch fee bills
      addAlert('info', 'Fetching fee bills...')
      let feeBillsData = []

      try {
        const feeBillsRes = await apiService.getAll(`fees-bill/by-term/${selectedTermId}`)
        feeBillsData = Array.isArray(feeBillsRes) ? feeBillsRes : feeBillsRes.data || []

        if (feeBillsData.length === 0) {
          addAlert('warning', 'No fee bills found for selected term')
          setFetchingData(false)
          return
        }

        setFeeBills(feeBillsData)
      } catch (error) {
        console.error('Error fetching fee bills:', error)
        addAlert(
          'danger',
          'Failed to fetch fee bills. Please check if fee bills exist for this term.',
        )
        setFetchingData(false)
        return
      }

      // Step 2: Fetch existing last dates
      let lastDatesData = []

      try {
        const lastDatesRes = await apiService.getAll('fee-last-date/all')
        lastDatesData = Array.isArray(lastDatesRes) ? lastDatesRes : lastDatesRes.data || []
        setFeeLastDates(lastDatesData)
      } catch (error) {
        console.error('Error fetching last dates:', error)
        addAlert('warning', 'Unable to fetch existing last dates, but you can still add new ones')
        setFeeLastDates([])
      }

      // Step 3: Create table data mapping
      createTableData(feeBillsData, lastDatesData)
      setShowTable(true)
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setFetchingData(false)
    }
  }

  const createTableData = (feeBillsData, lastDatesData) => {
    const mappedData = feeBillsData.map((feeBill) => {
      // Find existing last date for this combination
      const existingLastDate = lastDatesData.find(
        (item) =>
          item.term?.id === parseInt(selectedTermId) &&
          item.classEntity?.id === feeBill.classEntity?.id &&
          item.groupEntity?.id === feeBill.group?.id,
      )

      return {
        feeBillId: feeBill.id,
        classId: feeBill.classEntity?.id,
        className: feeBill.classEntity?.name || 'Unknown Class',
        groupId: feeBill.group?.id,
        groupName: feeBill.group?.name || 'Unknown Group',
        studentType: feeBill.studentType || 'Unknown Type',
        existingLastDate: existingLastDate,
        lastDate: existingLastDate?.lastDate || '',
        hasLastDate: !!existingLastDate?.lastDate,
        lastDateId: existingLastDate?.id || null,
      }
    })

    // Sort by class name, then group name
    mappedData.sort((a, b) => {
      const classCompare = a.className.localeCompare(b.className)
      if (classCompare !== 0) return classCompare
      return a.groupName.localeCompare(b.groupName)
    })

    setTableData(mappedData)
  }

  const handleLastDateChange = (index, newDate) => {
    setTableData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, lastDate: newDate } : item)),
    )
  }

  const handleSaveLastDate = async (index) => {
    const item = tableData[index]
    const saveId = `${item.classId}_${item.groupId}`

    if (!item.lastDate) {
      addAlert('warning', 'Please enter a last date before saving')
      return
    }

    setSavingIds((prev) => new Set([...prev, saveId]))

    try {
      const saveData = {
        termId: parseInt(selectedTermId),
        classId: item.classId,
        groupId: item.groupId,
        lastDate: item.lastDate,
      }

      let response
      if (item.hasLastDate && item.lastDateId) {
        // Update existing entry
        response = await apiService.update(`fee-last-date/update/${item.lastDateId}`, saveData)
        addAlert('success', `Updated last date for ${item.className} - ${item.groupName}`)
      } else {
        // Create new entry
        response = await apiService.create('fee-last-date/add', saveData)
        addAlert('success', `Saved last date for ${item.className} - ${item.groupName}`)
      }

      // Update table data with the response
      setTableData((prev) =>
        prev.map((tableItem, i) =>
          i === index
            ? {
                ...tableItem,
                hasLastDate: true,
                lastDateId: response.id || response.data?.id || item.lastDateId,
                existingLastDate: response,
              }
            : tableItem,
        ),
      )
    } catch (error) {
      console.error('Error saving last date:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
      addAlert(
        'danger',
        `Failed to save last date for ${item.className} - ${item.groupName}: ${errorMessage}`,
      )
    } finally {
      setSavingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(saveId)
        return newSet
      })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Fee Last Date Management</strong>
            <CButton
              color="secondary"
              size="sm"
              className="float-end"
              onClick={loadInitialData}
              disabled={initialLoading}
            >
              {initialLoading ? 'Loading...' : 'Refresh'}
            </CButton>
          </CCardHeader>
          <CCardBody>
            {/* Alerts Section */}
            {alerts.map((alert) => (
              <CAlert
                key={alert.id}
                color={alert.type}
                className="mb-3"
                dismissible
                onDismiss={() => removeAlert(alert.id)}
              >
                {alert.message}
              </CAlert>
            ))}

            {/* Selection Form */}
            {initialLoading ? (
              <div className="text-center">
                <CSpinner /> Loading initial data...
              </div>
            ) : (
              <CForm>
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormLabel>Term</CFormLabel>
                    <CFormSelect
                      value={selectedTermId}
                      onChange={(e) => setSelectedTermId(e.target.value)}
                      disabled={fetchingData}
                    >
                      <option value="">Select Term</option>
                      {terms.map((term) => (
                        <option key={term.id} value={term.id}>
                          {term.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={4} className="d-flex align-items-end">
                    <CButton
                      color="primary"
                      onClick={handleViewData}
                      disabled={fetchingData || !selectedTermId}
                      className="me-2"
                    >
                      {fetchingData ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Fetching Data...
                        </>
                      ) : (
                        'View Fee Bills'
                      )}
                    </CButton>
                    <CButton
                      color="secondary"
                      onClick={() => {
                        setSelectedTermId('')
                        setShowTable(false)
                        setTableData([])
                        setAlerts([])
                      }}
                    >
                      Clear
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            )}

            {/* Data Table */}
            {showTable && (
              <div className="mt-4">
                <h5>
                  Fee Bills for {terms.find((t) => t.id == selectedTermId)?.name}
                </h5>

                {tableData.length === 0 ? (
                  <CAlert color="info">
                    No fee bills found for the selected term and receipt book combination.
                  </CAlert>
                ) : (
                  <CTable hover responsive striped>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>#</CTableHeaderCell>
                        <CTableHeaderCell>Class</CTableHeaderCell>
                        <CTableHeaderCell>Group</CTableHeaderCell>
                        <CTableHeaderCell>Last Date</CTableHeaderCell>
                        <CTableHeaderCell>Status</CTableHeaderCell>
                        <CTableHeaderCell>Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {tableData.map((row, index) => {
                        const saveId = `${row.classId}_${row.groupId}`
                        const isSaving = savingIds.has(saveId)

                        return (
                          <CTableRow key={`${row.classId}_${row.groupId}`}>
                            <CTableDataCell>{index + 1}</CTableDataCell>
                            <CTableDataCell>{row.className}</CTableDataCell>
                            <CTableDataCell>{row.groupName}</CTableDataCell>
                            <CTableDataCell>{row.studentType}</CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                type="date"
                                value={row.lastDate}
                                onChange={(e) => handleLastDateChange(index, e.target.value)}
                                size="sm"
                                disabled={isSaving}
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              {row.hasLastDate ? (
                                <CBadge color="success">Saved</CBadge>
                              ) : (
                                <CBadge color="secondary">Not Set</CBadge>
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CButton
                                color={row.hasLastDate ? 'warning' : 'primary'}
                                size="sm"
                                onClick={() => handleSaveLastDate(index)}
                                disabled={isSaving || !row.lastDate}
                              >
                                {isSaving ? (
                                  <>
                                    <CSpinner size="sm" className="me-1" />
                                    Saving...
                                  </>
                                ) : row.hasLastDate ? (
                                  'Update'
                                ) : (
                                  'Save'
                                )}
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                )}
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FeeLastDate
