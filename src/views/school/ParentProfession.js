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
import apiService from '../../api/school/schoolManagementApi' // Import API service

const ParentProfession = () => {
  const [professionName, setProfessionName] = useState('')
  const [sequence, setSequence] = useState('')
  const [professions, setProfessions] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchProfessions()
  }, [])

  const fetchProfessions = async () => {
    try {
      const data = await apiService.getAll('profession/all')
      setProfessions(data)
    } catch (error) {
      console.error('Error fetching professions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!professionName || !sequence) return

    const newProfession = { name: professionName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('profession/update', editingId, newProfession)
        setEditingId(null)
      } else {
        await apiService.create('profession/add', newProfession)
      }
      await fetchProfessions()
      handleClear()
    } catch (error) {
      console.error('Error saving profession:', error)
    }
  }

  const handleEdit = (id) => {
    const professionToEdit = professions.find((prof) => prof.id === id)
    if (professionToEdit) {
      setProfessionName(professionToEdit.name)
      setSequence(professionToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`profession/delete/${id}`)
      fetchProfessions()
    } catch (error) {
      console.error('Error deleting profession:', error)
    }
  }

  const handleClear = () => {
    setProfessionName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Profession' : 'Add New Profession'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="professionName">Profession Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="professionName"
                  placeholder="Enter Profession Name"
                  value={professionName}
                  onChange={(e) => setProfessionName(e.target.value)}
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
                {editingId ? 'Update Profession' : 'Add Profession'}
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
              <strong>All Professions</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Profession Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {professions.map((prof) => (
                    <CTableRow key={prof.id}>
                      <CTableDataCell>{prof.name}</CTableDataCell>
                      <CTableDataCell>{prof.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(prof.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(prof.id)}>
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

export default ParentProfession
