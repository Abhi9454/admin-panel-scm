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

const initialCity = [
  { id: 1, name: 'Amritsar', sequence: 5 },
  { id: 2, name: 'Ludhiana', sequence: 6 },
]

const CityTitle = () => {
  const [cityName, setCityName] = useState('')
  const [sequence, setSequence] = useState('')
  const [cities, setCities] = useState(initialCity)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cityName || !sequence) return

    if (editingId !== null) {
      setCities(
        cities.map((city) =>
          city.id === editingId ? { id: editingId, name: cityName, sequence: parseInt(sequence) } : city
        )
      )
      setEditingId(null)
    } else {
      const newCity = {
        id: cities.length + 1,
        name: cityName,
        sequence: parseInt(sequence),
      }
      setCities([...cities, newCity])
    }

    setCityName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const cityToEdit = cities.find((city) => city.id === id)
    if (cityToEdit) {
      setCityName(cityToEdit.name)
      setSequence(cityToEdit.sequence.toString())
      setEditingId(id)
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
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {cities.map((city) => (
                    <CTableRow key={city.id}>
                      <CTableDataCell>{city.name}</CTableDataCell>
                      <CTableDataCell>{city.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(city.id)}>
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

export default CityTitle
