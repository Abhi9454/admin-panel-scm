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
import apiService from '../../api/schoolManagementApi' // Import API service

const CityTitle = () => {
  const [cityName, setCityName] = useState('')
  const [sequence, setSequence] = useState('')
  const [cities, setCities] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const data = await apiService.getAll('city/all')
      setCities(data)
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cityName || !sequence) return

    const newCity = { name: cityName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('city/update', editingId, newCity)
        setEditingId(null)
      } else {
        await apiService.create('city/add', newCity)
      }
      await fetchCities()
      handleClear()
    } catch (error) {
      console.error('Error saving city:', error)
    }
  }

  const handleEdit = (id) => {
    const cityToEdit = cities.find((city) => city.id === id)
    if (cityToEdit) {
      setCityName(cityToEdit.name)
      setSequence(cityToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`city/delete/${id}`)
      fetchCities()
    } catch (error) {
      console.error('Error deleting city:', error)
    }
  }

  const handleClear = () => {
    setCityName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit City' : 'Add New City'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="cityName">City Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="cityName"
                  placeholder="Enter City Name"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
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
                {editingId ? 'Update City' : 'Add City'}
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
              <strong>All Cities</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">City Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {cities.map((city) => (
                    <CTableRow key={city.id}>
                      <CTableDataCell>{city.name}</CTableDataCell>
                      <CTableDataCell>{city.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(city.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(city.id)}>
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

export default CityTitle
