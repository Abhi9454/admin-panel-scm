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
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import accountManagementApi from '../../api/accountManagementApi'

const ReceiptHeadTitle = () => {
  const [formData, setFormData] = useState({
    receiptBookId: '',
    receiptHead: '',
    defaultValue: '',
    postAccount: '',
    advancePostAccount: '',
  })
  const [receiptHeadList, setReceiptHeadList] = useState([])
  const [receiptBookList, setReceiptBookList] = useState([])
  const [accountTitleList, setAccountTitleList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReceiptHead()
    fetchReceiptBooks()
    fetchAccountTitles()
  }, [])

  const fetchReceiptHead = async () => {
    try {
      const data = await apiService.getAll('receipt-head/all')
      setReceiptHeadList(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const fetchReceiptBooks = async () => {
    try {
      const data = await apiService.getAll('receipt-book/all')
      setReceiptBookList(data)
    } catch (error) {
      console.error('Error fetching receipt books:', error)
    }
  }

  const fetchAccountTitles = async () => {
    try {
      const data = await accountManagementApi.getAll('account-title/all')
      setAccountTitleList(data)
    } catch (error) {
      console.error('Error fetching account titles:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { receiptBookId, receiptHead, defaultValue, postAccount, advancePostAccount } = formData
    if (!receiptBookId || !receiptHead || !defaultValue || !postAccount || !advancePostAccount) {
      console.error('All fields are required!')
      return
    }

    setIsSubmitting(true)

    const newReceiptHead = {
      receiptBookId,
      receiptHead,
      defaultValue,
      postAccount,
      advancePostAccount,
    }

    try {
      if (editingId !== null) {
        await apiService.update('receipt-head', editingId, newReceiptHead)
        setEditingId(null)
      } else {
        await apiService.create('receipt-head/add', newReceiptHead)
      }
      await fetchReceiptHead()
      handleClear()
    } catch (error) {
      console.error('Error saving receipt head:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const receiptHeadToEdit = receiptHeadList.find((rb) => rb.id === id)
    if (receiptHeadToEdit) {
      setFormData({
        receiptBookId: receiptHeadToEdit.bookName?.id || '',
        receiptHead: receiptHeadToEdit.headName || '',
        defaultValue: receiptHeadToEdit.defaultValue || '',
        postAccount: receiptHeadToEdit.postAccount?.id || '',
        advancePostAccount: receiptHeadToEdit.advancedPostAccount?.id || '',
      })
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setFormData({
      receiptBookId: '',
      receiptHead: '',
      defaultValue: '',
      postAccount: '',
      advancePostAccount: '',
    })
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Receipt Head' : 'Add New Receipt Head'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormSelect
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Book Name<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    name="receiptBookId"
                    value={formData.receiptBookId}
                    onChange={handleChange}
                  >
                    <option value="">Select Book</option>
                    {receiptBookList.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.receiptName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Head Name<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="text"
                    name="receiptHead"
                    value={formData.receiptHead}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Default Value<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="text"
                    name="defaultValue"
                    value={formData.defaultValue}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Post Account<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    name="postAccount"
                    value={formData.postAccount}
                    onChange={handleChange}
                  >
                    <option value="">Select Account</option>
                    {accountTitleList.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Advance Post Account<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    name="advancePostAccount"
                    value={formData.advancePostAccount}
                    onChange={handleChange}
                  >
                    <option value="">Select Advance Account</option>
                    {accountTitleList.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CButton
                color={editingId ? 'warning' : 'success'}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CSpinner size="sm" /> Saving...
                  </>
                ) : editingId ? (
                  'Update Receipt Head'
                ) : (
                  'Add Receipt Head'
                )}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Receipt Head Titles</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Book Name</CTableHeaderCell>
                  <CTableHeaderCell>Head Name</CTableHeaderCell>
                  <CTableHeaderCell>Default Value</CTableHeaderCell>
                  <CTableHeaderCell>Post Account</CTableHeaderCell>
                  <CTableHeaderCell>Advance Post Account</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {receiptHeadList.map((rb) => (
                  <CTableRow key={rb.id}>
                    <CTableDataCell>{rb.bookName?.receiptName}</CTableDataCell>
                    <CTableDataCell>{rb.headName}</CTableDataCell>
                    <CTableDataCell>{rb.defaultValue}</CTableDataCell>
                    <CTableDataCell>{rb.postAccount?.name}</CTableDataCell>
                    <CTableDataCell>{rb.advancedPostAccount?.name}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" size="sm" onClick={() => handleEdit(rb.id)}>
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
    </CRow>
  )
}

export default ReceiptHeadTitle
