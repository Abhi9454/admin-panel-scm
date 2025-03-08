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
import apiService from '../../api/receiptManagementApi' // API service import
import schoolManagementApi from '../../api/schoolManagementApi'

const CreateFeesBill = () => {
  const [selectedTerm, setSelectedTerm] = useState('Admission')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedFeesClass, setSelectedFeesClass] = useState('')
  const [groups, setGroups] = useState([])
  const [feesClasses, setFeesClasses] = useState([])
  const [dueDate, setDueDate] = useState('')
  const [studentType, setStudentType] = useState('new')
  const [receiptHeads, setReceiptHeads] = useState([])
  const [feeEntries, setFeeEntries] = useState({})

  useEffect(() => {
    fetchGroups()
    fetchFeesClasses()
    fetchReceiptHeads()
  }, [])

  const fetchGroups = async () => {
    try {
      const data = await schoolManagementApi.getAll('group/all')
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
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
      const data = await apiService.getAll('receipt-heads/all')
      setReceiptHeads(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const handleAddReceiptHead = (head) => {
    if (!selectedFeesClass) {
      alert('Please select a Fees Class first!')
      return
    }
    setFeeEntries({
      ...feeEntries,
      [selectedFeesClass]: {
        ...(feeEntries[selectedFeesClass] || {}),
        [head.id]: '',
      },
    })
  }

  const handleRemoveReceiptHead = (feesClassId, headId) => {
    const updatedFees = { ...feeEntries }
    delete updatedFees[feesClassId][headId]
    if (Object.keys(updatedFees[feesClassId]).length === 0) {
      delete updatedFees[feesClassId] // Remove class if no heads left
    }
    setFeeEntries(updatedFees)
  }

  const handleAmountChange = (feesClassId, headId, value) => {
    setFeeEntries({
      ...feeEntries,
      [feesClassId]: {
        ...(feeEntries[feesClassId] || {}),
        [headId]: value,
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const feesData = {
      term: selectedTerm,
      group: selectedGroup,
      feesClass: selectedFeesClass,
      dueDate,
      studentType,
      feeEntries,
    }

    try {
      await apiService.create('fees-bill/create', feesData)
      alert('Fees bill created successfully!')
    } catch (error) {
      console.error('Error creating fees bill:', error)
    }
  }

  return (
    <CRow>
      {/* Header Section */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Create Fees Bill</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                {/* Term Dropdown */}
                <CCol md={3}>
                  <CFormLabel>Term</CFormLabel>
                  <CFormSelect
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {[
                      'Admission',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                      'January',
                      'February',
                      'March',
                    ].map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                {/* Group Dropdown */}
                <CCol md={3}>
                  <CFormLabel>Group</CFormLabel>
                  <CFormSelect
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.name}>
                        {group.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                {/* Fees Class Dropdown */}
                <CCol md={3}>
                  <CFormLabel>Fees Class</CFormLabel>
                  <CFormSelect
                    value={selectedFeesClass}
                    onChange={(e) => setSelectedFeesClass(e.target.value)}
                  >
                    <option value="">Select Fees Class</option>
                    {feesClasses.map((feesClass) => (
                      <option key={feesClass.id} value={feesClass.id}>
                        {feesClass.classEntity.name +
                          ' | ' +
                          feesClass.section?.name +
                          ' | ' +
                          feesClass.group.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                {/* Due Date */}
                <CCol md={3}>
                  <CFormLabel>Due Date</CFormLabel>
                  <CFormInput
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </CCol>
              </CRow>

              {/* Fees Structure Table */}
              <CRow className="mt-3">
                <CCol md={4} className="border-end">
                  <strong>Receipt Heads</strong>
                  <ul className="list-group mt-2">
                    {receiptHeads.map((head) => (
                      <li key={head.id} className="list-group-item">
                        {head.name}
                        <CButton
                          size="sm"
                          color="primary"
                          className="float-end"
                          onClick={() => handleAddReceiptHead(head)}
                        >
                          Add
                        </CButton>
                      </li>
                    ))}
                  </ul>
                </CCol>

                <CCol md={8}>
                  <strong>Fees Structure</strong>
                  {Object.keys(feeEntries).map((feesClassId) => (
                    <div key={feesClassId} className="mt-3">
                      <h6>Fees Class: {feesClasses.find((c) => c.id === feesClassId)?.name}</h6>
                      <CTable hover>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                            <CTableHeaderCell>Amount</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {Object.keys(feeEntries[feesClassId]).map((headId) => {
                            const head = receiptHeads.find((h) => h.id === headId)
                            return (
                              <CTableRow key={headId}>
                                <CTableDataCell>{head.name}</CTableDataCell>
                                <CTableDataCell>
                                  <CFormInput
                                    type="number"
                                    value={feeEntries[feesClassId][headId]}
                                    onChange={(e) =>
                                      handleAmountChange(feesClassId, headId, e.target.value)
                                    }
                                  />
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CButton
                                    size="sm"
                                    color="danger"
                                    onClick={() => handleRemoveReceiptHead(feesClassId, headId)}
                                  >
                                    Remove
                                  </CButton>
                                </CTableDataCell>
                              </CTableRow>
                            )
                          })}
                        </CTableBody>
                      </CTable>
                    </div>
                  ))}
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateFeesBill
