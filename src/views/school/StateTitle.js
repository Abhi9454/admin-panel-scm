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

const StateTitle = () => {
  const [stateName, setStateName] = useState('')
  const [sequence, setSequence] = useState('')
  const [states, setStates] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchStates()
  }, [])

  const fetchStates = async () => {
    try {
      const data = await apiService.getAll('state/all') // Call API to get all states
      setStates(data)
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stateName || !sequence) return

    const newState = { name: stateName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('state/update', editingId, newState) // Update existing state
        setEditingId(null)
      } else {
        await apiService.create('state/add', newState) // Create new state
      }
      await fetchStates() // Refresh list after API call
      handleClear()
    } catch (error) {
      console.error('Error saving state:', error)
    }
  }

  const handleEdit = (id) => {
    const stateToEdit = states.find((st) => st.id === id)
    if (stateToEdit) {
      setStateName(stateToEdit.name)
      setSequence(stateToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`state/delete/${id}`)
      fetchStates() // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting state:', error)
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
                <CFormLabel htmlFor="stateName">State Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="stateName"
                  placeholder="Enter State Name"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
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
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {states.map((st) => (
                    <CTableRow key={st.id}>
                      <CTableDataCell>{st.name}</CTableDataCell>
                      <CTableDataCell>{st.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(st.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(st.id)}>
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

export default StateTitle
