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
import transportApi from '../../api/transportManagementApi' // Import API service for transport management

const CreateBusStop = () => {
  const [busRouteId, setBusRouteId] = useState('')
  const [busFee, setBusFee] = useState('')
  const [sequenceNumber, setSequenceNumber] = useState('')

  const [busRoutes, setBusRoutes] = useState([])
  const [busStops, setBusStops] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [selectedBusStop, setSelectedBusStop] = useState(null)

  useEffect(() => {
    fetchBusRoutes()
    fetchBusStops()
  }, [])

  const fetchBusRoutes = async () => {
    try {
      const data = await transportApi.getAll('bus-route/all')
      setBusRoutes(data)
    } catch (error) {
      console.error('Error fetching bus routes:', error)
    }
  }

  const fetchBusStops = async () => {
    try {
      setLoading(true)
      const data = await transportApi.getAll('bus-stop/all')
      setBusStops(data)
    } catch (error) {
      console.error('Error fetching bus stops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!busRouteId || !busFee || !sequenceNumber) return

    setLoading(true)
    const busStopData = {
      busRouteId: parseInt(busRouteId),
      busFee: parseFloat(busFee),
      sequenceNumber: parseInt(sequenceNumber),
    }

    try {
      if (editingId !== null) {
        await transportApi.update('bus-stop/update', editingId, busStopData)
        setEditingId(null)
      } else {
        await transportApi.create('bus-stop/add', busStopData)
      }
      await fetchBusStops()
      handleClear()
    } catch (error) {
      console.error('Error saving bus stop:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const busStopToEdit = busStops.find((busStop) => busStop.id === id)
    if (busStopToEdit) {
      setBusRouteId(busStopToEdit.busRouteId.toString())
      setBusFee(busStopToEdit.busFee.toString())
      setSequenceNumber(busStopToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await transportApi.delete(`bus-stop/delete/${id}`)
      fetchBusStops()
    } catch (error) {
      console.error('Error deleting bus stop:', error)
    }
  }

  const handleView = (id) => {
    const busStopToView = busStops.find((busStop) => busStop.id === id)
    if (busStopToView) {
      setSelectedBusStop(busStopToView)
      setViewModalVisible(true)
    }
  }

  const handleClear = () => {
    setBusRouteId('')
    setBusFee('')
    setSequenceNumber('')
    setEditingId(null)
  }

  const getBusRouteName = (busRouteId) => {
    const route = busRoutes.find((r) => r.id === busRouteId)
    return route ? route.routeName : ''
  }

  const getBusRouteDetails = (busRouteId) => {
    const route = busRoutes.find((r) => r.id === busRouteId)
    return route ? `${route.startPoint} - ${route.endPoint}` : ''
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Bus Stop' : 'Add New Bus Stop'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="busRoute">
                      Bus Route <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormSelect
                      id="busRoute"
                      value={busRouteId}
                      onChange={(e) => setBusRouteId(e.target.value)}
                      required
                    >
                      <option value="">Select Bus Route</option>
                      {busRoutes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.routeName} ({route.startPoint} - {route.endPoint})
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="busFee">
                      Bus Fee (₹) <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      step="0.01"
                      id="busFee"
                      placeholder="Enter Bus Fee"
                      value={busFee}
                      onChange={(e) => setBusFee(e.target.value)}
                      required
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="sequenceNumber">
                      Sequence Number <span className="text-danger">*</span>
                    </CFormLabel>
                    <CFormInput
                      type="number"
                      id="sequenceNumber"
                      placeholder="Enter Sequence Number"
                      value={sequenceNumber}
                      onChange={(e) => setSequenceNumber(e.target.value)}
                      required
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
                    'Update Bus Stop'
                  ) : (
                    'Add Bus Stop'
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
            <strong>All Bus Stops</strong>
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
                    <CTableHeaderCell scope="col">Bus Route</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Route Details</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Bus Fee (₹)</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence Number</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {busStops.length === 0 ? (
                    <CTableRow>
                      <CTableDataCell colSpan="5" className="text-center">
                        No bus stops found
                      </CTableDataCell>
                    </CTableRow>
                  ) : (
                    busStops.map((busStop) => (
                      <CTableRow key={busStop.id}>
                        <CTableDataCell>{getBusRouteName(busStop.busRouteId)}</CTableDataCell>
                        <CTableDataCell>{getBusRouteDetails(busStop.busRouteId)}</CTableDataCell>
                        <CTableDataCell>₹{busStop.busFee}</CTableDataCell>
                        <CTableDataCell>{busStop.sequenceNumber}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleView(busStop.id)}
                          >
                            View
                          </CButton>
                          <CButton
                            color="warning"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(busStop.id)}
                          >
                            Edit
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(busStop.id)}
                          >
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
          <CModalTitle>Bus Stop Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBusStop && (
            <CRow>
              <CCol md={12}>
                <div className="mb-3">
                  <strong>Bus Route:</strong>
                  <p className="mt-1">{getBusRouteName(selectedBusStop.busRouteId)}</p>
                </div>
              </CCol>
              <CCol md={12}>
                <div className="mb-3">
                  <strong>Route Details:</strong>
                  <p className="mt-1">{getBusRouteDetails(selectedBusStop.busRouteId)}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Bus Fee:</strong>
                  <p className="mt-1">₹{selectedBusStop.busFee}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Sequence Number:</strong>
                  <p className="mt-1">{selectedBusStop.sequenceNumber}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Bus Stop ID:</strong>
                  <p className="mt-1">{selectedBusStop.id}</p>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <strong>Bus Route ID:</strong>
                  <p className="mt-1">{selectedBusStop.busRouteId}</p>
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

export default CreateBusStop
