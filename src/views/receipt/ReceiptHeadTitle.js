import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
  CSpinner,
  CBadge,
  CButtonGroup,
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReceiptHead()
    fetchReceiptBooks()
    fetchAccountTitles()
  }, [])

  const fetchReceiptHead = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('receipt-head/all')
      setReceiptHeadList(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
      alert('Error loading receipt heads. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReceiptBooks = async () => {
    try {
      const data = await apiService.getAll('receipt-book/all')
      setReceiptBookList(data)
    } catch (error) {
      console.error('Error fetching receipt books:', error)
      alert('Error loading receipt books.')
    }
  }

  const fetchAccountTitles = async () => {
    try {
      const data = await accountManagementApi.getAll('account-title/all')
      setAccountTitleList(data)
    } catch (error) {
      console.error('Error fetching account titles:', error)
      alert('Error loading account titles.')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { receiptBookId, receiptHead, defaultValue, postAccount, advancePostAccount } = formData

    if (!receiptBookId || !receiptHead.trim() || !defaultValue.trim()) {
      alert('Please fill all required fields (Book Name, Head Name, and Default Value)')
      return
    }

    setIsSubmitting(true)

    const newReceiptHead = {
      receiptBookId,
      receiptHead: receiptHead.trim(),
      defaultValue: defaultValue.trim(),
      postAccount: postAccount || null,
      advancePostAccount: advancePostAccount || null,
    }

    try {
      if (editingId !== null) {
        await apiService.update('receipt-head', editingId, newReceiptHead)
        alert('Receipt head updated successfully!')
        setEditingId(null)
      } else {
        await apiService.create('receipt-head/add', newReceiptHead)
        alert('Receipt head added successfully!')
      }
      await fetchReceiptHead()
      handleClear()
    } catch (error) {
      console.error('Error saving receipt head:', error)
      alert('Error saving receipt head. Please try again.')
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

  // Get book name by ID
  const getBookName = (id) => {
    const book = receiptBookList.find((book) => book.id === parseInt(id))
    return book ? book.receiptName : ''
  }

  // Get account name by ID
  const getAccountName = (id) => {
    const account = accountTitleList.find((acc) => acc.id === parseInt(id))
    return account ? account.name : ''
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">🧾 Receipt Head Title Management</h6>
                <small className="text-muted">
                  Create and manage receipt head titles for different receipt books
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info" className="me-2">
                  {receiptBookList.length} Books
                </CBadge>
                <CBadge color="success">{receiptHeadList.length} Heads</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {/* Receipt Head Form */}
            <div className="mb-4">
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                {editingId ? '✏️ Edit Receipt Head Title' : '➕ Add New Receipt Head Title'}
              </h6>

              <CForm onSubmit={handleSubmit}>
                <CRow className="g-2">
                  <CCol lg={6} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          📚 Book Name<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      name="receiptBookId"
                      value={formData.receiptBookId}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Select receipt book</option>
                      {receiptBookList.map((book) => (
                        <option key={book.id} value={book.id}>
                          {book.receiptName}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol lg={6} md={6}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          📝 Head Name<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="text"
                      name="receiptHead"
                      value={formData.receiptHead}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter receipt head name"
                    />
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          💰 Default Value<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="text"
                      name="defaultValue"
                      value={formData.defaultValue}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Enter default value"
                    />
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel="🏦 Post Account"
                      name="postAccount"
                      value={formData.postAccount}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Select post account</option>
                      {accountTitleList.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel="🎯 Advance Post Account"
                      name="advancePostAccount"
                      value={formData.advancePostAccount}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Select advance account</option>
                      {accountTitleList.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                {/* Form Preview */}
                {formData.receiptBookId && formData.receiptHead && formData.defaultValue && (
                  <div className="mt-3 p-3 bg-light rounded-3 border">
                    <h6 className="text-muted fw-semibold mb-2">🔍 Receipt Head Preview</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <small className="text-muted d-block">Book:</small>
                        <span className="fw-semibold">{getBookName(formData.receiptBookId)}</span>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block">Head:</small>
                        <span className="fw-semibold">{formData.receiptHead}</span>
                      </div>
                      <div className="col-md-4">
                        <small className="text-muted d-block">Default Value:</small>
                        <CBadge color="primary" className="text-white">
                          {formData.defaultValue}
                        </CBadge>
                      </div>
                      {formData.postAccount && (
                        <div className="col-md-4">
                          <small className="text-muted d-block">Post Account:</small>
                          <span className="fw-semibold">
                            {getAccountName(formData.postAccount)}
                          </span>
                        </div>
                      )}
                      {formData.advancePostAccount && (
                        <div className="col-md-4">
                          <small className="text-muted d-block">Advance Account:</small>
                          <span className="fw-semibold">
                            {getAccountName(formData.advancePostAccount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 border-top pt-3 mt-3">
                  <CButton
                    color={editingId ? 'warning' : 'success'}
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || loading}
                    className="px-4"
                  >
                    {isSubmitting ? (
                      <>
                        <CSpinner size="sm" className="me-1" />
                        Saving...
                      </>
                    ) : editingId ? (
                      '✏️ Update Receipt Head'
                    ) : (
                      '💾 Add Receipt Head'
                    )}
                  </CButton>
                  {editingId && (
                    <CButton
                      color="outline-secondary"
                      size="sm"
                      onClick={handleClear}
                      disabled={isSubmitting}
                      className="px-4"
                    >
                      Cancel Edit
                    </CButton>
                  )}
                  <CButton
                    color="outline-info"
                    size="sm"
                    onClick={handleClear}
                    disabled={isSubmitting}
                    className="px-4"
                  >
                    Clear Form
                  </CButton>
                </div>
              </CForm>
            </div>

            {/* Receipt Head List Table */}
            <div>
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                📋 All Receipt Head Titles
              </h6>

              {loading ? (
                <div className="text-center py-4">
                  <CSpinner color="primary" size="sm" className="me-2" />
                  <span className="text-muted">Loading receipt head titles...</span>
                </div>
              ) : receiptHeadList.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div style={{ fontSize: '2rem' }}>🧾</div>
                  <p className="mb-0">No receipt head titles found</p>
                  <small>Add your first receipt head title using the form above</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover small className="mb-0">
                    <CTableHead className="table-light">
                      <CTableRow>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          📚 Book Name
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          📝 Head Name
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          💰 Default Value
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          🏦 Post Account
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          🎯 Advance Account
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                          Actions
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {receiptHeadList.map((rb) => (
                        <CTableRow
                          key={rb.id}
                          className={editingId === rb.id ? 'table-warning' : ''}
                        >
                          <CTableDataCell className="py-2 px-3">
                            <div className="fw-semibold text-muted">{rb.bookName}</div>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3">
                            <div className="fw-semibold">{rb.headName}</div>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3">
                            <CBadge color="primary" className="text-white">
                              {rb.defaultValue}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3">
                            {rb.postAccount?.name ? (
                              <span className="text-muted">{rb.postAccount.name}</span>
                            ) : (
                              <span className="text-muted small">Not set</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3">
                            {rb.advancedPostAccount?.name ? (
                              <span className="text-muted">{rb.advancedPostAccount.name}</span>
                            ) : (
                              <span className="text-muted small">Not set</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3 text-center">
                            <CButton
                              color="outline-warning"
                              size="sm"
                              onClick={() => handleEdit(rb.id)}
                              disabled={isSubmitting}
                              title="Edit receipt head"
                            >
                              ✏️
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}

                      {/* Summary Row */}
                      <CTableRow className="table-dark">
                        <CTableDataCell className="py-3 px-3 fw-bold" colSpan="5">
                          📊 Total Receipt Head Titles: {receiptHeadList.length}
                        </CTableDataCell>
                        <CTableDataCell className="py-3 px-3 text-center">
                          <CBadge color="success" className="text-white px-2 py-1">
                            Active
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ReceiptHeadTitle
