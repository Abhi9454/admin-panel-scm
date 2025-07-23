import React, { useState, useEffect, useMemo } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'

const AllStudent = () => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSection, setSelectedSection] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentsLoaded, setStudentsLoaded] = useState(false)
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  const navigate = useNavigate()

  const studentsPerPage = 25 // Increased from 20 to show more records

  // Fetch students and other dropdown data from API
  useEffect(() => {
    fetchData()
    fetchStudents()
  }, [])

  // Update main loading state when both data sets are loaded
  useEffect(() => {
    setLoading(!(studentsLoaded && filtersLoaded))
  }, [studentsLoaded, filtersLoaded])

  const fetchData = async () => {
    try {
      const [classData, sectionData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
      ])
      setClasses(classData)
      setSections(sectionData)
      setFiltersLoaded(true)
    } catch (error) {
      console.error('Error fetching data:', error)
      setFiltersLoaded(true) // Set to true even on error to prevent infinite loading
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await studentManagementApi.getAll('all')
      setStudents(response)
      setStudentsLoaded(true)
      console.log(response)
    } catch (error) {
      console.error('Error fetching students:', error)
      setStudentsLoaded(true) // Set to true even on error to prevent infinite loading
    }
  }

  const handleEdit = (id) => {
    navigate('/student/edit-student', { state: { studentId: id } })
  }

  // Memoized filtered students for better performance
  const filteredStudents = useMemo(() => {
    return (students || []).filter((student) => {
      const matchesClass = selectedClass === 'All' || student.classId === Number(selectedClass)
      const matchesSection =
        selectedSection === 'All' || student.sectionId === Number(selectedSection)
      const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.sectionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesClass && matchesSection && matchesSearch
    })
  }, [students, selectedClass, selectedSection, searchTerm])

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const displayedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage)

  const showNoStudentsMessage = !loading && displayedStudents.length === 0

  const resetFilters = () => {
    setSelectedClass('All')
    setSelectedSection('All')
    setSearchTerm('')
    setCurrentPage(1)
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          {/* Compact Horizontal Header */}
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center g-2">
              <CCol lg={2} md={12}>
                <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                  All Students
                  <CBadge color="info" className="ms-2 fs-7">
                    {filteredStudents.length}
                  </CBadge>
                </h6>
              </CCol>

              {/* Search Input */}
              <CCol lg={3} md={4} sm={6}>
                <CFormInput
                  size="sm"
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </CCol>

              {/* Class Filter */}
              <CCol lg={2} md={3} sm={6}>
                <CFormSelect
                  size="sm"
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="All">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Section Filter */}
              <CCol lg={2} md={3} sm={6}>
                <CFormSelect
                  size="sm"
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="All">All Sections</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Reset Button */}
              <CCol lg={3} md={2} sm={6}>
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={resetFilters}
                  className="w-100"
                >
                  Reset Filters
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          {loading ? (
            <div className="text-center py-3">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading students...</span>
            </div>
          ) : showNoStudentsMessage ? (
            <div className="text-center py-4">
              <div className="text-muted">
                <p className="mb-2">No students found matching your criteria</p>
                <CButton size="sm" color="link" onClick={resetFilters}>
                  Clear all filters
                </CButton>
              </div>
            </div>
          ) : (
            <CCardBody className="p-0">
              {/* Compact Responsive Table */}
              <div className="table-responsive">
                <CTable hover className="mb-0" small>
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Student Name
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Admission No.
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Class
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Section
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        City
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Gender
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        Action
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {displayedStudents.map((student) => (
                      <CTableRow key={student.id} className="align-middle">
                        <CTableDataCell className="py-2 px-3">
                          <div className="fw-semibold text-light">{student.name}</div>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          <span className="badge bg-light text-dark border">
                            {student.admissionNumber}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          {student.className || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          {student.sectionName || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          {student.cityName || 'N/A'}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          <CBadge
                            color={student.gender === 'Male' ? 'info' : 'success'}
                            className="text-white"
                          >
                            {student.gender}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleEdit(student.id)}
                            className="px-3 py-1"
                          >
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Compact Pagination Footer */}
              {totalPages > 1 && (
                <div className="border-top bg-light px-3 py-2">
                  <CRow className="align-items-center">
                    <CCol md={6} sm={12} className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Showing {startIndex + 1} to{' '}
                        {Math.min(startIndex + studentsPerPage, filteredStudents.length)} of{' '}
                        {filteredStudents.length} students
                      </small>
                    </CCol>
                    <CCol md={6} sm={12} className="text-md-end text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                          title="First Page"
                        >
                          ««
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </CButton>
                        <CButton color="primary" disabled>
                          {currentPage} of {totalPages}
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          title="Last Page"
                        >
                          »»
                        </CButton>
                      </div>
                    </CCol>
                  </CRow>
                </div>
              )}
            </CCardBody>
          )}
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AllStudent
