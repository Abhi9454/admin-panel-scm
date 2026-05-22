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
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CInputGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPencil, cilTrash, cilPlus, cilChevronLeft, cilChevronRight } from '@coreui/icons'
import staffManagementApi from 'src/api/staffManagementApi'

const Subject = () => {
  const [subjects, setSubjects] = useState([])
  const [formData, setFormData] = useState({ subject_title: '', subject_id: '', seq_order: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchSubjects()
  }, [page, searchQuery])

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await staffManagementApi.getSubjectTables({
        page,
        page_size: pageSize,
        search: searchQuery || undefined,
      })

      if (data && data.results !== undefined) {
        setSubjects(data.results)
        setTotalCount(data.count || 0)
      } else if (Array.isArray(data)) {
        setSubjects(data)
        setTotalCount(data.length)
      } else {
        setSubjects([])
        setTotalCount(0)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(searchTerm)
  }

  const handleSearchClear = () => {
    setSearchTerm('')
    setSearchQuery('')
    setPage(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    if (!formData.subject_title || !formData.subject_id || !formData.seq_order) {
      setFormError('All fields are required.')
      return
    }

    const payload = {
      subject_title: formData.subject_title,
      subject_id: parseInt(formData.subject_id, 10),
      seq_order: parseInt(formData.seq_order, 10),
    }

    try {
      if (editingId) {
        await staffManagementApi.updateSubjectTable(editingId, payload)
        setSuccessMessage('Subject updated successfully.')
      } else {
        await staffManagementApi.createSubjectTable(payload)
        setSuccessMessage('Subject created successfully.')
      }
      handleClear()
      fetchSubjects()
    } catch (err) {
      // Parse detailed error message if it's an object/array
      let errMsg = 'Failed to save subject.'
      if (err.response && err.response.data) {
        const data = err.response.data
        if (typeof data === 'object') {
          errMsg = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ')
        } else {
          errMsg = data
        }
      } else if (err.message) {
        errMsg = err.message
      }
      setFormError(errMsg)
    }
  }

  const handleEdit = (subject) => {
    setEditingId(subject.id)
    setFormData({
      subject_title: subject.subject_title || '',
      subject_id: subject.subject_id || '',
      seq_order: subject.seq_order || '',
    })
    setFormError(null)
    setSuccessMessage(null)
    // Scroll smoothly to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setFormError(null)
      setSuccessMessage(null)
      try {
        await staffManagementApi.deleteSubjectTable(id)
        setSuccessMessage('Subject deleted successfully.')
        fetchSubjects()
      } catch (err) {
        setError(err.message || 'Failed to delete subject.')
      }
    }
  }

  const handleClear = () => {
    setEditingId(null)
    setFormData({ subject_title: '', subject_id: '', seq_order: '' })
  }

  const totalPages = Math.ceil(totalCount / pageSize) || 1

  return (
    <CRow>
      {/* Subject Management Form */}
      <CCol xs={12} lg={4} className="mb-4">
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-primary text-white py-3">
            <h5 className="mb-0 d-flex align-items-center">
              <CIcon icon={cilPlus} className="me-2" />
              {editingId ? 'Edit Subject' : 'Add New Subject'}
            </h5>
          </CCardHeader>
          <CCardBody className="p-4">
            {formError && <CAlert color="danger" className="py-2 small">{formError}</CAlert>}
            {successMessage && <CAlert color="success" className="py-2 small">{successMessage}</CAlert>}
            
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="subject_title" className="small fw-semibold text-secondary">
                  Subject Name
                </CFormLabel>
                <CFormInput
                  type="text"
                  id="subject_title"
                  placeholder="e.g., Mathematics"
                  value={formData.subject_title}
                  onChange={handleInputChange}
                  className="py-2"
                  required
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="subject_id" className="small fw-semibold text-secondary">
                  Subject Code
                </CFormLabel>
                <CFormInput
                  type="number"
                  id="subject_id"
                  placeholder="e.g., 101"
                  value={formData.subject_id}
                  onChange={handleInputChange}
                  className="py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <CFormLabel htmlFor="seq_order" className="small fw-semibold text-secondary">
                  Sequence Order
                </CFormLabel>
                <CFormInput
                  type="number"
                  id="seq_order"
                  placeholder="e.g., 1"
                  value={formData.seq_order}
                  onChange={handleInputChange}
                  className="py-2"
                  required
                />
              </div>
              <div className="d-grid gap-2">
                <CButton color={editingId ? 'warning' : 'primary'} type="submit" className="py-2 text-white fw-semibold">
                  {editingId ? 'Update Subject' : 'Add Subject'}
                </CButton>
                {editingId && (
                  <CButton color="light" onClick={handleClear} className="py-2 border">
                    Cancel Edit
                  </CButton>
                )}
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Subject List & Search */}
      <CCol xs={12} lg={8} className="mb-4">
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-white border-bottom py-3">
            <CRow className="align-items-center g-3">
              <CCol sm={6}>
                <h5 className="mb-0 text-dark fw-bold">Curriculum Subjects</h5>
                <span className="text-muted small">Total Subjects: {totalCount}</span>
              </CCol>
              <CCol sm={6}>
                <CForm onSubmit={handleSearchSubmit}>
                  <CInputGroup>
                    <CFormInput
                      type="text"
                      placeholder="Search by subject title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-end-0"
                    />
                    <CButton type="submit" color="primary" variant="outline">
                      <CIcon icon={cilSearch} />
                    </CButton>
                    {searchQuery && (
                      <CButton type="button" color="secondary" variant="outline" onClick={handleSearchClear}>
                        Clear
                      </CButton>
                    )}
                  </CInputGroup>
                </CForm>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody className="p-0">
            {error && <div className="p-3"><CAlert color="danger">{error}</CAlert></div>}
            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <div className="text-muted mt-2 small">Loading curriculum subjects...</div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <CTable hover align="middle" className="mb-0">
                    <CTableHead className="table-light">
                      <CTableRow>
                        <CTableHeaderCell className="ps-4" scope="col">#</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Subject Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Subject Code</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Order</CTableHeaderCell>
                        <CTableHeaderCell className="text-end pe-4" scope="col">Actions</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {subjects.map((subject, index) => (
                        <CTableRow key={subject.id}>
                          <CTableHeaderCell className="ps-4" scope="row">
                            {(page - 1) * pageSize + index + 1}
                          </CTableHeaderCell>
                          <CTableDataCell className="fw-semibold text-dark">
                            {subject.subject_title}
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="badge bg-light text-dark border px-2 py-1">
                              {subject.subject_id}
                            </span>
                          </CTableDataCell>
                          <CTableDataCell>{subject.seq_order}</CTableDataCell>
                          <CTableDataCell className="text-end pe-4">
                            <CButton
                              color="link"
                              className="text-warning p-1 me-2"
                              title="Edit Subject"
                              onClick={() => handleEdit(subject)}
                            >
                              <CIcon icon={cilPencil} size="sm" />
                            </CButton>
                            <CButton
                              color="link"
                              className="text-danger p-1"
                              title="Delete Subject"
                              onClick={() => handleDelete(subject.id)}
                            >
                              <CIcon icon={cilTrash} size="sm" />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                      {subjects.length === 0 && (
                        <CTableRow>
                          <CTableDataCell colSpan={5} className="text-center py-5 text-muted">
                            No subjects found matching your query.
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                    <span className="small text-muted">
                      Showing {(page - 1) * pageSize + 1} to{' '}
                      {Math.min(page * pageSize, totalCount)} of {totalCount}
                    </span>
                    <CPagination className="mb-0">
                      <CPaginationItem
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CIcon icon={cilChevronLeft} size="sm" />
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={page === i + 1}
                          onClick={() => setPage(i + 1)}
                          style={{ cursor: 'pointer' }}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CIcon icon={cilChevronRight} size="sm" />
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Subject
