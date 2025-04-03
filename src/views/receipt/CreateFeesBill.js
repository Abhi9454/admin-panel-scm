import React, { useState, useEffect } from 'react'
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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
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
  const [selectedReceiptHeads, setSelectedReceiptHeads] = useState([]) // NEW STATE

  useEffect(() => {
    fetchGroups()
    fetchFeesClasses()
    fetchTerm()
    fetchReceiptHeads()

    // Initialize feeEntries with default values if no existing record is fetched
    if (selectedGroup && selectedFeesClass) {
      fetchExistingFeeRecord()
    } else {
      initializeFeeEntries() // Call function to set defaults when no record is available
    }
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

  const fetchExistingFeeRecord = async () => {
    try {
      const dataItem = {
        groupId: selectedGroup,
        feesClassId: selectedFeesClass,
      }

      const response = await apiService.fetch(`fees-bill/details`, dataItem)

      if (response && response.length > 0) {
        const feeBill = response[0] // Assuming one record per group/class
        setEditingFeeBill(feeBill)
        setStudentType(feeBill.studentType)
        setFeeEntries(feeBill.feeEntries || {}) // Populate fee entries
      } else {
        setEditingFeeBill(null) // No existing record found
        setFeeEntries({}) // Reset fee entries
      }
    } catch (error) {
      console.error('Error fetching existing fee bill:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const data = await schoolManagementApi.getAll('group/all')
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
      const data = await apiService.getAll('receipt-head/all')
      console.log('receipt: ', data)
      setReceiptHeads(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }
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

    // Ensure all receipt heads are included in feeEntries with term defaults
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

    console.log('Final JSON to API:', JSON.stringify(feesData, null, 2))

    try {
      if (editingFeeBill) {
        await apiService.update(`fees-bill/update/${editingFeeBill.id}`, feesData)
      } else {
        await apiService.create('fees-bill/add', feesData)
      }
      alert('Fees bill saved successfully!')
    } catch (error) {
      console.error('Error saving fees bill:', error)
    }
  }
  const handleAddReceiptHead = () => {
    if (!selectedReceiptHead) return // Prevent adding empty values

    const receiptId = Number(selectedReceiptHead) // Ensure it's a number

    if (!selectedReceiptHeads.includes(receiptId)) {
      setSelectedReceiptHeads([...selectedReceiptHeads, receiptId])
      setFeeEntries((prev) => ({
        ...prev,
        [receiptId]: termList.reduce((acc, term) => {
          acc[term.id] = 0
          return acc
        }, {}),
      }))
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
                  <CFormLabel>Group</CFormLabel>
                  <CFormSelect
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
                  <CFormLabel>Fees Class</CFormLabel>
                  <CFormSelect
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
                <CFormLabel>Student Type</CFormLabel>
                <div>
                  <CFormCheck
                    type="radio"
                    label="New Student"
                    value="new"
                    checked={studentType === 'new'}
                    onChange={(e) => setStudentType(e.target.value)}
                  />
                  <CFormCheck
                    type="radio"
                    label="Old Student"
                    value="old"
                    checked={studentType === 'old'}
                    onChange={(e) => setStudentType(e.target.value)}
                  />
                </div>
              </div>
              <CRow className="mt-3">
                <CCol md={4}>
                  <CFormLabel>Add Receipt Head</CFormLabel>
                  <CFormSelect
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
                                  value={feeEntries[receipt.id]?.[term.id] ?? 0}
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
              <CButton className="mt-3" color="success" type="submit">
                {editingFeeBill ? 'Update Fees Bill' : 'Add Fees Bill'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateFeesBill
