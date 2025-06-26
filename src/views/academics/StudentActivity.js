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
  CAlert,
  CFormInput,
  CBadge,
} from '@coreui/react'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'
import academicsApi from 'src/api/academicsManagementApi'

const StudentActivity = () => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [testTypes, setTestTypes] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedTestType, setSelectedTestType] = useState('')
  const [selectedActivity, setSelectedActivity] = useState('')
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [studentActivities, setStudentActivities] = useState({})
  const [existingActivities, setExistingActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')
  const [dataMode, setDataMode] = useState('new') // 'new', 'existing', 'mixed'

  useEffect(() => {
    fetchDropdownData()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchAndFilterStudents()
    } else {
      setShowStudents(false)
      setFilteredStudents([])
      setStudentActivities({})
      setExistingActivities([])
      setDataMode('new')
    }
  }, [selectedClass, selectedSection])

  useEffect(() => {
    if (selectedTestType) {
      fetchActivitiesByTestType()
    } else {
      setActivities([])
      setSelectedActivity('')
      setExistingActivities([])
      setDataMode('new')
    }
  }, [selectedTestType])

  // New useEffect to handle loading existing data when all criteria are selected
  useEffect(() => {
    if (
      selectedClass &&
      selectedSection &&
      selectedTestType &&
      selectedActivity &&
      filteredStudents.length > 0
    ) {
      fetchExistingStudentActivities()
    } else {
      setExistingActivities([])
      setDataMode('new')
      // Reset to empty form if criteria changes
      if (filteredStudents.length > 0) {
        initializeEmptyStudentActivities()
      }
    }
  }, [selectedClass, selectedSection, selectedTestType, selectedActivity, filteredStudents])

  const showAlert = (message, color = 'success') => {
    setAlertMessage(message)
    setAlertColor(color)
    setTimeout(() => setAlertMessage(''), 5000)
  }

  const fetchDropdownData = async () => {
    setLoading(true)
    try {
      const [classData, sectionData, testTypeData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
        apiService.getAll('test-type/all'), // Updated to use academicsApi
      ])
      setClasses(classData)
      setSections(sectionData)
      setTestTypes(testTypeData)
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      showAlert('Error fetching dropdown data', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchActivitiesByTestType = async () => {
    if (!selectedTestType) return

    try {
      setLoading(true)
      // Updated to use academicsApi
      const activitiesData = await apiService.getAll(
        `test-type-activity/by-test-type/${selectedTestType}`,
      )

      const mappedActivities = activitiesData.map((activity) => ({
        id: activity.id,
        name: activity.activity,
        testTypeId: activity.testTypeId,
      }))

      setActivities(mappedActivities)
      setSelectedActivity('')
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
      showAlert('Error fetching activities for selected test type', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchAndFilterStudents = async () => {
    setLoading(true)
    try {
      const response = await studentManagementApi.getAll('all')
      setStudents(response)

      const filtered = response.filter((student) => {
        return (
          student.classId === Number(selectedClass) && student.sectionId === Number(selectedSection)
        )
      })

      setFilteredStudents(filtered)
      setShowStudents(true)

      // Initialize empty student activities
      initializeEmptyStudentActivities(filtered)
    } catch (error) {
      console.error('Error fetching students:', error)
      setFilteredStudents([])
      setShowStudents(true)
      showAlert('Error fetching students', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const initializeEmptyStudentActivities = (studentsToUse = filteredStudents) => {
    const initialActivities = {}
    studentsToUse.forEach((student) => {
      initialActivities[student.id] = {
        term1: '',
        term2: '',
        term3: '',
      }
    })
    setStudentActivities(initialActivities)
  }

  const fetchExistingStudentActivities = async () => {
    if (!selectedClass || !selectedSection || !selectedTestType || !selectedActivity) return

    try {
      setLoading(true)
      // Fetch existing student activities based on criteria
      const existingData = await academicsApi.getAll(
        `student-activity/by-criteria?classId=${selectedClass}&sectionId=${selectedSection}&testTypeId=${selectedTestType}&activityId=${selectedActivity}`,
      )

      setExistingActivities(existingData)

      // Create a map of existing activities by student ID for quick lookup
      const existingActivitiesMap = {}
      existingData.forEach((activity) => {
        existingActivitiesMap[activity.studentId] = {
          term1: activity.term1 || '',
          term2: activity.term2 || '',
          term3: activity.term3 || '',
        }
      })

      // Update student activities state with existing data
      const updatedActivities = {}
      filteredStudents.forEach((student) => {
        if (existingActivitiesMap[student.id]) {
          updatedActivities[student.id] = existingActivitiesMap[student.id]
        } else {
          updatedActivities[student.id] = {
            term1: '',
            term2: '',
            term3: '',
          }
        }
      })

      setStudentActivities(updatedActivities)

      // Determine data mode
      if (existingData.length === 0) {
        setDataMode('new')
      } else if (existingData.length === filteredStudents.length) {
        setDataMode('existing')
      } else {
        setDataMode('mixed')
      }

      if (existingData.length > 0) {
        showAlert(`Loaded existing data for ${existingData.length} student(s)`, 'info')
      }
    } catch (error) {
      console.error('Error fetching existing activities:', error)
      setExistingActivities([])
      setDataMode('new')
      initializeEmptyStudentActivities()
    } finally {
      setLoading(false)
    }
  }

  const handleActivityChange = (studentId, term, value) => {
    setStudentActivities((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [term]: value,
      },
    }))
  }

  const handleSaveActivities = async () => {
    if (!selectedTestType || !selectedActivity) {
      showAlert('Please select Test Type and Activity', 'warning')
      return
    }

    if (filteredStudents.length === 0) {
      showAlert('No students to save activities for', 'warning')
      return
    }

    try {
      setLoading(true)

      const selectedActivityObj = activities.find((act) => act.id === Number(selectedActivity))

      const activitiesData = filteredStudents.map((student) => ({
        studentId: student.id,
        classId: Number(selectedClass),
        sectionId: Number(selectedSection),
        testTypeId: Number(selectedTestType),
        activityId: selectedActivityObj?.id,
        term1: studentActivities[student.id]?.term1 || '',
        term2: studentActivities[student.id]?.term2 || '',
        term3: studentActivities[student.id]?.term3 || '',
      }))

      await academicsApi.create('student-activity/save-or-update-bulk', {
        activities: activitiesData,
      })

      console.log('Activities saved:', activitiesData)
      showAlert('Student activities saved successfully!', 'success')

      // Refresh existing data after save
      setTimeout(() => {
        fetchExistingStudentActivities()
      }, 1000)
    } catch (error) {
      console.error('Error saving activities:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Error saving activities'
      showAlert(errorMessage, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleClearForm = () => {
    initializeEmptyStudentActivities()
    setDataMode('new')
    showAlert('Form cleared successfully', 'info')
  }

  const getSelectedTestTypeName = () => {
    if (!selectedTestType) return ''
    const testType = testTypes.find((tt) => tt.id === Number(selectedTestType))
    return testType ? testType.name : ''
  }

  const getSelectedActivityName = () => {
    if (!selectedActivity) return ''
    const activity = activities.find((act) => act.id === Number(selectedActivity))
    return activity ? activity.name : ''
  }

  const getDataModeInfo = () => {
    switch (dataMode) {
      case 'existing':
        return { text: 'All students have existing data', color: 'success' }
      case 'mixed':
        return {
          text: `${existingActivities.length}/${filteredStudents.length} students have existing data`,
          color: 'warning',
        }
      case 'new':
      default:
        return { text: 'New data entry', color: 'primary' }
    }
  }

  const hasExistingDataForStudent = (studentId) => {
    return existingActivities.some((activity) => activity.studentId === studentId)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Activity</strong>
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

              {/* Class, Section, TestType, Activity Selection */}
              <CRow className="mb-3">
                <CCol md={3}>
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

                <CCol md={3}>
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

                <CCol md={3}>
                  <CFormLabel htmlFor="testTypeSelect">Test Type</CFormLabel>
                  <CFormSelect
                    id="testTypeSelect"
                    value={selectedTestType}
                    onChange={(e) => setSelectedTestType(e.target.value)}
                  >
                    <option value="">Select Test Type</option>
                    {testTypes.map((testType) => (
                      <option key={testType.id} value={testType.id}>
                        {testType.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel htmlFor="activitySelect">Activity</CFormLabel>
                  <CFormSelect
                    id="activitySelect"
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    disabled={!selectedTestType || activities.length === 0}
                  >
                    <option value="">Select Activity</option>
                    {activities.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Display selected criteria and data mode */}
              {(selectedClass || selectedSection || selectedTestType || selectedActivity) && (
                <CRow className="mb-3">
                  <CCol md={8}>
                    <div className="bg-success p-2 rounded">
                      <small className="text-muted">
                        <strong>Selected:</strong>{' '}
                        {selectedClass &&
                          `Class: ${classes.find((c) => c.id === Number(selectedClass))?.name || 'Unknown'} `}
                        {selectedSection &&
                          `| Section: ${sections.find((s) => s.id === Number(selectedSection))?.name || 'Unknown'} `}
                        {selectedTestType && `| Test Type: ${getSelectedTestTypeName()} `}
                        {selectedActivity && `| Activity: ${getSelectedActivityName()}`}
                      </small>
                    </div>
                  </CCol>
                  <CCol md={4} className="text-end">
                    {selectedClass && selectedSection && selectedTestType && selectedActivity && (
                      <CBadge color={getDataModeInfo().color} className="me-2">
                        {getDataModeInfo().text}
                      </CBadge>
                    )}
                  </CCol>
                </CRow>
              )}

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
                        <div>
                          {dataMode !== 'new' && (
                            <CButton
                              color="secondary"
                              variant="outline"
                              onClick={handleClearForm}
                              className="me-2"
                              disabled={loading}
                            >
                              Clear Form
                            </CButton>
                          )}
                          <CButton
                            color="success"
                            onClick={handleSaveActivities}
                            disabled={!selectedTestType || !selectedActivity || loading}
                          >
                            {loading ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </CButton>
                        </div>
                      </div>

                      <CTable hover responsive bordered>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col" style={{ width: '60px' }}>
                              Sr.
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" style={{ width: '120px' }}>
                              AdmNo
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                            <CTableHeaderCell scope="col" style={{ width: '150px' }}>
                              Term 1
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" style={{ width: '150px' }}>
                              Term 2
                            </CTableHeaderCell>
                            <CTableHeaderCell scope="col" style={{ width: '150px' }}>
                              Term 3
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {filteredStudents.map((student, index) => (
                            <CTableRow
                              key={student.id}
                              className={
                                hasExistingDataForStudent(student.id) ? 'table-warning' : ''
                              }
                            >
                              <CTableDataCell>
                                {index + 1}
                                {hasExistingDataForStudent(student.id) && (
                                  <CBadge color="info" size="sm" className="ms-1">
                                    E
                                  </CBadge>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>{student.admissionNumber}</CTableDataCell>
                              <CTableDataCell>{student.name}</CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="text"
                                  size="sm"
                                  value={studentActivities[student.id]?.term1 || ''}
                                  onChange={(e) =>
                                    handleActivityChange(student.id, 'term1', e.target.value)
                                  }
                                  placeholder="Enter term 1 activity"
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="text"
                                  size="sm"
                                  value={studentActivities[student.id]?.term2 || ''}
                                  onChange={(e) =>
                                    handleActivityChange(student.id, 'term2', e.target.value)
                                  }
                                  placeholder="Enter term 2 activity"
                                />
                              </CTableDataCell>
                              <CTableDataCell>
                                <CFormInput
                                  type="text"
                                  size="sm"
                                  value={studentActivities[student.id]?.term3 || ''}
                                  onChange={(e) =>
                                    handleActivityChange(student.id, 'term3', e.target.value)
                                  }
                                  placeholder="Enter term 3 activity"
                                />
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>

                      {/* Legend */}
                      {dataMode !== 'new' && (
                        <div className="mt-2">
                          <small className="text-muted">
                            <CBadge color="info" size="sm">
                              E
                            </CBadge>{' '}
                            = Student with existing data
                            {dataMode === 'mixed' &&
                              ' | Yellow rows indicate students with existing data'}
                          </small>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CCardBody>
          )}
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentActivity
