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
} from '@coreui/react'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'
import academicsApi from 'src/api/academicsManagementApi'

const AssignStream = () => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [groups, setGroups] = useState([])
  const [streams, setStreams] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedStream, setSelectedStream] = useState('')
  const [selectedNonScholastic, setSelectedNonScholastic] = useState('')
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [showStudents, setShowStudents] = useState(false)
  const [existingAssignment, setExistingAssignment] = useState(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertColor, setAlertColor] = useState('success')

  // Sample non-scholastic activities data
  const nonScholasticOptions = [
    { id: 1, name: 'Sports' },
    { id: 2, name: 'Arts & Crafts' },
    { id: 3, name: 'Music' },
    { id: 4, name: 'Dance' },
    { id: 5, name: 'Drama' },
    { id: 6, name: 'Debate' },
    { id: 7, name: 'Science Club' },
    { id: 8, name: 'Literary Club' },
    { id: 9, name: 'Environmental Club' },
    { id: 10, name: 'Community Service' },
  ]

  useEffect(() => {
    fetchDropdownData()
  }, [])

  useEffect(() => {
    if (selectedClass && selectedSection && selectedGroup) {
      fetchExistingAssignment()
      fetchAndFilterStudents()
    } else {
      setShowStudents(false)
      setFilteredStudents([])
      setExistingAssignment(null)
      setIsUpdateMode(false)
      resetSelections()
    }
  }, [selectedClass, selectedSection, selectedGroup])

  const resetSelections = () => {
    setSelectedStream('')
    setSelectedNonScholastic('')
  }

  const showAlert = (message, color = 'success') => {
    setAlertMessage(message)
    setAlertColor(color)
    setTimeout(() => setAlertMessage(''), 5000)
  }

  const fetchDropdownData = async () => {
    setLoading(true)
    try {
      const [classData, sectionData, groupData, streamData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
        apiService.getAll('group/all'),
        academicsApi.getAll('subject-stream/all'),
      ])
      setClasses(classData)
      setSections(sectionData)
      setGroups(groupData)
      setStreams(streamData)
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
      showAlert('Error fetching dropdown data', 'danger')
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingAssignment = async () => {
    try {
      const response = await academicsApi.getAll('subject-stream-assignment/get-by-criteria', {
        classId: selectedClass,
        sectionId: selectedSection,
        groupId: selectedGroup,
      })

      if (response) {
        setExistingAssignment(response)
        setIsUpdateMode(true)

        // Pre-populate form with existing assignment data
        if (response.subjectStreamInfo) {
          setSelectedStream(response.subjectStreamInfo.id.toString())
        }
        if (response.nonScholastic) {
          // Find matching non-scholastic option by name
          const matchingOption = nonScholasticOptions.find(
            (option) => option.name === response.nonScholastic,
          )
          if (matchingOption) {
            setSelectedNonScholastic(matchingOption.id.toString())
          }
        }

        showAlert('Existing assignment found. You can update it.', 'info')
      } else {
        setExistingAssignment(null)
        setIsUpdateMode(false)
        resetSelections()
      }
    } catch (error) {
      // If 404 or no assignment found, it's normal - no existing assignment
      setExistingAssignment(null)
      setIsUpdateMode(false)
      resetSelections()
      console.log('No existing assignment found for this criteria')
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
          student.classId === Number(selectedClass) &&
          student.sectionId === Number(selectedSection) &&
          student.groupId === Number(selectedGroup)
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

  const handleStreamChange = (streamId) => {
    setSelectedStream(streamId)
  }

  const handleNonScholasticChange = (nonScholasticId) => {
    setSelectedNonScholastic(nonScholasticId)
  }

  const getSelectedStreamData = () => {
    if (!selectedStream) return null
    return streams.find((stream) => stream.id === Number(selectedStream))
  }

  const getSelectedNonScholasticData = () => {
    if (!selectedNonScholastic) return null
    return nonScholasticOptions.find((option) => option.id === Number(selectedNonScholastic))
  }

  const handleSaveAssignments = async () => {
    if (!selectedStream && !selectedNonScholastic) {
      showAlert('Please select at least Stream or Non-Scholastic activity', 'warning')
      return
    }

    if (filteredStudents.length === 0) {
      showAlert('No students to assign', 'warning')
      return
    }

    try {
      setLoading(true)

      const assignmentData = {
        classId: Number(selectedClass),
        sectionId: Number(selectedSection),
        groupId: Number(selectedGroup),
        subjectStreamId: selectedStream ? Number(selectedStream) : null,
        nonScholastic: selectedNonScholastic ? getSelectedNonScholasticData()?.name : null,
      }

      if (isUpdateMode && existingAssignment) {
        // Update existing assignment
        await academicsApi.update(
          'subject-stream-assignment/update',
          existingAssignment.id,
          assignmentData,
        )
        showAlert('Assignment updated successfully!', 'success')
      } else {
        // Create new assignment
        await academicsApi.create('subject-stream-assignment/add', assignmentData)
        showAlert('Assignment created successfully!', 'success')
      }

      // Refresh the assignment data
      await fetchExistingAssignment()
    } catch (error) {
      console.error('Error saving assignment:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Error saving assignment'
      showAlert(errorMessage, 'danger')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssignment = async () => {
    if (!existingAssignment) return

    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return
    }

    try {
      setLoading(true)
      await academicsApi.delete(`subject-stream-assignment/delete/${existingAssignment.id}`)
      showAlert('Assignment deleted successfully!', 'success')

      // Reset state
      setExistingAssignment(null)
      setIsUpdateMode(false)
      resetSelections()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      showAlert('Error deleting assignment', 'danger')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Assign Subject Stream</strong>
            {existingAssignment && (
              <CBadge color="info" className="ms-2">
                Assignment exists - Update mode
              </CBadge>
            )}
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

              {/* Class, Section, Group Selection */}
              <CRow className="mb-3">
                <CCol md={4}>
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

                <CCol md={4}>
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

                <CCol md={4}>
                  <CFormLabel htmlFor="groupSelect">Group</CFormLabel>
                  <CFormSelect
                    id="groupSelect"
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="">Select Group</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              {/* Stream and Non-Scholastic Selection */}
              <CRow className="mb-4">
                <CCol md={6}>
                  <CFormLabel htmlFor="streamSelect">Stream</CFormLabel>
                  <CFormSelect
                    id="streamSelect"
                    value={selectedStream}
                    onChange={(e) => handleStreamChange(e.target.value)}
                  >
                    <option value="">Select Stream</option>
                    {streams.map((stream) => (
                      <option key={stream.id} value={stream.id}>
                        {stream.title}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="nonScholasticSelect">Non-Scholastic</CFormLabel>
                  <CFormSelect
                    id="nonScholasticSelect"
                    value={selectedNonScholastic}
                    onChange={(e) => handleNonScholasticChange(e.target.value)}
                  >
                    <option value="">Select Non-Scholastic Activity</option>
                    {nonScholasticOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
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
                        <div>
                          {isUpdateMode && existingAssignment && (
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={handleDeleteAssignment}
                              disabled={loading}
                              className="me-2"
                            >
                              Delete Assignment
                            </CButton>
                          )}
                          <CButton
                            color={isUpdateMode ? 'warning' : 'success'}
                            onClick={handleSaveAssignments}
                            disabled={(!selectedStream && !selectedNonScholastic) || loading}
                          >
                            {loading ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                {isUpdateMode ? 'Updating...' : 'Saving...'}
                              </>
                            ) : isUpdateMode ? (
                              'Update Assignment'
                            ) : (
                              'Save Assignment'
                            )}
                          </CButton>
                        </div>
                      </div>

                      <CTable hover responsive>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">S/No.</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Reg No.</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Stream</CTableHeaderCell>
                            <CTableHeaderCell scope="col">Non-Scholastic</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {filteredStudents.map((student, index) => (
                            <CTableRow key={student.id}>
                              <CTableDataCell>{index + 1}</CTableDataCell>
                              <CTableDataCell>{student.admissionNumber}</CTableDataCell>
                              <CTableDataCell>{student.name}</CTableDataCell>
                              <CTableDataCell>
                                {student.className} - {student.sectionName}
                              </CTableDataCell>
                              <CTableDataCell>
                                {selectedStream ? (
                                  <div>
                                    <div className="fw-bold">{getSelectedStreamData()?.title}</div>
                                    {getSelectedStreamData()?.subjects && (
                                      <div className="d-flex flex-wrap gap-1 mt-1">
                                        {getSelectedStreamData().subjects.map((subject, idx) => (
                                          <CBadge
                                            key={idx}
                                            color="primary"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            {subject.name}
                                          </CBadge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted">Not assigned</span>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                {selectedNonScholastic ? (
                                  <CBadge color="info">
                                    {getSelectedNonScholasticData()?.name}
                                  </CBadge>
                                ) : (
                                  <span className="text-muted">Not assigned</span>
                                )}
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

export default AssignStream
