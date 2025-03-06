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
} from '@coreui/react'
import apiService from '../../api/school/schoolManagementApi' // Import the API service

const ClassTitle = () => {
  const [className, setClassName] = useState('')
  const [sequence, setSequence] = useState('')
  const [classes, setClasses] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await apiService.getAll('class/all') // Call API to get all classes
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!className || !sequence) return

    const newClass = { name: className, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('class/update', editingId, newClass) // Update existing class
        setEditingId(null)
      } else {
        await apiService.create('class/add', newClass) // Create new class
      }
      await fetchClasses() // Refresh list after API call
      handleClear()
    } catch (error) {
      console.error('Error saving class:', error)
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
    try {
      await apiService.delete(`class/delete/${id}`)
      fetchClasses() // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }

  const handleClear = () => {
    setClassName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Class' : 'Add New Class'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="className">Class Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  placeholder="Enter Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="sequence">Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  id="sequenceNumber"
                  placeholder="Enter Sequence Number"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                />
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Class' : 'Add Class'}
              </CButton>
              {editingId && (
                <CButton color="secondary" className="ms-2" onClick={handleClear}>
                  Clear
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Classes</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Class Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {classes.map((cls) => (
                    <CTableRow key={cls.id}>
                      <CTableDataCell>{cls.name}</CTableDataCell>
                      <CTableDataCell>{cls.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(cls.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(cls.id)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CRow>
  )
}

export default ClassTitle
