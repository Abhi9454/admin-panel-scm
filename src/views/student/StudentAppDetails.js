import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi' // Import API

const StudentAppDetails = () => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSection, setSelectedSection] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const studentsPerPage = 20

  // Fetch students and other dropdown data from API
  useEffect(() => {
    fetchData()
    fetchStudents()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classData, sectionData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
      ])
      setClasses(classData)
      setSections(sectionData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await studentManagementApi.getAll('all')
      setStudents(response)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }
  const filteredStudents = (students || []).filter((student) => {
    const matchesClass = selectedClass === 'All' || student.classId === Number(selectedClass)
    const matchesSection =
      selectedSection === 'All' || student.sectionId === Number(selectedSection)
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.sectionName?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesClass && matchesSection && matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const displayedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage)

  const showNoStudentsMessage = !loading && displayedStudents.length === 0

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Application Activity</strong>
            {/* Search Input */}
            <CFormInput
              className="mt-2 mb-2"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
            {/* Filter Controls */}
            <div className="table-controls">
              <CFormSelect
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setCurrentPage(1)
                }}
                className="mb-2"
              >
                <option value="All">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </CFormSelect>
              <CFormSelect
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value)
                  setCurrentPage(1)
                }}
                className="mb-2"
              >
                <option value="All">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </CFormSelect>
            </div>
          </CCardHeader>
          {loading === true ? (
            <div className="text-center m-2">
              <CSpinner color="primary" />
              <p>Loading please wait...</p>
            </div>
          ) : showNoStudentsMessage ? (
            <p className="text-center">Please wait...</p>
          ) : (
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Father Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Password</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Refundable Amount</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {displayedStudents.map((student) => (
                    <CTableRow key={student.id}>
                      <CTableDataCell>{student.name}</CTableDataCell>
                      <CTableDataCell>{student.fatherName || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{student.plainText || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{student.refundableSecurity || 'N/A'}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              {/* Pagination Controls */}
              <div className="pagination">
                <div className="pagination-buttons">
                  <CButton
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="m-2 bg-warning"
                  >
                    Previous
                  </CButton>
                  <CButton
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="m-2 bg-primary"
                  >
                    Next
                  </CButton>
                </div>
              </div>
            </CCardBody>
          )}
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentAppDetails
