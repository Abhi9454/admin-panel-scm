import React, { useState } from 'react'
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

const initialProfession = [
  { id: 1, name: 'Doctor', sequence: 3 },
  { id: 2, name: 'Software Engineer', sequence: 2 },
  { id: 3, name: 'Politician', sequence: 4 },
  { id: 4, name: 'Contractor', sequence: 3 },
  { id: 5, name: 'Business Man', sequence: 2 },
  { id: 6, name: 'Government Service', sequence: 4 },
  { id: 7, name: 'Engineer', sequence: 3 },
]

const ParentProfession = () => {
  const [professionName, setProfessionName] = useState('')
  const [sequence, setSequence] = useState('')
  const [professions, setProfessions] = useState(initialProfession)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!professionName || !sequence) return

    if (editingId !== null) {
      setProfessions(
        professions.map((prof) =>
          prof.id === editingId ? { id: editingId, name: professionName, sequence: parseInt(sequence) } : prof
        )
      )
      setEditingId(null)
    } else {
      const newProfession = {
        id: professions.length + 1,
        name: professionName,
        sequence: parseInt(sequence),
      }
      setProfessions([...professions, newProfession])
    }

    setProfessionName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const professionToEdit = professions.find((prof) => prof.id === id)
    if (professionToEdit) {
      setProfessionName(professionToEdit.name)
      setSequence(professionToEdit.sequence.toString())
      setEditingId(id)
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
              <CButton color={editingId ? "warning" : "success"} type="submit">
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
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {professions.map((prof) => (
                    <CTableRow key={prof.id}>
                      <CTableDataCell>{prof.name}</CTableDataCell>
                      <CTableDataCell>{prof.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(prof.id)}>
                          Edit
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
