import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
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
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const CreateFeesBill = () => {
  const [selectedTerm, setSelectedTerm] = useState('Admission')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedFeesClass, setSelectedFeesClass] = useState('')
  const [groups, setGroups] = useState([])
  const [termList, setTermList] = useState([])
  const [feesClasses, setFeesClasses] = useState([])
  const [studentType, setStudentType] = useState('new')
  const [receiptHeads, setReceiptHeads] = useState([])
  const [feeEntries, setFeeEntries] = useState({})
  const [selectedReceiptHead, setSelectedReceiptHead] = useState('')
  const [feeBills, setFeeBills] = useState([])
  const [editingFeeBill, setEditingFeeBill] = useState(null)
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [existingData, setExistingData] = useState(null)
  const [pendingEditBill, setPendingEditBill] = useState(null)
  const [tableRows, setTableRows] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [selectedReceiptHeads, setSelectedReceiptHeads] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [addingReceiptHead, setAddingReceiptHead] = useState(false)

  useEffect(() => {
    fetchGroups()
    fetchFeesClasses()
    fetchTerm()
    fetchReceiptHeads()
    initializeFeeEntries()
  }, [selectedGroup, selectedFeesClass])

  // Function to initialize feeEntries with default zero values
  const initializeFeeEntries = () => {
    let defaultEntries = {}

    receiptHeads.forEach((receipt) => {
      defaultEntries[receipt.id] = termList.reduce((acc, term) => {
        acc[term.id] = 0.0
        return acc
      }, {})
    })

    setFeeEntries(defaultEntries)
  }

  const fetchGroups = async () => {
    try {
      const data = await schoolManagementApi.getAll('group/all')
      console.log(data)
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
      alert('Error loading groups. Please refresh the page.')
    }
  }

  const fetchTerm = async () => {
    try {
      const data = await schoolManagementApi.getAll('term/all')
      setTermList(data)

      setFeeEntries((prevEntries) => {
        const updatedEntries = { ...prevEntries }
        data.forEach((term) => {
          Object.keys(updatedEntries).forEach((receiptId) => {
            if (!(term.id in updatedEntries[receiptId])) {
              updatedEntries[receiptId][term.id] = 0.0
            }
          })
        })
        return updatedEntries
      })
    } catch (error) {
      console.error('Error fetching terms:', error)
      alert('Error loading terms.')
    }
  }

  useEffect(() => {
    if (groups.length > 0 && feesClasses.length > 0 && feeBills.length > 0) {
      const groupIdToNameMap = {}
      groups.forEach((group) => {
        groupIdToNameMap[group.id] = group.name
      })

      const feeClassIdToNameMap = {}
      feesClasses.forEach((feeClass) => {
        feeClassIdToNameMap[feeClass.id] = feeClass.name
      })

      const mappedData = feeBills.map((feeBill) => ({
        id: feeBill.id,
        groupId: feeBill.groupId,
        groupName: groupIdToNameMap[feeBill.groupId] || 'Unknown Group',
        feeClassId: feeBill.feesClassId,
        feeClassName: feeClassIdToNameMap[feeBill.feesClassId] || 'Unknown Class',
        studentType: feeBill.studentType === 'new' ? 'new' : 'old',
        studentTypeSet: feeBill.studentType,
        feeEntries: feeBill.feeEntries,
      }))

      setTableData(mappedData)
    }
  }, [groups, feesClasses, feeBills])

  const fetchFeesClasses = async () => {
    try {
      const data = await schoolManagementApi.getAll('class/all')
      setFeesClasses(data)
    } catch (error) {
      console.error('Error fetching fees classes:', error)
      alert('Error loading fee classes.')
    }
  }

  const fetchReceiptHeads = async () => {
    try {
      setLoading(true)
      setTableLoading(true)
      const data = await apiService.getAll('receipt-head/all')
      const response = await apiService.getAll('fees-bill/all')
      console.log('receipt: ', data)
      console.log('fee bill: ', response)
      setReceiptHeads(data)
      setFeeBills(response)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
      alert('Error loading receipt heads and fee bills.')
    } finally {
      setLoading(false)
      setTableLoading(false)
    }
  }

  const handleEdit = (value) => {
    setPendingEditBill(value)
    setSelectedGroup(value.groupId)
    setSelectedFeesClass(value.feeClassId)
    setStudentType(value.studentTypeSet)
    setEditingFeeBill(true)
    setEditingId(value.id)
  }

  useEffect(() => {
    if (pendingEditBill && termList.length > 0) {
      const entries = pendingEditBill.feeEntries || {}

      const updatedEntries = {}

      Object.keys(entries).forEach((receiptId) => {
        updatedEntries[receiptId] = {}

        termList.forEach((term) => {
          const amount = entries[receiptId]?.[term.id]
          updatedEntries[receiptId][term.id] = amount ?? 0.0
        })
      })

      setFeeEntries(updatedEntries)

      const receiptHeadIds = Object.keys(entries)
      setSelectedReceiptHeads(receiptHeadIds.map((id) => parseInt(id, 10)))

      setPendingEditBill(null)
    }
  }, [pendingEditBill, termList])

  const handleAmountChange = (receiptId, termId, value) => {
    setFeeEntries((prevEntries) => {
      const updatedReceipt = {
        ...prevEntries[receiptId],
        [termId]: value ? parseInt(value) : 0,
      }

      return {
        ...prevEntries,
        [receiptId]: updatedReceipt,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedGroup || !selectedFeesClass || !studentType) {
      alert('Please fill all required fields (Group, Fee Class, and Student Type)')
      return
    }

    if (selectedReceiptHeads.length === 0) {
      alert('Please add at least one receipt head with fee amounts')
      return
    }

    setSubmitting(true)
    const formattedFeeEntries = selectedReceiptHeads.reduce((acc, receiptId) => {
      acc[receiptId] = termList.reduce((termAcc, term) => {
        termAcc[term.id] = feeEntries[receiptId]?.[term.id] ?? 0.0
        return termAcc
      }, {})
      return acc
    }, {})

    const feesData = {
      feeClassId: selectedFeesClass ? parseInt(selectedFeesClass) : null,
      groupId: selectedGroup ? parseInt(selectedGroup) : null,
      studentType,
      feeEntries: Object.entries(formattedFeeEntries).map(([receiptHeadId, terms]) => ({
        [receiptHeadId]: terms,
      })),
    }

    console.log(feesData.studentType)

    try {
      if (editingFeeBill) {
        await apiService.update('fees-bill/update', editingId, feesData)
        alert('Fees bill updated successfully!')
      } else {
        await apiService.create('fees-bill/add', feesData)
        alert('Fees bill created successfully!')
      }
      await fetchReceiptHeads()
      handleReset()
    } catch (error) {
      console.error('Error saving fees bill:', error)
      alert('Error saving fees bill. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedGroup('')
    setSelectedFeesClass('')
    setStudentType('new')
    setSelectedReceiptHead('')
    setSelectedReceiptHeads([])
    setFeeEntries({})
    setEditingFeeBill(null)
    setEditingId(null)
    initializeFeeEntries()
  }

  const reloadPage = () => {
    window.location.reload()
  }

  const handleAddReceiptHead = async () => {
    if (!selectedReceiptHead || !selectedGroup || !selectedFeesClass || !studentType) {
      alert('Please select Group, Fee Class, Student Type, and Receipt Head before adding')
      return
    }

    const receiptId = Number(selectedReceiptHead)
    if (selectedReceiptHeads.includes(receiptId)) {
      alert('This receipt head is already added')
      return
    }

    setAddingReceiptHead(true)

    const requestData = {
      feesClassId: Number(selectedFeesClass),
      groupId: Number(selectedGroup),
      studentType: studentType,
      receiptHeadId: receiptId,
    }

    console.log('Request Data:', requestData)

    try {
      const response = await apiService.fetch(`fees-bill/details`, requestData)
      console.log('Response from API:', response)

      const feeEntries = response?.feeEntries || {}

      const newEntries = termList.reduce((acc, term) => {
        const termEntry = feeEntries[String(term.id)]
        acc[term.id] = termEntry && termEntry[receiptId] !== undefined ? termEntry[receiptId] : 0.0
        return acc
      }, {})

      setSelectedReceiptHeads([...selectedReceiptHeads, receiptId])
      setFeeEntries((prev) => ({
        ...prev,
        [receiptId]: newEntries,
      }))
      setSelectedReceiptHead('')
    } catch (error) {
      console.error('Error fetching fee bill details:', error)
      alert('Error adding receipt head. Please try again.')
    } finally {
      setAddingReceiptHead(false)
    }
  }

  const handleRemoveReceiptHead = (receiptId) => {
    setSelectedReceiptHeads(selectedReceiptHeads.filter((id) => id !== receiptId))
    setFeeEntries((prev) => {
      const updated = { ...prev }
      delete updated[receiptId]
      return updated
    })
  }

  // Calculate total fees
  const calculateTotalFees = () => {
    let total = 0
    selectedReceiptHeads.forEach((receiptId) => {
      termList.forEach((term) => {
        total += feeEntries[receiptId]?.[term.id] || 0
      })
    })
    return total
  }

  // Helper function to categorize terms based on API data
  const getTermsByCategory = (category) => {
    if (category === 'Admission') {
      return termList.filter((term) => term.name.toLowerCase().includes('adm'))
    }
    if (category === 'Monthly') {
      return termList
        .filter((term) => !term.name.toLowerCase().includes('adm'))
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
    }
    return []
  }

  // Calculate total for a receipt head
  const calculateReceiptHeadTotal = (receiptId) => {
    return termList.reduce((sum, term) => sum + (feeEntries[receiptId]?.[term.id] || 0), 0)
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">
                  {editingFeeBill ? '✏️ Edit Fees Bill' : '💰 Create Fees Bill'}
                </h6>
                <small className="text-muted">
                  Manage fee structures for different groups and classes
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingFeeBill && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info" className="me-2">
                  {selectedReceiptHeads.length} Receipt Heads
                </CBadge>
                <CBadge color="success">₹{calculateTotalFees().toFixed(2)}</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {/* Basic Information Form */}
            <div className="mb-4">
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                📋 Basic Information
              </h6>

              <CForm onSubmit={handleSubmit}>
                <CRow className="g-2">
                  <CCol lg={4} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          👥 Group<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select Group</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          🎓 Fee Class<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      value={selectedFeesClass}
                      onChange={(e) => setSelectedFeesClass(e.target.value)}
                      disabled={submitting}
                    >
                      <option value="">Select Fees Class</option>
                      {feesClasses.map((feesClass) => (
                        <option key={feesClass.id} value={feesClass.id}>
                          {feesClass.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol lg={4} md={12}>
                    <div className="mb-2">
                      <label className="form-label small text-muted fw-semibold">
                        👤 Student Type<span style={{ color: 'red' }}> *</span>
                      </label>
                      <div className="d-flex gap-3 mt-1">
                        <CFormCheck
                          type="radio"
                          id="newStudent"
                          name="studentType"
                          value="new"
                          label="🆕 New Student"
                          checked={studentType === 'new'}
                          onChange={(e) => setStudentType(e.target.value)}
                          disabled={submitting}
                        />
                        <CFormCheck
                          type="radio"
                          id="oldStudent"
                          name="studentType"
                          value="old"
                          label="👥 Old Student"
                          checked={studentType === 'old'}
                          onChange={(e) => setStudentType(e.target.value)}
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </div>

            {/* Add Receipt Head Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                🧾 Add Receipt Heads
              </h6>
              <CRow className="g-2">
                <CCol lg={8} md={8}>
                  <CFormSelect
                    size="sm"
                    floatingClassName="mb-2"
                    floatingLabel="🧾 Select Receipt Head"
                    value={selectedReceiptHead}
                    onChange={(e) => setSelectedReceiptHead(e.target.value)}
                    disabled={
                      submitting || !selectedGroup || !selectedFeesClass || addingReceiptHead
                    }
                  >
                    <option value="">Choose a receipt head to add</option>
                    {receiptHeads
                      .filter((receipt) => !selectedReceiptHeads.includes(receipt.id))
                      .map((receipt) => (
                        <option key={receipt.id} value={receipt.id}>
                          {receipt.headName}
                        </option>
                      ))}
                  </CFormSelect>
                </CCol>
                <CCol lg={4} md={4} className="d-flex align-items-start">
                  <CButton
                    color="primary"
                    size="sm"
                    onClick={handleAddReceiptHead}
                    disabled={!selectedReceiptHead || submitting || addingReceiptHead}
                    className="w-100"
                  >
                    {addingReceiptHead ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Adding Receipt Head...
                      </>
                    ) : (
                      '➕ Add Receipt Head'
                    )}
                  </CButton>
                </CCol>
              </CRow>
            </div>

            {/* Vertical Card Stack - All Data Always Visible */}
            {selectedReceiptHeads.length > 0 && (
              <div className="mb-4">
                <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                  💰 Fee Structure (All Data Visible)
                </h6>

                {selectedReceiptHeads.map((receiptId) => {
                  const receipt = receiptHeads.find((r) => r.id === receiptId)
                  return (
                    <CCard key={receiptId} className="mb-4 shadow-sm">
                      <CCardHeader className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0 fw-bold text-primary">{receipt.headName}</h6>
                          <div className="d-flex align-items-center gap-2">
                            <CBadge color="success" className="fs-6 px-3 py-1">
                              Total: ₹{calculateReceiptHeadTotal(receiptId).toFixed(2)}
                            </CBadge>
                            <CButton
                              color="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveReceiptHead(receiptId)}
                              disabled={submitting}
                              title="Remove receipt head"
                            >
                              🗑️
                            </CButton>
                          </div>
                        </div>
                      </CCardHeader>
                      <CCardBody>
                        {/* Admission Terms */}
                        {getTermsByCategory('Admission').length > 0 && (
                          <div className="mb-3">
                            <h6 className="text-primary mb-2">📅 Admission Terms</h6>
                            <CRow className="g-2">
                              {getTermsByCategory('Admission').map((term) => (
                                <CCol key={term.id} lg={2} md={3} sm={4} xs={6}>
                                  <label className="form-label small text-muted fw-semibold">
                                    {term.name}
                                  </label>
                                  <CFormInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={feeEntries[receiptId]?.[term.id] || 0}
                                    onChange={(e) =>
                                      handleAmountChange(receiptId, term.id, e.target.value)
                                    }
                                    className="text-end"
                                    disabled={submitting}
                                    style={{
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      height: '45px',
                                    }}
                                    placeholder="0"
                                  />
                                </CCol>
                              ))}
                            </CRow>
                          </div>
                        )}

                        {/* Monthly Terms */}
                        {getTermsByCategory('Monthly').length > 0 && (
                          <div>
                            <h6 className="text-success mb-2">📆 Monthly Terms</h6>
                            <CRow className="g-2">
                              {getTermsByCategory('Monthly').map((term) => (
                                <CCol key={term.id} lg={2} md={3} sm={4} xs={6}>
                                  <label className="form-label small text-muted fw-semibold">
                                    {term.name}
                                  </label>
                                  <CFormInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={feeEntries[receiptId]?.[term.id] || 0}
                                    onChange={(e) =>
                                      handleAmountChange(receiptId, term.id, e.target.value)
                                    }
                                    className="text-end"
                                    disabled={submitting}
                                    style={{
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      height: '45px',
                                    }}
                                    placeholder="0"
                                  />
                                </CCol>
                              ))}
                            </CRow>
                          </div>
                        )}
                      </CCardBody>
                    </CCard>
                  )
                })}

                {/* Grand Total Summary */}
                <CCard className="bg-dark text-white">
                  <CCardBody className="py-3">
                    <CRow className="align-items-center">
                      <CCol md={8}>
                        <h6 className="mb-0 fw-bold">📊 Grand Total Summary</h6>
                        <small className="opacity-75">
                          {selectedReceiptHeads.length} receipt heads • {termList.length} terms
                          configured
                        </small>
                      </CCol>
                      <CCol md={4} className="text-end">
                        <CBadge color="warning" className="fs-4 px-4 py-2">
                          ₹{calculateTotalFees().toFixed(2)}
                        </CBadge>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </div>
            )}

            {/* Form Actions */}
            <div className="border-top pt-3">
              {loading ? (
                <div className="text-center py-2">
                  <CSpinner color="primary" size="sm" className="me-2" />
                  <span className="text-muted">Loading data...</span>
                </div>
              ) : (
                <CButtonGroup size="sm">
                  <CButton
                    color="success"
                    onClick={handleSubmit}
                    disabled={submitting || selectedReceiptHeads.length === 0 || addingReceiptHead}
                  >
                    {submitting ? (
                      <>
                        <CSpinner size="sm" className="me-1" />
                        Saving...
                      </>
                    ) : editingFeeBill ? (
                      '✏️ Update Fees Bill'
                    ) : (
                      '💾 Create Fees Bill'
                    )}
                  </CButton>
                  <CButton
                    color="outline-warning"
                    onClick={handleReset}
                    disabled={submitting || addingReceiptHead}
                  >
                    Reset Form
                  </CButton>
                  <CButton
                    color="outline-secondary"
                    onClick={reloadPage}
                    disabled={submitting || addingReceiptHead}
                  >
                    Reload Page
                  </CButton>
                </CButtonGroup>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      {/* All Fees Bills Table */}
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">📋 All Fees Bills</h6>
                <small className="text-muted">Manage existing fee bill configurations</small>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color="info">{tableData.length} Fee Bills</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {tableLoading ? (
              <div className="text-center py-4">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading fee bills...</span>
              </div>
            ) : tableData.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <div style={{ fontSize: '2rem' }}>💰</div>
                <p className="mb-0">No fee bills found</p>
                <small>Create your first fee bill using the form above</small>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover small className="mb-0">
                  <CTableHead className="table-secondary">
                    <CTableRow>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        👥 Group
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        🎓 Fees Class
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        👤 Student Type
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {tableData.map((rb) => (
                      <CTableRow key={rb.id} className={editingId === rb.id ? 'table-danger' : ''}>
                        <CTableDataCell className="py-2 px-3">
                          <div className="fw-semibold text-muted">{rb.groupName}</div>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          <div className="fw-semibold text-muted">{rb.feeClassName}</div>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          <CBadge
                            color={rb.studentType === 'new' ? 'success' : 'primary'}
                            className="text-white"
                          >
                            {rb.studentType === 'new' ? '🆕 NEW' : '👥 OLD'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          <CButton
                            color="outline-warning"
                            size="sm"
                            onClick={() => handleEdit(rb)}
                            disabled={submitting || addingReceiptHead}
                            title="Edit fee bill"
                          >
                            ✏️ Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
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

export default CreateFeesBill
