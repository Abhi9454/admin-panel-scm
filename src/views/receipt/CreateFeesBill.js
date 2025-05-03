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
  const [pendingEditBill, setPendingEditBill] = useState(null) // NEW STATE
  const [tableRows, setTableRows] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [selectedReceiptHeads, setSelectedReceiptHeads] = useState([]) // NEW STATE

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
        acc[term.id] = 0.0 // Ensure default to 0.0
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
              updatedEntries[receiptId][term.id] = 0.0 // Ensure default 0.0
            }
          })
        })
        return updatedEntries
      })
    } catch (error) {
      console.error('Error fetching terms:', error)
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
        studentType: feeBill.studentType === 'new' ? 'NEW' : 'OLD',
        studentTypeSet: feeBill.studentType,
        feeEntries: feeBill.feeEntries, // you can decide if you want to display feeEntries directly
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
    } finally {
      setLoading(false)
      setTableLoading(false)
    }
  }

  const handleEdit = (value) => {
    setPendingEditBill(value) // Temporarily store it
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

      setPendingEditBill(null) // Clear after applying
    }
  }, [pendingEditBill, termList])

  const handleAmountChange = (receiptId, termId, value) => {
    setFeeEntries((prevEntries) => {
      const updatedReceipt = {
        ...prevEntries[receiptId],
        [termId]: value ? parseInt(value) : 0, // Default to 0 if no value
      }

      return {
        ...prevEntries,
        [receiptId]: updatedReceipt,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formattedFeeEntries = selectedReceiptHeads.reduce((acc, receiptId) => {
      acc[receiptId] = termList.reduce((termAcc, term) => {
        termAcc[term.id] = feeEntries[receiptId]?.[term.id] ?? 0.0 // Default to 0.0 if not set
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

    console.log(feesData)

    try {
      if (editingFeeBill) {
        await apiService.update('fees-bill/update', editingId, feesData)
      } else {
        await apiService.create('fees-bill/add', feesData)
      }
      alert('Fees bill saved successfully!')
      fetchReceiptHeads()
    } catch (error) {
      console.error('Error saving fees bill:', error)
    } finally {
      setLoading(false)
    }
  }

  const reloadPage = () => {
    window.location.reload()
  }

  const handleAddReceiptHead = async () => {
    if (!selectedReceiptHead || !selectedGroup || !selectedFeesClass || !studentType) return

    const receiptId = Number(selectedReceiptHead)
    if (selectedReceiptHeads.includes(receiptId)) return

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

      // Build a term-wise fee map using term ID as key
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
    } catch (error) {
      console.error('Error fetching fee bill details:', error)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingFeeBill ? 'Edit Fees Bill' : 'Create Fees Bill'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormSelect
                    name="sessionId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Group<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    name="sessionId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Fee Class<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    value={selectedFeesClass}
                    onChange={(e) => setSelectedFeesClass(e.target.value)}
                  >
                    <option value="">Select Fees Class</option>
                    {feesClasses.map((feesClass) => (
                      <option key={feesClass.id} value={feesClass.id}>
                        {feesClass.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <div className="mb-3">
                <div>
                  <CFormCheck
                    name="sessionId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Student Type<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="radio"
                    label="New Student"
                    value={studentType}
                    checked={studentType === 'new'}
                    onChange={(e) => setStudentType(e.target.value)}
                  />
                  <CFormCheck
                    name="sessionId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Student Type<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="radio"
                    label="Old Student"
                    value={studentType}
                    checked={studentType === 'old'}
                    onChange={(e) => setStudentType(e.target.value)}
                  />
                </div>
              </div>
              <CRow className="mt-3">
                <CCol md={4}>
                  <CFormSelect
                    name="sessionId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Add Receipt Head<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    value={selectedReceiptHead}
                    onChange={(e) => setSelectedReceiptHead(e.target.value)}
                  >
                    <option value="">Select Receipt Head</option>
                    {receiptHeads.map((receipt) => (
                      <option key={receipt.id} value={receipt.id}>
                        {receipt.headName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2} className="d-flex align-items-end">
                  <CButton color="primary" onClick={handleAddReceiptHead}>
                    Add
                  </CButton>
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol xs={12}>
                  <strong>Fees Structure</strong>
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                        {termList.map((term) => (
                          <CTableHeaderCell key={term.id}>{term.name}</CTableHeaderCell>
                        ))}
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {selectedReceiptHeads.map((receiptId) => {
                        const receipt = receiptHeads.find((r) => r.id === receiptId)
                        return (
                          <CTableRow key={receipt.id}>
                            <CTableDataCell>{receipt.headName}</CTableDataCell>
                            {termList.map((term) => (
                              <CTableDataCell key={term.id}>
                                <CFormInput
                                  type="number"
                                  value={feeEntries[receipt.id]?.[term.id] ?? 0} // Ensure feeEntries has data
                                  onChange={(e) =>
                                    handleAmountChange(receipt.id, term.id, e.target.value)
                                  }
                                />
                              </CTableDataCell>
                            ))}
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                </CCol>
              </CRow>
              {loading ? (
                <div className="text-center">
                  <CSpinner color="primary" />
                  <p>Loading data...</p>
                </div>
              ) : (
                <CButton className="m-3" color="success" type="submit">
                  {editingFeeBill ? 'Update Fees Bill' : 'Add Fees Bill'}
                </CButton>
              )}
              <CButton className="m-3" color="warning" onClick={reloadPage}>
                Reset
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      {tableLoading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading data...</p>
        </div>
      ) : (
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Fees Bill</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Group</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Fees Class</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Student Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {tableData.map((rb) => (
                    <CTableRow key={rb.id}>
                      <CTableDataCell>{rb.groupName}</CTableDataCell>
                      <CTableDataCell>{rb.feeClassName}</CTableDataCell>
                      <CTableDataCell>{rb.studentType}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(rb)}>
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  )
}

export default CreateFeesBill
