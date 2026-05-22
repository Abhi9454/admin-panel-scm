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
} from '@coreui/react'

const Subject = () => {
  const [subjects, setSubjects] = useState([])
  const [formData, setFormData] = useState({ subject_title: '', subject_id: '', seq_order: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)

  const API_URL = 'http://localhost:8000/api/subject-tables/'

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Failed to fetch subjects')
      }
      const data = await response.json()
      setSubjects(data.results || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData({ ...formData, [id]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!formData.subject_title || !formData.subject_id || !formData.seq_order) {
      setFormError('All fields are required.')
      return
    }

    const method = editingId ? 'PATCH' : 'POST'
    const url = editingId ? `${API_URL}${editingId}/` : API_URL

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_title: formData.subject_title,
          subject_id: parseInt(formData.subject_id, 10),
          seq_order: parseInt(formData.seq_order, 10),
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to save subject.')
      }

      await fetchSubjects()
      handleClear()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const handleEdit = (subject) => {
    setEditingId(subject.id)
    setFormData({
      subject_title: subject.subject_title,
      subject_id: subject.subject_id,
      seq_order: subject.seq_order,
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await fetch(`${API_URL}${id}/`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete subject.')
        }

        await fetchSubjects()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleClear = () => {
    setEditingId(null)
    setFormData({ subject_title: '', subject_id: '', seq_order: '' })
    setFormError(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Subject' : 'Add New Subject'}</strong>
          </CCardHeader>
          <CCardBody>
            {formError && <CAlert color="danger">{formError}</CAlert>}
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-3">
                <CCol md={4}>
                  <CFormLabel htmlFor="subject_title">Subject Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="subject_title"
                    placeholder="e.g., Mathematics"
                    value={formData.subject_title}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="subject_id">Subject Code</CFormLabel>
                  <CFormInput
                    type="number"
                    id="subject_id"
                    placeholder="e.g., 101"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="seq_order">Sequence Order</CFormLabel>
                  <CFormInput
                    type="number"
                    id="seq_order"
                    placeholder="e.g., 1"
                    value={formData.seq_order}
                    onChange={handleInputChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol>
                  <CButton color={editingId ? 'warning' : 'primary'} type="submit">
                    {editingId ? 'Update Subject' : 'Add Subject'}
                  </CButton>
                  <CButton color="secondary" className="ms-2" onClick={handleClear}>
                    Clear
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Subjects</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Subject Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Subject Code</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Order</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {subjects.map((subject, index) => (
                    <CTableRow key={subject.id}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{subject.subject_title}</CTableDataCell>
                      <CTableDataCell>{subject.subject_id}</CTableDataCell>
                      <CTableDataCell>{subject.seq_order}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(subject)}
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(subject.id)}
                        >
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {subjects.length === 0 && !loading && (
                    <CTableRow>
                      <CTableDataCell colSpan={5} className="text-center">
                        No subjects found.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Subject
