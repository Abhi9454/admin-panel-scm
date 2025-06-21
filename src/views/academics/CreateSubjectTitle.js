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
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/academicsManagementApi' // Import API service

const CreateSubjectTitle = () => {
  const [subjectName, setSubjectName] = useState('')
  const [sequence, setSequence] = useState('')
  const [subjects, setSubjects] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjectTitle()
  }, [])

  const fetchSubjectTitle = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('subject/all')
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!subjectName || !sequence) return
    setLoading(true)
    const newCity = { name: subjectName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('subject/update', editingId, newCity)
        setEditingId(null)
      } else {
        await apiService.create('subject/add', newCity)
      }
      await fetchSubjectTitle()
      handleClear()
    } catch (error) {
      console.error('Error saving subject:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const subjectToEdit = subjects.find((city) => city.id === id)
    if (subjectToEdit) {
      setSubjectName(subjectToEdit.name)
      setSequence(subjectToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`subject/delete/${id}`)
      fetchSubjectTitle()
    } catch (error) {
      console.error('Error deleting city:', error)
    }
  }

  const handleClear = () => {
    setSubjectName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Subject Title' : 'Add New Subject'}</strong>
          </CCardHeader>
          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="cityName">Subject Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="subjectName"
                    placeholder="Enter Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <CFormLabel htmlFor="sequence">Sequence Number</CFormLabel>
                  <CFormInput
                    type="number"
                    id="sequence"
                    placeholder="Enter Sequence Number"
                    value={sequence}
                    onChange={(e) => setSequence(e.target.value)}
                  />
                </div>
                <CButton color={editingId ? 'warning' : 'success'} type="submit">
                  {editingId ? 'Update Subject' : 'Add Subject'}
                </CButton>
                {editingId && (
                  <CButton color="secondary" className="ms-2" onClick={handleClear}>
                    Clear
                  </CButton>
                )}
              </CForm>
            </CCardBody>
          )}
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Subjects</strong>
            </CCardHeader>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading data...</p>
              </div>
            ) : (
              <CCardBody>
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Subject Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {subjects.map((sub) => (
                      <CTableRow key={sub.id}>
                        <CTableDataCell>{sub.name}</CTableDataCell>
                        <CTableDataCell>{sub.sequenceNumber}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            className="me-2"
                            onClick={() => handleEdit(sub.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" onClick={() => handleDelete(sub.id)}>
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            )}
          </CCard>
        </CCol>
      </CRow>
    </CRow>
  )
}

export default CreateSubjectTitle
