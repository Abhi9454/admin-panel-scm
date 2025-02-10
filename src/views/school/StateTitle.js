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

const initialState = [
  { id: 1, name: 'Punjab', sequence: 5 },
  { id: 2, name: 'Delhi', sequence: 6 },
  { id: 3, name: 'Uttar Pradesh', sequence: 6 },
]

const StateTitle = () => {
  const [stateName, setStateName] = useState('')
  const [sequence, setSequence] = useState('')
  const [states, setStates] = useState(initialState)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!stateName || !sequence) return

    if (editingId !== null) {
      setStates(
        states.map((st) =>
          st.id === editingId ? { id: editingId, name: stateName, sequence: parseInt(sequence) } : st
        )
      )
      setEditingId(null)
    } else {
      const newState = {
        id: states.length + 1,
        name: stateName,
        sequence: parseInt(sequence),
      }
      setStates([...states, newState])
    }

    setStateName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const stateToEdit = states.find((st) => st.id === id)
    if (stateToEdit) {
      setStateName(stateToEdit.name)
      setSequence(stateToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setStateName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit State' : 'Add New State'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>State Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter State Name"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Sequence Number"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                />
              </div>
              <CButton color={editingId ? "warning" : "success"} type="submit">
                {editingId ? 'Update State' : 'Add State'}
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
              <strong>All States</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">State Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {states.map((st) => (
                    <CTableRow key={st.id}>
                      <CTableDataCell>{st.name}</CTableDataCell>
                      <CTableDataCell>{st.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(st.id)}>
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

export default StateTitle
