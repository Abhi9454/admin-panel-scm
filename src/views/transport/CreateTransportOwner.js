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
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi' // Import API service for cities and states
import transportApi from '../../api/transportManagementApi' // Import API service for transport owners

const CreateTransportOwner = () => {
  const [ownerName, setOwnerName] = useState('')
  const [address, setAddress] = useState('')
  const [cityId, setCityId] = useState('')
  const [stateId, setStateId] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [officeNumber, setOfficeNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [emailId, setEmailId] = useState('')

  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [transportOwners, setTransportOwners] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)

  useEffect(() => {
    fetchCities()
    fetchStates()
    fetchTransportOwners()
  }, [])

  const fetchCities = async () => {
    try {
      const data = await apiService.getAll('city/all')
      setCities(data)
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchStates = async () => {
    try {
      const data = await apiService.getAll('state/all')
      setStates(data)
    } catch (error) {
      console.error('Error fetching states:', error)
    }
  }

  const fetchTransportOwners = async () => {
    try {
      setLoading(true)
      const data = await transportApi.getAll('transport-owner/all')
      setTransportOwners(data)
    } catch (error) {
      console.error('Error fetching transport owners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!ownerName) return

    setLoading(true)
    const transportOwnerData = {
      ownerName,
      address,
      cityId: cityId ? parseInt(cityId) : null,
      stateId: stateId ? parseInt(stateId) : null,
      mobileNumber,
      officeNumber,
      panNumber,
      emailId,
    }

    try {
      if (editingId !== null) {
        await transportApi.update('transport-owner/update', editingId, transportOwnerData)
        setEditingId(null)
      } else {
        await transportApi.create('transport-owner/add', transportOwnerData)
      }
      await fetchTransportOwners()
      handleClear()
    } catch (error) {
      console.error('Error saving transport owner:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const ownerToEdit = transportOwners.find((owner) => owner.id === id)
    if (ownerToEdit) {
      setOwnerName(ownerToEdit.ownerName)
      setAddress(ownerToEdit.address || '')
      setCityId(ownerToEdit.cityId ? ownerToEdit.cityId.toString() : '')
      setStateId(ownerToEdit.stateId ? ownerToEdit.stateId.toString() : '')
      setMobileNumber(ownerToEdit.mobileNumber || '')
      setOfficeNumber(ownerToEdit.officeNumber || '')
      setPanNumber(ownerToEdit.panNumber || '')
      setEmailId(ownerToEdit.emailId || '')
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await transportApi.delete(`transport-owner/delete/${id}`)
      fetchTransportOwners()
    } catch (error) {
      console.error('Error deleting transport owner:', error)
    }
  }

  const handleView = (id) => {
    const ownerToView = transportOwners.find((owner) => owner.id === id)
    if (ownerToView) {
      setSelectedOwner(ownerToView)
      setViewModalVisible(true)
    }
  }

  const handleClear = () => {
    setOwnerName('')
    setAddress('')
    setCityId('')
    setStateId('')
    setMobileNumber('')
    setOfficeNumber('')
    setPanNumber('')
    setEmailId('')
    setEditingId(null)
  }

  const getCityName = (cityId) => {
    const city = cities.find((c) => c.id === cityId)
    return city ? city.name : ''
  }

  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId)
    return state ? state.name : ''
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Transport Owner' : 'Add New Transport Owner'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="ownerName">
                      Owner Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="ownerName"
                      placeholder="Enter Owner Name"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="address">Address</CFormLabel>
                    <CFormInput
                      type="text"
                      id="address"
                      placeholder="Enter Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="city">City</CFormLabel>
                    <CFormSelect
                      id="city"
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value)}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="state">State</CFormLabel>
                    <CFormSelect
                      id="state"
                      value={stateId}
                      onChange={(e) => setStateId(e.target.value)}
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {state.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="mobileNumber">Mobile Number</CFormLabel>
                    <CFormInput
                      type="tel"
                      id="mobileNumber"
                      placeholder="Enter Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="officeNumber">Office Number</CFormLabel>
                    <CFormInput
                      type="tel"
                      id="officeNumber"
                      placeholder="Enter Office Number"
                      value={officeNumber}
                      onChange={(e) => setOfficeNumber(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="panNumber">PAN Number</CFormLabel>
                    <CFormInput
                      type="text"
                      id="panNumber"
                      placeholder="Enter PAN Number"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="emailId">Email ID</CFormLabel>
                    <CFormInput
                      type="email"
                      id="emailId"
                      placeholder="Enter Email ID"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <div className="mb-3">
                <CButton color={editingId ? 'warning' : 'success'} type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      {editingId ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingId ? (
                    'Update Transport Owner'
                  ) : (
                    'Add Transport Owner'
                  )}
                </CButton>
                {editingId && (
                  <CButton color="secondary" className="ms-2" onClick={handleClear}>
                    Clear
                  </CButton>
                )}
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Transport Owners</strong>
          </CCardHeader>
          {loading ? (
            <div className="text-center p-4">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Owner Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Mobile Number</CTableHeaderCell>
                    <CTableHeaderCell scope="col">PAN Number</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email ID</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {transportOwners.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No transport owners found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    transportOwners.map((owner) => (
                      <CTableRow key={owner.id}>
                        <CTableDataCell>{owner.ownerName}</CTableDataCell>
                        <CTableDataCell>{owner.mobileNumber || '-'}</CTableDataCell>
                        <CTableDataCell>{owner.panNumber || '-'}</CTableDataCell>
                        <CTableDataCell>{owner.emailId || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleView(owner.id)}
                          >
                            View
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(owner.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" size="sm" onClick={() => handleDelete(owner.id)}>
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          )}
        </CCard>
      </CCol>

      {/* View Modal */}
      <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Transport Owner Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedOwner && (
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Owner Name:</strong>
                  <p className="mt-1">{selectedOwner.ownerName}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Address:</strong>
                  <p className="mt-1">{selectedOwner.address || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>City:</strong>
                  <p className="mt-1">{getCityName(selectedOwner.cityId) || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>State:</strong>
                  <p className="mt-1">{getStateName(selectedOwner.stateId) || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Mobile Number:</strong>
                  <p className="mt-1">{selectedOwner.mobileNumber || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Office Number:</strong>
                  <p className="mt-1">{selectedOwner.officeNumber || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>PAN Number:</strong>
                  <p className="mt-1">{selectedOwner.panNumber || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Email ID:</strong>
                  <p className="mt-1">{selectedOwner.emailId || 'N/A'}</p>
                </div>
              </CCol>
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default CreateTransportOwner
