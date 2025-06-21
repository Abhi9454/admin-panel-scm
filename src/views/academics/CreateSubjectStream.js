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
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import apiService from '../../api/academicsManagementApi' // Import API service

const CreateProjectStream = () => {
  const [title, setTitle] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [availableSubjects, setAvailableSubjects] = useState([])
  const [currentSelectedSubject, setCurrentSelectedSubject] = useState('')
  const [projectStreams, setProjectStreams] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAvailableSubjects()
    fetchProjectStreams()
  }, [])

  const fetchAvailableSubjects = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('subject/all')
      setAvailableSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjectStreams = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('subject-stream/all')
      setProjectStreams(data)
    } catch (error) {
      console.error('Error fetching project streams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = () => {
    if (!currentSelectedSubject) return

    const subjectToAdd = availableSubjects.find(
      (subject) => subject.id === parseInt(currentSelectedSubject),
    )

    if (subjectToAdd && !selectedSubjects.find((s) => s.id === subjectToAdd.id)) {
      setSelectedSubjects([...selectedSubjects, subjectToAdd])
      setCurrentSelectedSubject('')
    }
  }

  const handleRemoveSubject = (subjectId) => {
    setSelectedSubjects(selectedSubjects.filter((subject) => subject.id !== subjectId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || selectedSubjects.length === 0) {
      alert('Please fill the title and add at least one subject')
      return
    }

    setLoading(true)
    const projectStreamData = {
      title: title,
      subjects: selectedSubjects.map((subject) => subject.id),
    }

    try {
      if (editingId !== null) {
        await apiService.update('subject-stream/update', editingId, projectStreamData)
        setEditingId(null)
      } else {
        await apiService.create('subject-stream/add', projectStreamData)
      }
      await fetchProjectStreams()
      handleClear()
    } catch (error) {
      console.error('Error saving project stream:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const streamToEdit = projectStreams.find((stream) => stream.id === id)
    if (streamToEdit) {
      setTitle(streamToEdit.title)
      // Assuming the API returns subjects array in the project stream object
      setSelectedSubjects(streamToEdit.subjects || [])
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project stream?')) {
      try {
        await apiService.delete(`subject-stream/delete/${id}`)
        fetchProjectStreams()
      } catch (error) {
        console.error('Error deleting project stream:', error)
      }
    }
  }

  const handleClear = () => {
    setTitle('')
    setSelectedSubjects([])
    setCurrentSelectedSubject('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Project Stream' : 'Add New Project Stream'}</strong>
          </CCardHeader>
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="title">Project Stream Title</CFormLabel>
                  <CFormInput
                    type="text"
                    id="title"
                    placeholder="Enter Project Stream Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="subjectSelect">Select Subject</CFormLabel>
                    <CFormSelect
                      id="subjectSelect"
                      value={currentSelectedSubject}
                      onChange={(e) => setCurrentSelectedSubject(e.target.value)}
                    >
                      <option value="">Choose a subject...</option>
                      {availableSubjects
                        .filter((subject) => !selectedSubjects.find((s) => s.id === subject.id))
                        .map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel>&nbsp;</CFormLabel>
                    <div>
                      <CButton
                        color="info"
                        onClick={handleAddSubject}
                        disabled={!currentSelectedSubject}
                        className="w-100"
                      >
                        Add Subject
                      </CButton>
                    </div>
                  </CCol>
                </CRow>

                {selectedSubjects.length > 0 && (
                  <div className="mb-3">
                    <CFormLabel>Selected Subjects</CFormLabel>
                    <CListGroup>
                      {selectedSubjects.map((subject) => (
                        <CListGroupItem
                          key={subject.id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span>{subject.name}</span>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleRemoveSubject(subject.id)}
                          >
                            Remove
                          </CButton>
                        </CListGroupItem>
                      ))}
                    </CListGroup>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <CButton
                    color={editingId ? 'warning' : 'success'}
                    type="submit"
                    disabled={loading}
                  >
                    {editingId ? 'Update Project Stream' : 'Create Project Stream'}
                  </CButton>
                  {editingId && (
                    <CButton color="secondary" onClick={handleClear}>
                      Cancel
                    </CButton>
                  )}
                </div>
              </CForm>
            </CCardBody>
          )}
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Project Streams</strong>
          </CCardHeader>
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Title</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Subjects</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {projectStreams.map((stream) => (
                    <CTableRow key={stream.id}>
                      <CTableDataCell>{stream.title}</CTableDataCell>
                      <CTableDataCell>
                        {stream.subjects && stream.subjects.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {stream.subjects.map((subject, index) => (
                              <CBadge key={index} color="primary">
                                {typeof subject === 'object' ? subject.name : subject}
                              </CBadge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">No subjects</span>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-2">
                          <CButton color="warning" size="sm" onClick={() => handleEdit(stream.id)}>
                            Edit
                          </CButton>
                          <CButton color="danger" size="sm" onClick={() => handleDelete(stream.id)}>
                            Delete
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {projectStreams.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan="3" className="text-center text-muted">
                        No project streams found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          )}
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CreateProjectStream
