import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CAlert,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilFilter, cilX, cilCheck } from '@coreui/icons'
import staffManagementApi from 'src/api/staffManagementApi'
import masterApi from 'src/api/masterApi'

const EMPTY_FORM = {
  emp_code: '',
  class_id: '',
  section_id: '',
  subject_id: '',
  incharge: false,
}

const TeacherAssignment = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [alert, setAlert] = useState(null)

  // Dropdown lists
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])

  // Filter States
  const [filterTeacher, setFilterTeacher] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterIncharge, setFilterIncharge] = useState('')

  // Modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formSaving, setFormSaving] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadDropdowns()
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [filterTeacher, filterClass, filterSection, filterSubject, filterIncharge])

  const loadDropdowns = async () => {
    try {
      const [teachersRes, classesRes, sectionsRes, subjectsRes] = await Promise.all([
        staffManagementApi.getAll({ page_size: 1000 }),
        masterApi.getAll('classes'),
        masterApi.getAll('sections'),
        staffManagementApi.getSubjects(),
      ])

      setTeachers(teachersRes.results || teachersRes || [])
      setClasses(classesRes.results || classesRes || [])
      setSections(sectionsRes.results || sectionsRes || [])
      setSubjects(subjectsRes.results || subjectsRes || [])
    } catch (err) {
      console.error('Error loading dropdowns:', err)
      setAlert({ type: 'danger', message: 'Failed to load dropdown filters and choices.' })
    }
  }

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (filterTeacher) params.emp_code = filterTeacher
      if (filterClass) params.class_id = filterClass
      if (filterSection) params.section_id = filterSection
      if (filterSubject) params.subject_id = filterSubject
      if (filterIncharge !== '') params.incharge = filterIncharge

      const data = await staffManagementApi.getAssignments(params)
      setAssignments(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch teacher assignments.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setModalVisible(true)
  }

  const handleOpenEdit = (assignment) => {
    setEditingId(assignment.id)
    setFormData({
      emp_code: assignment.emp_code || '',
      class_id: assignment.class_id || '',
      section_id: assignment.section_id || '',
      subject_id: assignment.subject_id || '',
      incharge: assignment.incharge || false,
    })
    setModalVisible(true)
  }

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormSaving(true)
    setAlert(null)

    try {
      if (editingId) {
        // PATCH only allows updating subject_id and incharge
        await staffManagementApi.updateAssignment(editingId, {
          subject_id: formData.subject_id ? Number(formData.subject_id) : null,
          incharge: formData.incharge,
        })
        setAlert({ type: 'success', message: 'Assignment updated successfully.' })
      } else {
        // POST creates a new assignment
        await staffManagementApi.createAssignment({
          emp_code: Number(formData.emp_code),
          class_id: Number(formData.class_id),
          section_id: Number(formData.section_id),
          subject_id: formData.subject_id ? Number(formData.subject_id) : null,
          incharge: formData.incharge,
        })
        setAlert({ type: 'success', message: 'Assignment created successfully.' })
      }
      setModalVisible(false)
      fetchAssignments()
    } catch (err) {
      let errMsg = 'Failed to save assignment.'
      if (err.response && err.response.status === 409) {
        errMsg = 'Assignment already exists for this teacher, class, section, and subject.'
      } else if (err.response && err.response.data) {
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
      setAlert({ type: 'danger', message: errMsg })
    } finally {
      setFormSaving(false)
    }
  }

  const handleDeleteConfirm = (id) => {
    setDeleteId(id)
    setDeleteConfirmVisible(true)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await staffManagementApi.deleteAssignment(deleteId)
      setAlert({ type: 'success', message: 'Assignment deleted successfully.' })
      setDeleteConfirmVisible(false)
      fetchAssignments()
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to delete assignment.' })
    } finally {
      setDeleting(false)
    }
  }

  const handleResetFilters = () => {
    setFilterTeacher('')
    setFilterClass('')
    setFilterSection('')
    setFilterSubject('')
    setFilterIncharge('')
  }

  return (
    <CRow>
      {/* Search and Filters Bar */}
      <CCol xs={12} className="mb-4">
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-light py-3 border-bottom-0 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-dark fw-bold d-flex align-items-center">
              <CIcon icon={cilFilter} className="me-2 text-primary" />
              Filter & Search Assignments
            </h5>
            {(filterTeacher || filterClass || filterSection || filterSubject || filterIncharge !== '') && (
              <CButton color="link" className="text-decoration-none text-danger p-0" onClick={handleResetFilters}>
                <CIcon icon={cilX} className="me-1" />
                Reset Filters
              </CButton>
            )}
          </CCardHeader>
          <CCardBody className="pt-2 pb-4">
            <CRow className="g-3">
              <CCol md={3}>
                <CFormLabel className="small fw-semibold text-secondary">Filter by Teacher</CFormLabel>
                <CFormSelect size="sm" value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
                  <option value="">All Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.emp_code} value={t.emp_code}>
                      {t.emp_name} ({t.emp_code})
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small fw-semibold text-secondary">Filter by Class</CFormLabel>
                <CFormSelect size="sm" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small fw-semibold text-secondary">Filter by Section</CFormLabel>
                <CFormSelect size="sm" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                  <option value="">All Sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel className="small fw-semibold text-secondary">Filter by Subject</CFormLabel>
                <CFormSelect size="sm" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                  <option value="">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.subject_id} value={sub.subject_id}>
                      {sub.subject_title}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small fw-semibold text-secondary">Class Incharge</CFormLabel>
                <CFormSelect size="sm" value={filterIncharge} onChange={(e) => setFilterIncharge(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </CFormSelect>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Main Table List */}
      <CCol xs={12}>
        <CCard className="shadow-sm border-0">
          <CCardHeader className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-dark fw-bold">Teacher Class/Subject Assignments</h5>
              <span className="text-muted small">Total Assignments: {assignments.length}</span>
            </div>
            <CButton color="primary" className="fw-semibold px-3 py-2 text-white" onClick={handleOpenCreate}>
              <CIcon icon={cilPlus} className="me-1" />
              Assign Teacher
            </CButton>
          </CCardHeader>
          <CCardBody className="p-0">
            {alert && (
              <div className="p-3">
                <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>
                  {alert.message}
                </CAlert>
              </div>
            )}
            {error && (
              <div className="p-3">
                <CAlert color="danger">{error}</CAlert>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <div className="text-muted mt-2 small">Loading teacher assignments...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover align="middle" className="mb-0">
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="ps-4">Emp Code</CTableHeaderCell>
                      <CTableHeaderCell>Teacher Name</CTableHeaderCell>
                      <CTableHeaderCell>Class</CTableHeaderCell>
                      <CTableHeaderCell>Section</CTableHeaderCell>
                      <CTableHeaderCell>Assigned Subject</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Attendance Incharge</CTableHeaderCell>
                      <CTableHeaderCell className="text-end pe-4">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {assignments.map((assignment) => (
                      <CTableRow key={assignment.id}>
                        <CTableDataCell className="ps-4">
                          <span className="badge bg-light text-dark border px-2 py-1">
                            {assignment.emp_code}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="fw-semibold text-dark">
                          {assignment.teacher_name}
                        </CTableDataCell>
                        <CTableDataCell>{assignment.class_title}</CTableDataCell>
                        <CTableDataCell>{assignment.section_title}</CTableDataCell>
                        <CTableDataCell>
                          {assignment.subject_title ? (
                            <span className="badge bg-primary text-white px-2 py-1">
                              {assignment.subject_title}
                            </span>
                          ) : (
                            <span className="badge bg-secondary text-white px-2 py-1 text-uppercase">
                              Class Teacher
                            </span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {assignment.incharge ? (
                            <CBadge color="success" shape="rounded-pill" className="px-2 py-1">
                              Yes
                            </CBadge>
                          ) : (
                            <CBadge color="light" className="text-muted border px-2 py-1">
                              No
                            </CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end pe-4">
                          <CButton
                            color="link"
                            className="text-warning p-1 me-2"
                            title="Edit Assignment"
                            onClick={() => handleOpenEdit(assignment)}
                          >
                            <CIcon icon={cilPencil} size="sm" />
                          </CButton>
                          <CButton
                            color="link"
                            className="text-danger p-1"
                            title="Delete Assignment"
                            onClick={() => handleDeleteConfirm(assignment.id)}
                          >
                            <CIcon icon={cilTrash} size="sm" />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {assignments.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center py-5 text-muted">
                          No assignments found matching the active filters.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Create / Edit Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" backdrop="static">
        <CModalHeader className="bg-light">
          <CModalTitle className="fw-bold">{editingId ? 'Edit Assignment Details' : 'New Teacher Assignment'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody className="p-4">
            {editingId && (
              <CAlert color="info" className="py-2 small">
                <strong>Notice:</strong> The Teacher, Class, and Section are read-only when updating. Only the assigned Subject and attendance Incharge status can be changed.
              </CAlert>
            )}
            <CRow className="g-3">
              {!editingId ? (
                <>
                  <CCol md={6}>
                    <CFormLabel htmlFor="emp_code" className="small fw-semibold text-secondary">
                      Select Teacher
                    </CFormLabel>
                    <CFormSelect id="emp_code" value={formData.emp_code} onChange={handleFormChange} required>
                      <option value="">Choose Teacher...</option>
                      {teachers.map((t) => (
                        <option key={t.emp_code} value={t.emp_code}>
                          {t.emp_name} ({t.emp_code})
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel htmlFor="class_id" className="small fw-semibold text-secondary">
                      Select Class
                    </CFormLabel>
                    <CFormSelect id="class_id" value={formData.class_id} onChange={handleFormChange} required>
                      <option value="">Choose Class...</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel htmlFor="section_id" className="small fw-semibold text-secondary">
                      Select Section
                    </CFormLabel>
                    <CFormSelect id="section_id" value={formData.section_id} onChange={handleFormChange} required>
                      <option value="">Choose Section...</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </>
              ) : (
                <>
                  <CCol md={6}>
                    <CFormLabel className="small fw-semibold text-secondary">Teacher</CFormLabel>
                    <CFormSelect disabled value={formData.emp_code}>
                      {teachers.map((t) => (
                        <option key={t.emp_code} value={t.emp_code}>
                          {t.emp_name} ({t.emp_code})
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel className="small fw-semibold text-secondary">Class</CFormLabel>
                    <CFormSelect disabled value={formData.class_id}>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={3}>
                    <CFormLabel className="small fw-semibold text-secondary">Section</CFormLabel>
                    <CFormSelect disabled value={formData.section_id}>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </>
              )}
              <CCol md={8}>
                <CFormLabel htmlFor="subject_id" className="small fw-semibold text-secondary">
                  Assigned Subject <span className="text-muted">(Optional)</span>
                </CFormLabel>
                <CFormSelect id="subject_id" value={formData.subject_id || ''} onChange={handleFormChange}>
                  <option value="">No specific subject (Assigned as Class Teacher)</option>
                  {subjects.map((sub) => (
                    <option key={sub.subject_id} value={sub.subject_id}>
                      {sub.subject_title}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4} className="d-flex align-items-end pb-2">
                <CFormCheck
                  id="incharge"
                  label="Attendance Incharge"
                  checked={formData.incharge}
                  onChange={handleFormChange}
                  className="fw-semibold text-dark"
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className="bg-light">
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={formSaving} className="text-white fw-semibold">
              {formSaving ? <CSpinner size="sm" className="me-1" /> : <CIcon icon={cilCheck} className="me-1" />}
              {editingId ? 'Save Changes' : 'Create Assignment'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirm Modal */}
      <CModal visible={deleteConfirmVisible} onClose={() => setDeleteConfirmVisible(false)}>
        <CModalHeader className="bg-danger text-white">
          <CModalTitle className="fw-bold">Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <h6>Are you absolutely sure you want to delete this teacher assignment?</h6>
          <p className="text-muted small mb-0">This operation cannot be undone. The teacher will lose access to teaching activities for this class / section pair.</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirmVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" className="text-white fw-semibold" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CSpinner size="sm" className="me-1" /> : null}
            Yes, Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default TeacherAssignment
