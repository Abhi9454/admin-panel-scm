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
  CFormTextarea,
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
import transportApi from '../../api/transportManagementApi' // Import API service for transport management

const CreateBusRoute = () => {
  const [routeName, setRouteName] = useState('')
  const [routeNumber, setRouteNumber] = useState('')
  const [startPoint, setStartPoint] = useState('')
  const [endPoint, setEndPoint] = useState('')
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [fare, setFare] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const [transportOwners, setTransportOwners] = useState([])
  const [busRoutes, setBusRoutes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState(null)

  useEffect(() => {
    fetchTransportOwners()
    fetchBusRoutes()
  }, [])

  const fetchTransportOwners = async () => {
    try {
      const data = await transportApi.getAll('transport-owner/all')
      setTransportOwners(data)
    } catch (error) {
      console.error('Error fetching transport owners:', error)
    }
  }

  const fetchBusRoutes = async () => {
    try {
      setLoading(true)
      const data = await transportApi.getAll('bus-route/all')
      setBusRoutes(data)
    } catch (error) {
      console.error('Error fetching bus routes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!routeName || !startPoint || !endPoint) return

    setLoading(true)
    const busRouteData = {
      routeName,
      routeNumber,
      startPoint,
      endPoint,
      distance: distance ? parseFloat(distance) : null,
      duration,
      ownerId: ownerId ? parseInt(ownerId) : null,
      fare: fare ? parseFloat(fare) : null,
      description,
      status,
    }

    try {
      if (editingId !== null) {
        await transportApi.update('bus-route/update', editingId, busRouteData)
        setEditingId(null)
      } else {
        await transportApi.create('bus-route/add', busRouteData)
      }
      await fetchBusRoutes()
      handleClear()
    } catch (error) {
      console.error('Error saving bus route:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const routeToEdit = busRoutes.find((route) => route.id === id)
    if (routeToEdit) {
      setRouteName(routeToEdit.routeName)
      setRouteNumber(routeToEdit.routeNumber || '')
      setStartPoint(routeToEdit.startPoint)
      setEndPoint(routeToEdit.endPoint)
      setDistance(routeToEdit.distance ? routeToEdit.distance.toString() : '')
      setDuration(routeToEdit.duration || '')
      setOwnerId(routeToEdit.ownerId ? routeToEdit.ownerId.toString() : '')
      setFare(routeToEdit.fare ? routeToEdit.fare.toString() : '')
      setDescription(routeToEdit.description || '')
      setStatus(routeToEdit.status || 'ACTIVE')
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await transportApi.delete(`bus-route/delete/${id}`)
      fetchBusRoutes()
    } catch (error) {
      console.error('Error deleting bus route:', error)
    }
  }

  const handleView = (id) => {
    const routeToView = busRoutes.find((route) => route.id === id)
    if (routeToView) {
      setSelectedRoute(routeToView)
      setViewModalVisible(true)
    }
  }

  const handleClear = () => {
    setRouteName('')
    setRouteNumber('')
    setStartPoint('')
    setEndPoint('')
    setDistance('')
    setDuration('')
    setOwnerId('')
    setFare('')
    setDescription('')
    setStatus('ACTIVE')
    setEditingId(null)
  }

  const getOwnerName = (ownerId) => {
    const owner = transportOwners.find((o) => o.id === ownerId)
    return owner ? owner.ownerName : ''
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Bus Route' : 'Add New Bus Route'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="routeName">
                      Route Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="routeName"
                      placeholder="Enter Route Name"
                      value={routeName}
                      onChange={(e) => setRouteName(e.target.value)}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="routeNumber">Route Number</CFormLabel>
                    <CFormInput
                      type="text"
                      id="routeNumber"
                      placeholder="Enter Route Number"
                      value={routeNumber}
                      onChange={(e) => setRouteNumber(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="startPoint">
                      Start Point <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="startPoint"
                      placeholder="Enter Start Point"
                      value={startPoint}
                      onChange={(e) => setStartPoint(e.target.value)}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="endPoint">
                      End Point <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="text"
                      id="endPoint"
                      placeholder="Enter End Point"
                      value={endPoint}
                      onChange={(e) => setEndPoint(e.target.value)}
                      required
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="distance">Distance (KM)</CFormLabel>
                    <CFormInput
                      type="number"
                      step="0.1"
                      id="distance"
                      placeholder="Enter Distance in KM"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="duration">Duration</CFormLabel>
                    <CFormInput
                      type="text"
                      id="duration"
                      placeholder="e.g., 2 hours 30 minutes"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="owner">Owner</CFormLabel>
                    <CFormSelect
                      id="owner"
                      value={ownerId}
                      onChange={(e) => setOwnerId(e.target.value)}
                    >
                      <option value="">Select Owner</option>
                      {transportOwners.map((owner) => (
                        <option key={owner.id} value={owner.id}>
                          {owner.ownerName}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="fare">Fare (₹)</CFormLabel>
                    <CFormInput
                      type="number"
                      step="0.01"
                      id="fare"
                      placeholder="Enter Fare Amount"
                      value={fare}
                      onChange={(e) => setFare(e.target.value)}
                    />
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="status">Status</CFormLabel>
                    <CFormSelect
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={6}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="description">Description</CFormLabel>
                    <CFormTextarea
                      id="description"
                      rows="3"
                      placeholder="Enter Route Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                    'Update Bus Route'
                  ) : (
                    'Add Bus Route'
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
            <strong>All Bus Routes</strong>
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
                    <CTableHeaderCell scope="col">Route Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Route Number</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Start - End</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Owner</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {busRoutes.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center">
                        No bus routes found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    busRoutes.map((route) => (
                      <CTableRow key={route.id}>
                        <CTableDataCell>{route.routeName}</CTableDataCell>
                        <CTableDataCell>{route.routeNumber || '-'}</CTableDataCell>
                        <CTableDataCell>
                          {route.startPoint} - {route.endPoint}
                        </CTableDataCell>
                        <CTableDataCell>{getOwnerName(route.ownerId) || '-'}</CTableDataCell>
                        <CTableDataCell>
                          <span
                            className={`badge bg-${route.status === 'ACTIVE' ? 'success' : route.status === 'INACTIVE' ? 'danger' : 'warning'}`}
                          >
                            {route.status}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleView(route.id)}
                          >
                            View
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(route.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" size="sm" onClick={() => handleDelete(route.id)}>
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
          <CModalTitle>Bus Route Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedRoute && (
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Route Name:</strong>
                  <p className="mt-1">{selectedRoute.routeName}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Route Number:</strong>
                  <p className="mt-1">{selectedRoute.routeNumber || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Start Point:</strong>
                  <p className="mt-1">{selectedRoute.startPoint}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>End Point:</strong>
                  <p className="mt-1">{selectedRoute.endPoint}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Distance:</strong>
                  <p className="mt-1">
                    {selectedRoute.distance ? `${selectedRoute.distance} KM` : 'N/A'}
                  </p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Duration:</strong>
                  <p className="mt-1">{selectedRoute.duration || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Owner:</strong>
                  <p className="mt-1">{getOwnerName(selectedRoute.ownerId) || 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Fare:</strong>
                  <p className="mt-1">{selectedRoute.fare ? `₹${selectedRoute.fare}` : 'N/A'}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Status:</strong>
                  <p className="mt-1">
                    <span
                      className={`badge bg-${selectedRoute.status === 'ACTIVE' ? 'success' : selectedRoute.status === 'INACTIVE' ? 'danger' : 'warning'}`}
                    >
                      {selectedRoute.status}
                    </span>
                  </p>
                </div>
              </CCol>
              <CCol md={12}>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p className="mt-1">{selectedRoute.description || 'N/A'}</p>
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

export default CreateBusRoute
