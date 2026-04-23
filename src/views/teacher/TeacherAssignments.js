import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
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
} from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import teacherManagementApi from 'src/api/teacherManagementApi'
import masterApi from 'src/api/masterApi'

const EMPTY_FORM = {
  emp_code: '',
  class_id: '',
  section_id: '',
  subject_id: '',
  incharge: false,
}

const TeacherAssignments = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const empCodeFromState = location.state?.empCode || ''

  const [assignments, setAssignments] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterEmpCode, setFilterEmpCode] = useState(empCodeFromState)
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])

  // Modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [formSaving, setFormSaving] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [alert, setAlert] = useState(null)

  const perPage = 25

  useEffect(() => {
    loadDropdowns()
  }, [])

  useEffect(() => {
    fetchAssignments()
  }, [currentPage, filterEmpCode])

  const loadDropdowns = async () => {
    try {
      const [teacherData, classData, sectionData, subjectData] = await Promise.all([
        teacherManagementApi.getAll({ page_size: 200 }),
        masterApi.getAll('classes'),
        masterApi.getAll('sections'),
        teacherManagementApi.getSubjects(),
      ])
      setTeachers(teacherData.results || [])
      setClasses(classData.results || [])
      setSections(sectionData.results || [])
      setSubjects(subjectData.results || [])
    } catch (err) {
      console.error('Error loading dropdowns:', err)
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, page_size: perPage }
      if (filterEmpCode) params.emp_code = filterEmpCode
      const response = await teacherManagementApi.getAssignments(params)
      setAssignments(response.results || [])
      setTotalCount(response.count || 0)
    } catch (err) {
      console.error('Error fetching assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ ...EMPTY_FORM, emp_code: filterEmpCode })
    setModalVisible(true)
  }

  const handleOpenEdit = (assignment) => {
    setEditingId(assignment.id)
    setFormData({
      emp_code: assignment.emp_code,
      class_id: assignment.class_id,
      section_id: assignment.section_id,
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
        // Only incharge and subject_id are updatable
        await teacherManagementApi.updateAssignment(editingId, {
          subject_id: formData.subject_id || null,
          incharge: formData.incharge,
        })
        setAlert({ type: 'success', message: 'Assignment updated successfully.' })
      } else {
        await teacherManagementApi.createAssignment({
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
      const msg =
        err?.response?.status === 409
          ? 'This assignment already exists.'
          : 'Failed to save assignment.'
      setAlert({ type: 'danger', message: msg })
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
      await teacherManagementApi.deleteAssignment(deleteId)
      setAlert({ type: 'success', message: 'Assignment deleted.' })
      setDeleteConfirmVisible(false)
      fetchAssignments()
    } catch {
      setAlert({ type: 'danger', message: 'Failed to delete assignment.' })
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.ceil(totalCount / perPage)
  const startIndex = (currentPage - 1) * perPage

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center g-2">
              <CCol lg={3} md={6}>
                <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                  Teacher Assignments
                  <CBadge color="info" className="ms-2">
                    {totalCount}
                  </CBadge>
                </h6>
              </CCol>
              <CCol lg={4} md={5} sm={8}>
                <CFormSelect
                  size="sm"
                  value={filterEmpCode}
                  onChange={(e) => {
                    setFilterEmpCode(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.emp_code} value={t.emp_code}>
                      [{t.emp_code}] {t.emp_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol lg={6} md={2} sm={6} className="d-flex gap-2 justify-content-end">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={() => navigate('/teacher/all-teachers')}
                >
                  ← Back
                </CButton>
                <CButton size="sm" color="primary" onClick={handleOpenCreate}>
                  + New Assignment
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          {alert && (
            <div className="px-3 pt-2">
              <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </CAlert>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading assignments...</span>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No assignments found.</p>
              <CButton size="sm" color="primary" onClick={handleOpenCreate}>
                Create First Assignment
              </CButton>
            </div>
          ) : (
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable hover small className="mb-0">
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Emp Code
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Teacher
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Class
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Section
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Subject
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        Incharge
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {assignments.map((a) => (
                      <CTableRow key={a.id} className="align-middle">
                        <CTableDataCell className="py-2 px-3">
                          <span className="badge bg-light text-dark border">{a.emp_code}</span>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          <div className="fw-semibold">{a.teacher_name}</div>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">{a.class_title}</CTableDataCell>
                        <CTableDataCell className="py-2 px-3">{a.section_title}</CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          {a.subject_title ? (
                            <CBadge color="info">{a.subject_title}</CBadge>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          {a.incharge ? (
                            <CBadge color="success">Yes</CBadge>
                          ) : (
                            <CBadge color="secondary">No</CBadge>
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <CButton
                              color="warning"
                              size="sm"
                              onClick={() => handleOpenEdit(a)}
                              className="px-2 py-1"
                            >
                              Edit
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => handleDeleteConfirm(a.id)}
                              className="px-2 py-1"
                            >
                              Delete
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {totalPages > 1 && (
                <div className="border-top bg-light px-3 py-2">
                  <CRow className="align-items-center">
                    <CCol md={6}>
                      <small className="text-muted">
                        Showing {startIndex + 1}–{Math.min(startIndex + perPage, totalCount)} of{' '}
                        {totalCount}
                      </small>
                    </CCol>
                    <CCol md={6} className="text-md-end text-center">
                      <div className="btn-group btn-group-sm">
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        >
                          ««
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Prev
                        </CButton>
                        <CButton color="primary" disabled>
                          {currentPage} / {totalPages}
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          »»
                        </CButton>
                      </div>
                    </CCol>
                  </CRow>
                </div>
              )}
            </CCardBody>
          )}
        </CCard>
      </CCol>

      {/* Create / Edit Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editingId ? 'Edit Assignment' : 'New Teacher Assignment'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            <CRow className="g-2">
              {!editingId && (
                <>
                  <CCol md={4}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          Teacher<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      id="emp_code"
                      value={formData.emp_code}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Choose Teacher</option>
                      {teachers.map((t) => (
                        <option key={t.emp_code} value={t.emp_code}>
                          [{t.emp_code}] {t.emp_name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          Class<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      id="class_id"
                      value={formData.class_id}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Choose Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          Section<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      id="section_id"
                      value={formData.section_id}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Choose Section</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </>
              )}
              {editingId && (
                <CCol xs={12}>
                  <CAlert color="info" className="py-2">
                    <small>
                      <strong>Note:</strong> Teacher, Class, and Section cannot be changed. Only
                      Subject and Incharge status are editable.
                    </small>
                  </CAlert>
                </CCol>
              )}
              <CCol md={editingId ? 8 : 8}>
                <CFormSelect
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Subject (optional — leave blank for class teacher)"
                  id="subject_id"
                  value={formData.subject_id}
                  onChange={handleFormChange}
                >
                  <option value="">No specific subject (Class Teacher)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4} className="d-flex align-items-center">
                <CFormCheck
                  id="incharge"
                  label="Class Incharge"
                  checked={formData.incharge}
                  onChange={handleFormChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={formSaving}>
              {formSaving ? <CSpinner size="sm" className="me-1" /> : null}
              {editingId ? 'Update' : 'Create'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirm Modal */}
      <CModal visible={deleteConfirmVisible} onClose={() => setDeleteConfirmVisible(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this assignment? This cannot be undone.</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirmVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CSpinner size="sm" className="me-1" /> : null}
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default TeacherAssignments
