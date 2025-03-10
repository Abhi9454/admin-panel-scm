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

  useEffect(() => {
    fetchGroups()
    fetchFeesClasses()
    fetchTerm()
    fetchReceiptHeads()
    fetchFeeBills()
  }, [])

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
      console.log('terms: ', data)
      setTermList(data)

      // Initialize feeEntries with all terms set to 0 if not already set
      setFeeEntries((prevEntries) => {
        const updatedEntries = { ...prevEntries }
        data.forEach((term) => {
          if (!(term.id in updatedEntries)) {
            updatedEntries[term.id] = 0
          }
        })
        return updatedEntries
      })
    } catch (error) {
      console.error('Error fetching terms:', error)
    }
  }

  const fetchFeesClasses = async () => {
    try {
      const data = await apiService.getAll('fee-class-master/all')
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

  const fetchFeeBills = async () => {
    try {
      const data = await apiService.getAll('fees-bill/all')
      setFeeBills(data)
    } catch (error) {
      console.error('Error fetching fee bills:', error)
    }
  }

  const handleAmountChange = (termId, value) => {
    setFeeEntries((prevEntries) => ({
      ...prevEntries,
      [termId]: value ? parseInt(value) : 0,
    }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const feesData = {
      group: selectedGroup ? parseInt(selectedGroup) : null,
      feesClass: selectedFeesClass ? parseInt(selectedFeesClass) : null,
      receiptHead: selectedReceiptHead ? parseInt(selectedReceiptHead) : null,
      studentType,
      feeEntries,
    }

    console.log(feesData)

    try {
      if (editingFeeBill) {
        await apiService.update(`fees-bill/update/${editingFeeBill.id}`, feesData)
      } else {
        await apiService.create('fees-bill/add', feesData)
      }
      alert('Fees bill created successfully!')
      fetchFeeBills()
    } catch (error) {
      console.error('Error creating fees bill:', error)
    }
  }

  const handleEdit = (feeBill) => {
    console.log(feeBill)
    setEditingFeeBill(feeBill)
    setSelectedGroup(feeBill.groupId.toString())
    setSelectedFeesClass(feeBill.feesClassId.toString())
    setSelectedReceiptHead(feeBill.receiptHead.toString())
    setStudentType(feeBill.studentType)
    setFeeEntries(feeBill.feeEntries)
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
                        {feesClass.classEntity.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Receipt Head</CFormLabel>
                  <CFormSelect
                    value={selectedReceiptHead}
                    onChange={(e) => setSelectedReceiptHead(e.target.value)}
                  >
                    <option value="">Select Receipt Head</option>
                    {receiptHeads.map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.headName}
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
                <CCol xs={12}>
                  <strong>Fees Structure</strong>
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Term</CTableHeaderCell>
                        <CTableHeaderCell>Amount</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {termList.map((term) => (
                        <CTableRow key={term.id}>
                          <CTableDataCell>{term.name}</CTableDataCell>
                          <CTableDataCell>
                            <CFormInput
                              type="number"
                              value={feeEntries[term.id] ?? 0}
                              onChange={(e) => handleAmountChange(term.id, e.target.value)}
                            />
                          </CTableDataCell>
                        </CTableRow>
                      ))}
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
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Fees Bills</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Group</CTableHeaderCell>
                  <CTableHeaderCell>Fees Class</CTableHeaderCell>
                  <CTableHeaderCell>Student Type</CTableHeaderCell>
                  <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {feeBills.map((feeBill, index) => {
                  const groupName = groups.find((g) => g.id === feeBill.groupId)?.name || 'N/A'
                  const feesClassName =
                    feesClasses.find((fc) => fc.id === feeBill.feesClassId)?.classEntity.name ||
                    'N/A'
                  const receiptHeadName =
                    receiptHeads.find((fc) => fc.id === feeBill.receiptHead)?.headName || 'N/A'

                  return (
                    <CTableRow key={feeBill.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{groupName}</CTableDataCell>
                      <CTableDataCell>{feesClassName}</CTableDataCell>
                      <CTableDataCell>
                        {feeBill.studentType === 'new' ? 'New Student' : 'Old Student'}
                      </CTableDataCell>
                      <CTableDataCell>{receiptHeadName}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm" onClick={() => handleEdit(feeBill)}>
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateFeesBill
