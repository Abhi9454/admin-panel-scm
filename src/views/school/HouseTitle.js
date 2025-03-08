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

const HouseTitle = () => {
  const [houseName, setHouseName] = useState('')
  const [sequence, setSequence] = useState('')
  const [houses, setHouses] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      const data = await apiService.getAll('house/all') // Call API to get all houses
      setHouses(data)
    } catch (error) {
      console.error('Error fetching houses:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!houseName || !sequence) return

    const newHouse = { name: houseName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('house/update', editingId, newHouse) // Update existing house
        setEditingId(null)
      } else {
        await apiService.create('house/add', newHouse) // Create new house
      }
      await fetchHouses() // Refresh list after API call
      handleClear()
    } catch (error) {
      console.error('Error saving house:', error)
    }
  }

  const handleEdit = (id) => {
    const houseToEdit = houses.find((hse) => hse.id === id)
    if (houseToEdit) {
      setHouseName(houseToEdit.name)
      setSequence(houseToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`house/delete/${id}`) // Delete house API call
      fetchHouses() // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting house:', error)
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
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {houses.map((hse) => (
                    <CTableRow key={hse.id}>
                      <CTableDataCell>{hse.name}</CTableDataCell>
                      <CTableDataCell>{hse.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(hse.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(hse.id)}>
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

export default HouseTitle
