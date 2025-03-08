import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormCheck,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi' // API service import

const ReceiptBookTitle = () => {
  const [receiptName, setReceiptName] = useState('')
  const [receiptType, setReceiptType] = useState('studentMaster')
  const [receiptBooks, setReceiptBooks] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchReceiptBooks()
  }, [])

  const fetchReceiptBooks = async () => {
    try {
      const data = await apiService.getAll('receipt-book/all')
      setReceiptBooks(data)
    } catch (error) {
      console.error('Error fetching receipt books:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!receiptName) return

    const newReceiptBook = { receiptName, receiptType }

    try {
      if (editingId !== null) {
        await apiService.update('receipt-book', editingId, newReceiptBook)
        setEditingId(null)
      } else {
        await apiService.create('receipt-book/add', newReceiptBook)
      }
      await fetchReceiptBooks()
      handleClear()
    } catch (error) {
      console.error('Error saving receipt book:', error)
    }
  }

  const handleEdit = (id) => {
    const receiptBookToEdit = receiptBooks.find((rb) => rb.id === id)
    if (receiptBookToEdit) {
      setReceiptName(receiptBookToEdit.title)
      setReceiptType(receiptBookToEdit.receiptType)
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`delete/${id}`)
      fetchReceiptBooks()
    } catch (error) {
      console.error('Error deleting receipt book:', error)
    }
  }

  const handleClear = () => {
    setReceiptName('')
    setReceiptType('studentMaster')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Receipt Book Title' : 'Add New Receipt Book Title'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="title">Title</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  placeholder="Enter Title"
                  value={receiptName}
                  onChange={(e) => setReceiptName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Receipt Type</CFormLabel>
                <div>
                  <CFormCheck
                    type="radio"
                    id="studentMaster"
                    label="Student Master"
                    value="studentMaster"
                    checked={receiptType === 'studentMaster'}
                    onChange={(e) => setReceiptType(e.target.value)}
                  />
                  <CFormCheck
                    type="radio"
                    id="advancedStudentAdmission"
                    label="Advanced Student Admission"
                    value="advancedStudentAdmission"
                    checked={receiptType === 'advancedStudentAdmission'}
                    onChange={(e) => setReceiptType(e.target.value)}
                  />
                </div>
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Receipt Book' : 'Add Receipt Book'}
              </CButton>
              {editingId && (
                <CButton color="secondary" className="ms-2" onClick={handleClear}>
                  Clear
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Receipt Book Titles</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Receipt Type</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {receiptBooks.map((rb) => (
                    <CTableRow key={rb.id}>
                      <CTableDataCell>{rb.receiptName}</CTableDataCell>
                      <CTableDataCell>
                        {rb.receiptType === 'studentMaster'
                          ? 'Student Master'
                          : 'Advanced Student Admission'}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(rb.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(rb.id)}>
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
      </CRow>
    </CRow>
  )
}

export default ReceiptBookTitle
