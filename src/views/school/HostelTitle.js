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
import apiService from '../../api/schoolManagementApi' // Import the API service

const HostelTitle = () => {
  const [hostelName, setHostelName] = useState('')
  const [sequence, setSequence] = useState('')
  const [hostels, setHostels] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    try {
      const data = await apiService.getAll('hostel/all') // Call API to get all hostels
      setHostels(data)
    } catch (error) {
      console.error('Error fetching hostels:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!hostelName || !sequence) return
    setLoading(true)
    const newHostel = { name: hostelName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('hostel/update', editingId, newHostel) // Update existing hostel
        setEditingId(null)
      } else {
        await apiService.create('hostel/add', newHostel) // Create new hostel
      }
      await fetchHostels() // Refresh list after API call
      handleClear()
    } catch (error) {
      console.error('Error saving hostel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const hostelToEdit = hostels.find((hst) => hst.id === id)
    if (hostelToEdit) {
      setHostelName(hostelToEdit.name)
      setSequence(hostelToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`hostel/delete/${id}`)
      fetchHostels() // Refresh list after deletion
    } catch (error) {
      console.error('Error deleting hostel:', error)
    }
  }

  const handleClear = () => {
    setHostelName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Hostel' : 'Add New Hostel'}</strong>
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
                  <CFormLabel htmlFor="hostelName">Hostel Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="hostelName"
                    placeholder="Enter Hostel Name"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
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
                  {editingId ? 'Update Hostel' : 'Add Hostel'}
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
              <strong>All Hostels</strong>
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
                      <CTableHeaderCell scope="col">Hostel Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {hostels.map((hst) => (
                      <CTableRow key={hst.id}>
                        <CTableDataCell>{hst.name}</CTableDataCell>
                        <CTableDataCell>{hst.sequenceNumber}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            className="me-2"
                            onClick={() => handleEdit(hst.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" onClick={() => handleDelete(hst.id)}>
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

export default HostelTitle
