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
import apiService from '../../api/schoolManagementApi' // Import API service

const BusTitle = () => {
  const [busName, setBusName] = useState('')
  const [sequence, setSequence] = useState('')
  const [buses, setBuses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('bus/all')
      setBuses(data)
    } catch (error) {
      console.error('Error fetching buses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!busName || !sequence) return

    setLoading(true)
    const newBus = { name: busName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('bus/update', editingId, newBus)
        setEditingId(null)
      } else {
        await apiService.create('bus/add', newBus)
      }
      await fetchBuses()
      handleClear()
    } catch (error) {
      console.error('Error saving bus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const busToEdit = buses.find((bus) => bus.id === id)
    if (busToEdit) {
      setBusName(busToEdit.name)
      setSequence(busToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`bus/delete/${id}`)
      fetchBuses()
    } catch (error) {
      console.error('Error deleting bus:', error)
    }
  }

  const handleClear = () => {
    setBusName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Bus' : 'Add New Bus'}</strong>
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
                  <CFormLabel htmlFor="busName">Bus Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="busName"
                    placeholder="Enter Bus Name"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
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
                  {editingId ? 'Update Bus' : 'Add Bus'}
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
              <strong>All Buses</strong>
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
                      <CTableHeaderCell scope="col">Bus Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {buses.map((bus) => (
                      <CTableRow key={bus.id}>
                        <CTableDataCell>{bus.name}</CTableDataCell>
                        <CTableDataCell>{bus.sequenceNumber}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            className="me-2"
                            onClick={() => handleEdit(bus.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" onClick={() => handleDelete(bus.id)}>
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

export default BusTitle
