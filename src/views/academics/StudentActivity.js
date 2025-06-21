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
} from '@coreui/react'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'

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
  const [loading, setLoading] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')

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
    }
  }, [selectedClass, selectedSection])

  useEffect(() => {
    if (selectedTestType) {
      fetchActivitiesByTestType()
    } else {
      setActivities([])
      setSelectedActivity('')
    }
  }, [selectedTestType])

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
        apiService.getAll('test-type/all'),
      ])
      setClasses(classData)
      setSections(sectionData)

      // Filter to get unique test types based on name to avoid duplicates in dropdown
      const uniqueTestTypes = testTypeData.reduce((acc, current) => {
        const existing = acc.find((item) => item.name === current.name)
        if (!existing) {
          acc.push(current)
        }
        return acc
      }, [])

      setTestTypes(uniqueTestTypes)
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
      const selectedTestTypeObj = testTypes.find((tt) => tt.id === Number(selectedTestType))
      if (selectedTestTypeObj) {
        // Fetch and display all activities for the selected test type (including duplicates)
        const activitiesData = await apiService.getAll(`test-type/${selectedTestTypeObj.name}`)

        // Map all activities with their database IDs for proper tracking
        const allActivities = activitiesData.map((item, index) => ({
          id: item.id, // Use the actual ID from the database
          name: item.activity,
          testTypeId: item.id,
        }))

        setActivities(allActivities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
      showAlert('Error fetching activities for selected test type', 'danger')
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

      // Initialize student activities state
      const initialActivities = {}
      filtered.forEach((student) => {
        initialActivities[student.id] = {
          term1: '',
          term2: '',
          term3: '',
        }
      })
      setStudentActivities(initialActivities)
    } catch (error) {
      console.error('Error fetching students:', error)
      setFilteredStudents([])
      setShowStudents(true)
      showAlert('Error fetching students', 'danger')
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

      const activitiesData = filteredStudents.map((student) => ({
        studentId: student.id,
        classId: Number(selectedClass),
        sectionId: Number(selectedSection),
        testTypeId: Number(selectedTestType),
        activity: selectedActivity,
        term1: studentActivities[student.id]?.term1 || '',
        term2: studentActivities[student.id]?.term2 || '',
        term3: studentActivities[student.id]?.term3 || '',
      }))

      // Here you would make an API call to save the student activities
      // await apiService.create('student-activities/bulk-save', { activities: activitiesData })

      console.log('Activities to save:', activitiesData)
      showAlert('Student activities saved successfully!', 'success')
    } catch (error) {
      console.error('Error saving activities:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Error saving activities'
      showAlert(errorMessage, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedTestTypeName = () => {
    if (!selectedTestType) return ''
    const testType = testTypes.find((tt) => tt.id === Number(selectedTestType))
    return testType ? testType.name : ''
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
                  <CFormLabel htmlFor="testTypeSelect">TestType</CFormLabel>
                  <CFormSelect
                    id="testTypeSelect"
                    value={selectedTestType}
                    onChange={(e) => setSelectedTestType(e.target.value)}
                  >
                    <option value="">Select TestType</option>
                    {testTypes.map((testType) => (
                      <option key={testType.id} value={testType.id}>
                        {testType.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel htmlFor="activitySelect">
                    Activity
                  </CFormLabel>
                  <CFormSelect
                    id="activitySelect"
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    disabled={!selectedTestType}
                  >
                    <option value="">Select Activity</option>
                    {activities.map((activity) => (
                      <option key={activity.testTypeId} value={activity.name}>
                        {activity.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

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
                            <CTableRow key={student.id}>
                              <CTableDataCell>{index + 1}</CTableDataCell>
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
