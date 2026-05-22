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
} from '@coreui/react'

const TeacherAssignment = () => {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [alert, setAlert] = useState(null)

  // Dropdown data
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])

  // Modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [formSaving, setFormSaving] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const API_BASE_URL = 'http://localhost:8000/api'

  useEffect(() => {
    fetchAssignments()
    loadDropdowns()
  }, [])

  const fetchAssignments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teacher-assignments/`)
      if (!response.ok) throw new Error('Failed to fetch assignments')
      const data = await response.json()
      setAssignments(data.results || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadDropdowns = async () => {
    try {
      // Replace with actual API calls to fetch teachers, classes, etc.
      // For now, using placeholder data or assuming they are available from another source.
      // Example:
      // const teachersRes = await fetch(`${API_BASE_URL}/staff/`);
      // setTeachers(await teachersRes.json());
    } catch (err) {
      console.error('Error loading dropdowns:', err)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      emp_code: '',
      class_id: '',
      section_id: '',
      subject_id: '',
      incharge: false,
    })
    setModalVisible(true)
  }

  const handleOpenEdit = (assignment) => {
    setEditingId(assignment.id)
    setFormData({
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

    const url = editingId
      ? `${API_BASE_URL}/admin/teacher-assignments/${editingId}/`
      : `${API_BASE_URL}/admin/teacher-assignments/`
    const method = editingId ? 'PATCH' : 'POST'

    const body = editingId
      ? {
          subject_id: formData.subject_id ? Number(formData.subject_id) : null,
          incharge: formData.incharge,
        }
      : {
          emp_code: Number(formData.emp_code),
          class_id: Number(formData.class_id),
          section_id: Number(formData.section_id),
          subject_id: formData.subject_id ? Number(formData.subject_id) : null,
          incharge: formData.incharge,
        }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer <admin_token>' // Add auth token
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to save assignment.')
      }

      setAlert({ type: 'success', message: `Assignment ${editingId ? 'updated' : 'created'} successfully.` })
      setModalVisible(false)
      fetchAssignments()
    } catch (err) {
      setAlert({ type: 'danger', message: err.message })
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
      const response = await fetch(`${API_BASE_URL}/admin/teacher-assignments/${deleteId}/`, {
        method: 'DELETE',
        headers: {
          // 'Authorization': 'Bearer <admin_token>' // Add auth token
        },
      })

      if (response.status !== 204) {
        throw new Error('Failed to delete assignment.')
      }

      setAlert({ type: 'success', message: 'Assignment deleted.' })
      setDeleteConfirmVisible(false)
      fetchAssignments()
    } catch (err) {
      setAlert({ type: 'danger', message: err.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Teacher Assignments</strong>
            <CButton color="primary" onClick={handleOpenCreate}>
              + New Assignment
            </CButton>
          </CCardHeader>
          <CCardBody>
            {alert && <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>{alert.message}</CAlert>}
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center"><CSpinner /></div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Subject</th>
                    <th className="text-center">Incharge</th>
                    <th className="text-center">Actions</th>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {assignments.map((a) => (
                    <CTableRow key={a.id}>
                      <CTableDataCell>{a.teacher_name} ({a.emp_code})</CTableDataCell>
                      <CTableDataCell>{a.class_title}</CTableDataCell>
                      <CTableDataCell>{a.section_title}</CTableDataCell>
                      <CTableDataCell>
                        {a.subject_title ? <CBadge color="info">{a.subject_title}</CBadge> : <span className="text-muted">—</span>}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {a.incharge ? <CBadge color="success">Yes</CBadge> : <CBadge color="secondary">No</CBadge>}
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CButton color="warning" size="sm" className="me-2" onClick={() => handleOpenEdit(a)}>Edit</CButton>
                        <CButton color="danger" size="sm" onClick={() => handleDeleteConfirm(a.id)}>Delete</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Create/Edit Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{editingId ? 'Edit Assignment' : 'New Assignment'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSave}>
          <CModalBody>
            {editingId && <CAlert color="info">Only Subject and Incharge status can be updated.</CAlert>}
            {!editingId && (
              <>
                <CFormSelect id="emp_code" label="Teacher" value={formData.emp_code} onChange={handleFormChange} required className="mb-3">
                  <option value="">Choose Teacher...</option>
                  {/* Populate teachers dynamically */}
                </CFormSelect>
                <CFormSelect id="class_id" label="Class" value={formData.class_id} onChange={handleFormChange} required className="mb-3">
                  <option value="">Choose Class...</option>
                  {/* Populate classes dynamically */}
                </CFormSelect>
                <CFormSelect id="section_id" label="Section" value={formData.section_id} onChange={handleFormChange} required className="mb-3">
                  <option value="">Choose Section...</option>
                  {/* Populate sections dynamically */}
                </CFormSelect>
              </>
            )}
            <CFormSelect id="subject_id" label="Subject (Optional)" value={formData.subject_id} onChange={handleFormChange} className="mb-3">
              <option value="">No specific subject</option>
              {/* Populate subjects dynamically */}
            </CFormSelect>
            <CFormCheck id="incharge" label="Class Incharge" checked={formData.incharge} onChange={handleFormChange} />
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={formSaving}>
              {formSaving ? <CSpinner size="sm" /> : (editingId ? 'Update' : 'Create')}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Delete Confirm Modal */}
      <CModal visible={deleteConfirmVisible} onClose={() => setDeleteConfirmVisible(false)}>
        <CModalHeader>Confirm Delete</CModalHeader>
        <CModalBody>Are you sure you want to delete this assignment?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteConfirmVisible(false)}>Cancel</CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <CSpinner size="sm" /> : 'Delete'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default TeacherAssignment
