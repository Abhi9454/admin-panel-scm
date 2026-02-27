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
import masterApi from '../../api/masterApi'

const RESOURCE = 'classes'

const ClassTitle = () => {
  const [title, setTitle] = useState('')
  const [seqOrder, setSeqOrder] = useState('')
  const [classes, setClasses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const data = await masterApi.getAll(RESOURCE)
      setClasses(data.results || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !seqOrder.toString().trim()) {
      alert('Please fill all fields')
      return
    }

    setSubmitting(true)
    const payload = { title: title.trim(), seq_order: parseInt(seqOrder) }

    try {
      if (editingId !== null) {
        await masterApi.update(RESOURCE, editingId, payload)
        setEditingId(null)
      } else {
        await masterApi.create(RESOURCE, payload)
      }
      await fetchClasses()
      handleClear()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error saving class. Please try again.'
      alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const item = classes.find((c) => c.id === id)
    if (item) {
      setTitle(item.title)
      setSeqOrder(item.seq_order.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return
    try {
      await masterApi.delete(RESOURCE, id)
      await fetchClasses()
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error deleting class. It may be in use.'
      alert(msg)
    }
  }

  const handleClear = () => {
    setTitle('')
    setSeqOrder('')
    setEditingId(null)
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Class Management</h6>
                <small className="text-muted">Add, edit, and manage school classes</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{classes.length} Classes</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading classes...</span>
              </div>
            ) : (
              <CRow className="g-2">
                {/* Form Section */}
                <CCol lg={4} md={12} className="border-end">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingId ? 'Edit Class' : 'Add New Class'}
                  </h6>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Class Name"
                          type="text"
                          placeholder="Enter class name"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-3"
                          floatingLabel="Sequence Order"
                          type="number"
                          placeholder="Enter sequence number for ordering"
                          value={seqOrder}
                          onChange={(e) => setSeqOrder(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <div className="d-flex gap-2">
                          <CButton
                            color={editingId ? 'warning' : 'success'}
                            type="submit"
                            size="sm"
                            disabled={submitting}
                            className="flex-grow-1"
                          >
                            {submitting ? (
                              <>
                                <CSpinner size="sm" className="me-1" />
                                {editingId ? 'Updating...' : 'Adding...'}
                              </>
                            ) : editingId ? (
                              'Update Class'
                            ) : (
                              'Add Class'
                            )}
                          </CButton>
                          {editingId && (
                            <CButton
                              color="outline-secondary"
                              size="sm"
                              onClick={handleClear}
                              disabled={submitting}
                            >
                              Cancel
                            </CButton>
                          )}
                        </div>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCol>

                {/* Table Section */}
                <CCol lg={8} md={12}>
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">All Classes</h6>

                  {classes.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <p className="mb-0">No classes added yet</p>
                      <small>Add your first class using the form</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Class Name
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Seq Order
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                              Actions
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {[...classes]
                            .sort((a, b) => a.seq_order - b.seq_order)
                            .map((cls) => (
                              <CTableRow
                                key={cls.id}
                                className={`align-middle ${editingId === cls.id ? 'table-warning' : ''}`}
                              >
                                <CTableDataCell className="py-2 px-3">
                                  <div className="fw-semibold">{cls.title}</div>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge color="secondary">#{cls.seq_order}</CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3 text-center">
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="outline-warning"
                                      onClick={() => handleEdit(cls.id)}
                                      disabled={submitting}
                                      title="Edit"
                                    >
                                      Edit
                                    </CButton>
                                    <CButton
                                      color="outline-danger"
                                      onClick={() => handleDelete(cls.id)}
                                      disabled={submitting}
                                      title="Delete"
                                    >
                                      Delete
                                    </CButton>
                                  </CButtonGroup>
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  )}
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ClassTitle
