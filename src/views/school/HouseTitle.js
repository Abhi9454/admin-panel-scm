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

const initialHouse = [
  { id: 1, name: 'Green', sequence: 3 },
  { id: 2, name: 'Blue', sequence: 2 },
  { id: 3, name: 'Red', sequence: 4 },
]

const HouseTitle = () => {
  const [houseName, setHouseName] = useState('')
  const [sequence, setSequence] = useState('')
  const [houses, setHouses] = useState(initialHouse)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!houseName || !sequence) return

    if (editingId !== null) {
      setHouses(
        houses.map((hse) =>
          hse.id === editingId
            ? { id: editingId, name: houseName, sequence: parseInt(sequence) }
            : hse,
        ),
      )
      setEditingId(null)
    } else {
      const newHouse = {
        id: houses.length + 1,
        name: houseName,
        sequence: parseInt(sequence),
      }
      setHouses([...houses, newHouse])
    }

    setHouseName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const houseToEdit = houses.find((hse) => hse.id === id)
    if (houseToEdit) {
      setHouseName(houseToEdit.name)
      setSequence(houseToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setHouseName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit House' : 'Add New House'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="houseName">House Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="houseName"
                  placeholder="Enter House Name"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
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
                {editingId ? 'Update House' : 'Add House'}
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
              <strong>All Houses</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">House Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {houses.map((hse) => (
                    <CTableRow key={hse.id}>
                      <CTableDataCell>{hse.name}</CTableDataCell>
                      <CTableDataCell>{hse.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(hse.id)}>
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

export default HouseTitle
