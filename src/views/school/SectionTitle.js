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

const SectionTitle = () => {
  const [sectionName, setSectionName] = useState('')
  const [sequence, setSequence] = useState('')
  const [sections, setSections] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('section/all')
      setSections(data)
    } catch (error) {
      console.error('Error fetching sections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!sectionName.trim() || !sequence.trim()) {
      alert('Please fill all fields')
      return
    }

    setSubmitting(true)
    const newSection = { name: sectionName.trim(), sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('section/update', editingId, newSection)
        setEditingId(null)
      } else {
        await apiService.create('section/add', newSection)
      }
      await fetchSections()
      handleClear()
    } catch (error) {
      console.error('Error saving section:', error)
      alert('Error saving section. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const sectionToEdit = sections.find((sec) => sec.id === id)
    if (sectionToEdit) {
      setSectionName(sectionToEdit.name)
      setSequence(sectionToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this section?')) return

    try {
      await apiService.delete(`section/delete/${id}`)
      await fetchSections()
    } catch (error) {
      console.error('Error deleting section:', error)
      alert('Error deleting section. Please try again.')
    }
  }

  const handleClear = () => {
    setSectionName('')
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
                <h6 className="mb-0 fw-bold text-primary">Section Management</h6>
                <small className="text-muted">Add, edit, and manage class sections</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{sections.length} Sections</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading sections...</span>
              </div>
            ) : (
              <CRow className="g-2">
                {/* Form Section */}
                <CCol lg={4} md={12} className="border-end">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingId ? '✏️ Edit Section' : '➕ Add New Section'}
                  </h6>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Section Name"
                          type="text"
                          id="sectionName"
                          placeholder="Enter section name (e.g., A, B, Alpha)"
                          value={sectionName}
                          onChange={(e) => setSectionName(e.target.value)}
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
                              'Update Section'
                            ) : (
                              'Add Section'
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
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    📚 All Sections
                  </h6>

                  {sections.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>📚</div>
                      <p className="mb-0">No sections added yet</p>
                      <small>Add your first section using the form</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Section Name
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
                          {sections
                            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                            .map((sec) => (
                              <CTableRow
                                key={sec.id}
                                className={`align-middle ${editingId === sec.id ? 'table-warning' : ''}`}
                              >
                                <CTableDataCell className="py-2 px-3">
                                  <div className="fw-semibold text-light">{sec.name}</div>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge color="secondary" className="text-white">
                                    #{sec.sequenceNumber}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3 text-center">
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="outline-warning"
                                      onClick={() => handleEdit(sec.id)}
                                      disabled={submitting}
                                      title="Edit section"
                                    >
                                      ✏️
                                    </CButton>
                                    <CButton
                                      color="outline-danger"
                                      onClick={() => handleDelete(sec.id)}
                                      disabled={submitting}
                                      title="Delete section"
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
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SectionTitle
