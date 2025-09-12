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
  CFormCheck,
  CSpinner,
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'

const ReceiptBookTitle = () => {
  const [receiptName, setReceiptName] = useState('')
  const [receiptType, setReceiptType] = useState('studentMaster')
  const [receiptBooks, setReceiptBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchReceiptBooks()
  }, [])

  const fetchReceiptBooks = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('receipt-book/all')
      setReceiptBooks(data)
    } catch (error) {
      console.error('Error fetching receipt books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!receiptName.trim()) {
      alert('Please enter receipt book title')
      return
    }

    setSubmitting(true)
    const newReceiptBook = { receiptName: receiptName.trim(), receiptType }

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
      alert('Error saving receipt book. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const receiptBookToEdit = receiptBooks.find((rb) => rb.id === id)
    if (receiptBookToEdit) {
      setReceiptName(receiptBookToEdit.receiptName || receiptBookToEdit.title)
      setReceiptType(receiptBookToEdit.receiptType)
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this receipt book?')) return

    try {
      await apiService.delete(`delete/${id}`)
      await fetchReceiptBooks()
    } catch (error) {
      console.error('Error deleting receipt book:', error)
      alert('Error deleting receipt book. Please try again.')
    }
  }

  const handleClear = () => {
    setReceiptName('')
    setReceiptType('studentMaster')
    setEditingId(null)
  }

  const getReceiptTypeColor = (type) => {
    return type === 'studentMaster' ? 'info' : 'warning'
  }

  const getReceiptTypeIcon = (type) => {
    return type === 'studentMaster' ? '👨‍🎓' : '🎓'
  }

  const getReceiptTypeLabel = (type) => {
    console.log(type)
    return type === 'studentMaster' ? 'Student Master' : 'Advanced Student Admission'
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Receipt Book Management</h6>
                <small className="text-muted">Add, edit, and manage receipt book titles</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{receiptBooks.length} Receipt Books</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading && receiptBooks.length === 0 ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading receipt books...</span>
              </div>
            ) : (
              <>
                {/* Form Section - Full Width */}
                <div className="mb-4">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingId ? '✏️ Edit Receipt Book' : '➕ Add New Receipt Book'}
                  </h6>

                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      {/* Receipt Book Title */}
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-3"
                          floatingLabel={
                            <>
                              📋 Receipt Book Title<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          type="text"
                          id="receiptName"
                          placeholder="Enter receipt book title (e.g., Fee Receipt, Transport Fee)"
                          value={receiptName}
                          onChange={(e) => setReceiptName(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>

                      {/* Receipt Type */}
                      <CCol xs={12}>
                        <div className="mb-3">
                          <h6 className="text-muted fw-semibold mb-2">🏷️ Receipt Type</h6>
                          <div className="d-flex gap-4">
                            <CFormCheck
                              type="radio"
                              id="studentMaster"
                              label={
                                <span className="d-flex align-items-center">
                                  👨‍🎓 <span className="ms-2">Student Master</span>
                                </span>
                              }
                              value="studentMaster"
                              checked={receiptType === 'studentMaster'}
                              onChange={(e) => setReceiptType(e.target.value)}
                              disabled={submitting}
                            />
                            <CFormCheck
                              type="radio"
                              id="advancedStudentAdmission"
                              label={
                                <span className="d-flex align-items-center">
                                  🎓 <span className="ms-2">Advanced Student Admission</span>
                                </span>
                              }
                              value="advancedStudentAdmission"
                              checked={receiptType === 'advancedStudentAdmission'}
                              onChange={(e) => setReceiptType(e.target.value)}
                              disabled={submitting}
                            />
                          </div>
                        </div>
                      </CCol>
                    </CRow>

                    <div className="d-flex gap-2 border-top pt-3">
                      <CButton
                        color={editingId ? 'warning' : 'success'}
                        type="submit"
                        size="sm"
                        disabled={submitting}
                        className="px-4"
                      >
                        {submitting ? (
                          <>
                            <CSpinner size="sm" className="me-1" />
                            {editingId ? 'Updating...' : 'Adding...'}
                          </>
                        ) : editingId ? (
                          'Update Receipt Book'
                        ) : (
                          'Add Receipt Book'
                        )}
                      </CButton>
                      {editingId && (
                        <CButton
                          color="outline-secondary"
                          size="sm"
                          onClick={handleClear}
                          disabled={submitting}
                          className="px-4"
                        >
                          Cancel
                        </CButton>
                      )}
                    </div>
                  </CForm>
                </div>

                {/* Table Section - Full Width Below Form */}
                <div>
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    📚 All Receipt Books
                  </h6>

                  {loading && receiptBooks.length > 0 ? (
                    <div className="text-center py-2 mb-3">
                      <CSpinner size="sm" className="me-2" />
                      <small className="text-muted">Refreshing receipt books...</small>
                    </div>
                  ) : null}

                  {receiptBooks.length === 0 && !loading ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>📚</div>
                      <p className="mb-0">No receipt books added yet</p>
                      <small>Add your first receipt book using the form above</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Receipt Book Title
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Receipt Type
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                              Actions
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {receiptBooks.map((rb) => (
                            <CTableRow
                              key={rb.id}
                              className={`align-middle ${editingId === rb.id ? 'table-warning' : ''}`}
                            >
                              <CTableDataCell className="py-2 px-3">
                                <div className="fw-semibold text-muted">
                                  {rb.receiptName || rb.title}
                                </div>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3">
                                <CBadge
                                  color={getReceiptTypeColor(rb.receiptTitle)}
                                  className="text-white"
                                >
                                  {getReceiptTypeIcon(rb.receiptTitle)}{' '}
                                  {getReceiptTypeLabel(rb.receiptTitle)}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-center">
                                <CButtonGroup size="sm">
                                  <CButton
                                    color="outline-warning"
                                    onClick={() => handleEdit(rb.id)}
                                    disabled={submitting}
                                    title="Edit receipt book"
                                  >
                                    ✏️
                                  </CButton>
                                  <CButton
                                    color="outline-danger"
                                    onClick={() => handleDelete(rb.id)}
                                    disabled={submitting}
                                    title="Delete receipt book"
                                  >
                                    🗑️
                                  </CButton>
                                </CButtonGroup>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  )}
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ReceiptBookTitle
