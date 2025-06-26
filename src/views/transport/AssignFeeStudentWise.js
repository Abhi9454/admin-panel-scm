import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CFormLabel,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CAlert,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
} from '@coreui/react'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'
import transportManagementApi from 'src/api/transportManagementApi'

const AssignFeesStudentWise = () => {
  // Main state
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [busRoutes, setBusRoutes] = useState([])
  const [busStops, setBusStops] = useState([])
  const [terms, setTerms] = useState([])

  // Transport assignment state
  const [transportData, setTransportData] = useState({
    morningRouteId: '',
    morningStopId: '',
    eveningRouteId: '',
    eveningStopId: '',
    termFees: {},
  })

  // Transport fees card state
  const [transportFeesData, setTransportFeesData] = useState({
    busRouteId: '',
    busStopId: '',
    fees: '',
  })

  // Track manually modified fees to preserve them
  const [manuallyModifiedFees, setManuallyModifiedFees] = useState(new Set())

  useEffect(() => {
    fetchDropdownData()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchAndFilterStudents()
    } else {
      setShowStudents(false)
      setFilteredStudents([])
    }
  }, [selectedClass, selectedSection])

  const showAlert = (message, color = 'success') => {
    setAlertMessage(message)
    setAlertColor(color)
    setTimeout(() => setAlertMessage(''), 5000)
  }

  const fetchDropdownData = async () => {
    setLoading(true)
    try {
      const [classData, sectionData, termData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
        apiService.getAll('term/all'),
      ])
      setClasses(classData)
      setSections(sectionData)
      setTerms(termData)
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      showAlert('Error fetching dropdown data', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchAndFilterStudents = async () => {
    setLoading(true)
    try {
      const response = await studentManagementApi.getAll('all')
      setStudents(response)

      // Filter students based on selected criteria
      const filtered = response.filter((student) => {
        return (
          student.classId === Number(selectedClass) && student.sectionId === Number(selectedSection)
        )
      })

      setFilteredStudents(filtered)
      setShowStudents(true)
    } catch (error) {
      console.error('Error fetching students:', error)
      setFilteredStudents([])
      setShowStudents(true)
      showAlert('Error fetching students', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransportData = async () => {
    try {
      const [routeData, stopData] = await Promise.all([
        transportManagementApi.getAll('bus-route/all'),
        transportManagementApi.getAll('bus-stop/all'),
      ])
      setBusRoutes(routeData)
      setBusStops(stopData)
    } catch (error) {
      console.error('Error fetching transport data:', error)
      showAlert('Error fetching transport data', 'danger')
    }
  }

  const handleViewStudent = async (student) => {
    setSelectedStudent(student)
    setTransportData({
      morningRouteId: '',
      morningStopId: '',
      eveningRouteId: '',
      eveningStopId: '',
      termFees: {},
    })
    setTransportFeesData({
      busRouteId: '',
      busStopId: '',
      fees: '',
    })
    setManuallyModifiedFees(new Set())

    await fetchTransportData()
    setShowModal(true)
  }

  const handleTransportDataChange = (field, value) => {
    setTransportData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTransportFeesChange = (field, value) => {
    setTransportFeesData((prev) => {
      const newData = { ...prev, [field]: value }

      // If fees is changed, update all non-manually modified term fees
      if (field === 'fees' && value) {
        const updatedTermFees = { ...transportData.termFees }
        terms.forEach((term) => {
          const termKey = term.id || term.name
          if (!manuallyModifiedFees.has(termKey)) {
            updatedTermFees[termKey] = {
              ...updatedTermFees[termKey],
              fees: value,
              amount: calculateAmount(value, updatedTermFees[termKey]?.conc || 0),
            }
          }
        })

        setTransportData((prev) => ({
          ...prev,
          termFees: updatedTermFees,
        }))
      }

      return newData
    })
  }

  const calculateAmount = (fees, conc) => {
    const feesNum = parseFloat(fees) || 0
    const concNum = parseFloat(conc) || 0
    return Math.max(0, feesNum - concNum)
  }

  const handleTermFeeChange = (termKey, field, value) => {
    setTransportData((prev) => {
      const newTermFees = {
        ...prev.termFees,
        [termKey]: {
          ...prev.termFees[termKey],
          [field]: value,
        },
      }

      // Calculate amount if fees or conc changed
      if (field === 'fees' || field === 'conc') {
        const fees = field === 'fees' ? value : newTermFees[termKey]?.fees || 0
        const conc = field === 'conc' ? value : newTermFees[termKey]?.conc || 0
        newTermFees[termKey].amount = calculateAmount(fees, conc)

        // Mark as manually modified if fees changed
        if (field === 'fees') {
          setManuallyModifiedFees((prev) => new Set(prev).add(termKey))
        }
      }

      return {
        ...prev,
        termFees: newTermFees,
      }
    })
  }

  const handleSaveTransportAssignment = async () => {
    if (!selectedStudent) return

    // Validation
    if (!transportData.morningRouteId && !transportData.eveningRouteId) {
      showAlert('Please select at least one route (Morning or Evening)', 'warning')
      return
    }

    try {
      setLoading(true)

      const assignmentData = {
        studentId: selectedStudent.id,
        morningRouteId: transportData.morningRouteId ? Number(transportData.morningRouteId) : null,
        morningStopId: transportData.morningStopId ? Number(transportData.morningStopId) : null,
        eveningRouteId: transportData.eveningRouteId ? Number(transportData.eveningRouteId) : null,
        eveningStopId: transportData.eveningStopId ? Number(transportData.eveningStopId) : null,
        termFees: transportData.termFees,
        transportFees: transportFeesData,
      }

      await transportManagementApi.create('assign-transport-student/add', assignmentData)
      showAlert('Transport assignment saved successfully!', 'success')
      setShowModal(false)
    } catch (error) {
      console.error('Error saving transport assignment:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Error saving transport assignment'
      showAlert(errorMessage, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredStops = (routeId) => {
    if (!routeId) return []
    return busStops.filter((stop) => stop.routeId === Number(routeId))
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Assign Transport Fees - Student Wise</strong>
            </CCardHeader>

            {loading && !showStudents ? (
              <div className="text-center p-4">
                <CSpinner color="primary" />
                <p>Loading data...</p>
              </div>
            ) : (
              <CCardBody>
                {alertMessage && (
                  <CAlert color={alertColor} dismissible onClose={() => setAlertMessage('')}>
                    {alertMessage}
                  </CAlert>
                )}

                {/* Search Student Section */}
                <div className="mb-4">
                  <h6 className="mb-3">Search Student</h6>
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel htmlFor="classSelect">Class</CFormLabel>
                      <CFormSelect
                        id="classSelect"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel htmlFor="sectionSelect">Section</CFormLabel>
                      <CFormSelect
                        id="sectionSelect"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                      >
                        <option value="">Select Section</option>
                        {sections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                </div>

                {/* Students Table */}
                {showStudents && (
                  <>
                    {loading ? (
                      <div className="text-center p-4">
                        <CSpinner color="primary" />
                        <p>Loading students...</p>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center p-4">
                        <p className="text-muted">No students found for the selected criteria</p>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6>Students ({filteredStudents.length})</h6>
                        </div>

                        <CTable hover responsive>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell scope="col">S/No.</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Adm No.</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Father's Name</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {filteredStudents.map((student, index) => (
                              <CTableRow key={student.id}>
                                <CTableDataCell>{index + 1}</CTableDataCell>
                                <CTableDataCell>{student.admissionNumber}</CTableDataCell>
                                <CTableDataCell>{student.name}</CTableDataCell>
                                <CTableDataCell>{student.fatherName}</CTableDataCell>
                                <CTableDataCell>
                                  {student.className} - {student.sectionName}
                                </CTableDataCell>
                                <CTableDataCell>
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    onClick={() => handleViewStudent(student)}
                                  >
                                    View
                                  </CButton>
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      </>
                    )}
                  </>
                )}
              </CCardBody>
            )}
          </CCard>
        </CCol>
      </CRow>

      {/* Transport Assignment Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="xl" scrollable>
        <CModalHeader>
          <CModalTitle>Transport Assignment - {selectedStudent?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedStudent && (
            <>
              {/* Student Details */}
              <CCard className="mb-3">
                <CCardHeader>
                  <strong>Student Details</strong>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md={3}>
                      <strong>Adm No:</strong> {selectedStudent.admissionNumber}
                    </CCol>
                    <CCol md={3}>
                      <strong>Name:</strong> {selectedStudent.name}
                    </CCol>
                    <CCol md={3}>
                      <strong>Father Name:</strong> {selectedStudent.fatherName}
                    </CCol>
                    <CCol md={3}>
                      <strong>Class:</strong> {selectedStudent.className} -{' '}
                      {selectedStudent.sectionName}
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Transport Assignment */}
              <CCard className="mb-3">
                <CCardHeader>
                  <strong>Transport Assignment</strong>
                </CCardHeader>
                <CCardBody>
                  <CRow className="mb-3">
                    <CCol md={12}>
                      <h6>Morning</h6>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Bus Route</CFormLabel>
                      <CFormSelect
                        value={transportData.morningRouteId}
                        onChange={(e) =>
                          handleTransportDataChange('morningRouteId', e.target.value)
                        }
                      >
                        <option value="">Select Route</option>
                        {busRoutes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Bus Stop</CFormLabel>
                      <CFormSelect
                        value={transportData.morningStopId}
                        onChange={(e) => handleTransportDataChange('morningStopId', e.target.value)}
                      >
                        <option value="">Select Stop</option>
                        {getFilteredStops(transportData.morningRouteId).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol md={12}>
                      <h6>Evening</h6>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Bus Route</CFormLabel>
                      <CFormSelect
                        value={transportData.eveningRouteId}
                        onChange={(e) =>
                          handleTransportDataChange('eveningRouteId', e.target.value)
                        }
                      >
                        <option value="">Select Route</option>
                        {busRoutes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Bus Stop</CFormLabel>
                      <CFormSelect
                        value={transportData.eveningStopId}
                        onChange={(e) => handleTransportDataChange('eveningStopId', e.target.value)}
                      >
                        <option value="">Select Stop</option>
                        {getFilteredStops(transportData.eveningRouteId).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Transport Fees Card */}
              <CCard className="mb-3">
                <CCardHeader>
                  <strong>Transport Fees</strong>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md={4}>
                      <CFormLabel>Bus Route</CFormLabel>
                      <CFormSelect
                        value={transportFeesData.busRouteId}
                        onChange={(e) => handleTransportFeesChange('busRouteId', e.target.value)}
                      >
                        <option value="">Select Route</option>
                        {busRoutes.map((route) => (
                          <option key={route.id} value={route.id}>
                            {route.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Bus Stop</CFormLabel>
                      <CFormSelect
                        value={transportFeesData.busStopId}
                        onChange={(e) => handleTransportFeesChange('busStopId', e.target.value)}
                      >
                        <option value="">Select Stop</option>
                        {getFilteredStops(transportFeesData.busRouteId).map((stop) => (
                          <option key={stop.id} value={stop.id}>
                            {stop.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Fees</CFormLabel>
                      <CFormInput
                        type="number"
                        value={transportFeesData.fees}
                        onChange={(e) => handleTransportFeesChange('fees', e.target.value)}
                        placeholder="Enter fees amount"
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Term Fees Table */}
              <CCard>
                <CCardHeader>
                  <strong>Term Wise Fees</strong>
                </CCardHeader>
                <CCardBody>
                  <CTable responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Term</CTableHeaderCell>
                        <CTableHeaderCell>Fees</CTableHeaderCell>
                        <CTableHeaderCell>Conc</CTableHeaderCell>
                        <CTableHeaderCell>Amount</CTableHeaderCell>
                        <CTableHeaderCell>Remarks</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {terms.map((term) => {
                        const termKey = term.id || term.name
                        const termData = transportData.termFees[termKey] || {}
                        return (
                          <CTableRow key={termKey}>
                            <CTableDataCell>{term.name}</CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                type="number"
                                value={termData.fees || ''}
                                onChange={(e) =>
                                  handleTermFeeChange(termKey, 'fees', e.target.value)
                                }
                                placeholder="0"
                                size="sm"
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                type="number"
                                value={termData.conc || ''}
                                onChange={(e) =>
                                  handleTermFeeChange(termKey, 'conc', e.target.value)
                                }
                                placeholder="0"
                                size="sm"
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                type="number"
                                value={termData.amount || '0'}
                                readOnly
                                size="sm"
                                className="bg-dark"
                              />
                            </CTableDataCell>
                            <CTableDataCell>
                              <CFormInput
                                type="text"
                                value={termData.remark || ''}
                                onChange={(e) =>
                                  handleTermFeeChange(termKey, 'remark', e.target.value)
                                }
                                placeholder="Remarks"
                                size="sm"
                              />
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                </CCardBody>
              </CCard>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)} disabled={loading}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSaveTransportAssignment} disabled={loading}>
            {loading ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              'Save Assignment'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AssignFeesStudentWise
