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
import apiService from '../../api/schoolManagementApi' // Import the API service

const SectionTitle = () => {
  const [sectionName, setSectionName] = useState('')
  const [sequence, setSequence] = useState('')
  const [sections, setSections] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const data = await apiService.getAll('section/all') // Call API to get all sections
      setSections(data)
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!sectionName || !sequence) return

    const newSection = { name: sectionName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('section/update', editingId, newSection) // Update existing section
        setEditingId(null)
      } else {
        await apiService.create('section/add', newSection) // Create new section
      }
      await fetchSections() // Refresh list after API call
      handleClear()
    } catch (error) {
      console.error('Error saving section:', error)
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
    try {
      await apiService.delete(`section/delete/${id}`)
      fetchSections() // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleClear = () => {
    setSectionName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Section' : 'Add New Section'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="sectionName">Section Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  placeholder="Enter Section Name"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
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
                {editingId ? 'Update Section' : 'Add Section'}
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
              <strong>All Sections</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Section Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sections.map((sec) => (
                    <CTableRow key={sec.id}>
                      <CTableDataCell>{sec.name}</CTableDataCell>
                      <CTableDataCell>{sec.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(sec.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(sec.id)}>
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

export default SectionTitle
