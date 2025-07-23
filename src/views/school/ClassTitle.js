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
import apiService from '../../api/schoolManagementApi'

const ClassTitle = () => {
  const [className, setClassName] = useState('')
  const [sequence, setSequence] = useState('')
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
      const data = await apiService.getAll('class/all')
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!className.trim() || !sequence.trim()) {
      alert('Please fill all fields')
      return
    }

    setSubmitting(true)
    const newClass = { name: className.trim(), sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('class/update', editingId, newClass)
        setEditingId(null)
      } else {
        await apiService.create('class/add', newClass)
      }
      await fetchClasses()
      handleClear()
    } catch (error) {
      console.error('Error saving class:', error)
      alert('Error saving class. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const classToEdit = classes.find((cls) => cls.id === id)
    if (classToEdit) {
      setClassName(classToEdit.name)
      setSequence(classToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      await apiService.delete(`class/delete/${id}`)
      await fetchClasses()
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Error deleting class. Please try again.')
    }
  }

  const handleClear = () => {
    setClassName('')
    setSequence('')
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
                    {editingId ? '✏️ Edit Class' : '➕ Add New Class'}
                  </h6>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Class Name"
                          type="text"
                          id="className"
                          placeholder="Enter class name"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-3"
                          floatingLabel="Sequence Number"
                          type="number"
                          id="sequence"
                          placeholder="Enter sequence number for ordering"
                          value={sequence}
                          onChange={(e) => setSequence(e.target.value)}
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
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">🎓 All Classes</h6>

                  {classes.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>🎓</div>
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
                              Sequence
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                              Actions
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {classes
                            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                            .map((cls) => (
                              <CTableRow
                                key={cls.id}
                                className={`align-middle ${editingId === cls.id ? 'table-warning' : ''}`}
                              >
                                <CTableDataCell className="py-2 px-3">
                                  <div className="fw-semibold text-light">{cls.name}</div>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge color="secondary" className="text-white">
                                    #{cls.sequenceNumber}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3 text-center">
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="outline-warning"
                                      onClick={() => handleEdit(cls.id)}
                                      disabled={submitting}
                                      title="Edit class"
                                    >
                                      ✏️
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
