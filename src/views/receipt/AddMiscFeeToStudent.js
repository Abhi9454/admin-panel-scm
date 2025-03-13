import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormSelect,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const AddMiscFeeToStudent = () => {
  const location = useLocation()
  const studentRegistrationNumber = location.state?.registrationNumber || ''

  const [selectedReceiptHead, setSelectedReceiptHead] = useState('')
  const [receiptHeads, setReceiptHeads] = useState([])
  const [termList, setTermList] = useState([])
  const [miscFeesList, setMiscFeeList] = useState([])
  const [feeEntries, setFeeEntries] = useState({})
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    fetchReceiptHeads()
    fetchTerms()
    fetchStudentMiscFees()
  }, [])

  const fetchReceiptHeads = async () => {
    try {
      const data = await apiService.getAll('receipt-head/all')
      setReceiptHeads(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const fetchStudentMiscFees = async () => {
    try {
      const data = await apiService.getAll('create-misc-fee/add-misc-fee-student/all')
      setMiscFeeList(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const fetchTerms = async () => {
    try {
      const data = await schoolManagementApi.getAll('term/all')
      setTermList(data)
      setFeeEntries(
        data.reduce((acc, term) => {
          acc[term.id] = 0
          return acc
        }, {}),
      )
    } catch (error) {
      console.error('Error fetching terms:', error)
    }
  }

  const handleAmountChange = (termId, value) => {
    setFeeEntries((prev) => ({ ...prev, [parseInt(termId)]: value ? parseInt(value) : 0 }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const miscFeeData = {
      registrationNumber: studentRegistrationNumber,
      receiptHead: parseInt(selectedReceiptHead), // Sending ID instead of name
      feeEntries,
    }

    try {
      if (editId) {
        console.log('This is updated data ' + miscFeeData.feeEntries)
        await receiptManagementApi.update(
          `create-misc-fee/add-misc-fee-student/update/${editId}`,
          miscFeeData,
        )
        alert('Successfully updated data')
      } else {
        await receiptManagementApi.create('create-misc-fee/add-misc-fee-student/add', miscFeeData)
        alert('Successfully Added data')
      }
      fetchStudentMiscFees()
      handleClear()
    } catch (error) {
      console.error('Error submitting:', error)
    }
  }

  const handleEdit = (fee) => {
    setEditId(fee.id)
    setSelectedReceiptHead(fee.receiptHead) // Setting ID instead of name
    setFeeEntries(fee.feeEntries)
  }

  const handleClear = () => {
    setEditId(null)
    setSelectedReceiptHead('')
    setFeeEntries(termList.reduce((acc, term) => ({ ...acc, [term.id]: 0 }), {}))
  }

  const handleDelete = async () => {
    try {
      await receiptManagementApi.remove(`create-misc-fee/delete/${deleteId}`)
      fetchStudentMiscFees()
      setDeleteModal(false)
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const getReceiptHeadName = (id) => {
    const head = receiptHeads.find((head) => head.id === id)
    return head ? head.headName : 'Unknown'
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Miscellaneous Fee</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CCol md={6} className="mb-3">
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

              <CCol xs={12} className="mb-3">
                <strong>Fee Entries</strong>
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
                          <input
                            type="number"
                            value={feeEntries[term.id]}
                            onChange={(e) => handleAmountChange(term.id, e.target.value)}
                          />
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCol>

              <CButton className="mt-3 me-2" color="success" type="submit">
                {editId ? 'Update' : 'Add'} Misc Fee
              </CButton>
              <CButton className="mt-3" color="secondary" onClick={handleClear}>
                Clear
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Miscellaneous Fees List</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {miscFeesList.map((fee) => (
                  <CTableRow key={fee.id}>
                    <CTableDataCell>{getReceiptHeadName(fee.receiptHead)}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" size="sm" onClick={() => handleEdit(fee)}>
                        Edit
                      </CButton>{' '}
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => {
                          setDeleteId(fee.id)
                          setDeleteModal(true)
                        }}
                      >
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>Confirm Delete</CModalHeader>
        <CModalBody>Are you sure you want to delete this entry?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AddMiscFeeToStudent
