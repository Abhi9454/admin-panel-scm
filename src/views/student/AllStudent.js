import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'
import { useNavigate } from 'react-router-dom'

const recentStudents = [
  {
    id: 1,
    name: 'Rakul Kaur',
    class: '10',
    section: 'A',
    parentName: 'Sujit Singh',
    feesStatus: 'Paid',
  },
  {
    id: 2,
    name: 'Simranjeet Singh',
    class: '9',
    section: 'B',
    parentName: 'RamanPreet Singh',
    feesStatus: 'Pending',
  },
  {
    id: 3,
    name: 'Vihan Rajput',
    class: '8',
    section: 'C',
    parentName: 'Rajkumar Johnson',
    feesStatus: 'Paid',
  },
  {
    id: 4,
    name: 'Abhilash Singh',
    class: '11',
    section: 'A',
    parentName: 'Simranjeet S',
    feesStatus: 'Paid',
  },
  {
    id: 5,
    name: 'Gurleen Kaur',
    class: '12',
    section: 'D',
    parentName: 'Balraj Singh',
    feesStatus: 'Pending',
  },
  {
    id: 6,
    name: 'Ranbir Singh',
    class: '10',
    section: 'B',
    parentName: 'Gurmeet Brown',
    feesStatus: 'Paid',
  },
  {
    id: 7,
    name: 'Diljeet Singh',
    class: '9',
    section: 'C',
    parentName: 'Amar Singh',
    feesStatus: 'Paid',
  },
  {
    id: 8,
    name: 'Arjan R',
    class: '8',
    section: 'A',
    parentName: 'Aarav Singh',
    feesStatus: 'Pending',
  },
  {
    id: 9,
    name: 'Gurpreet Singh',
    class: '11',
    section: 'D',
    parentName: 'Balminder Kaur',
    feesStatus: 'Paid',
  },
  {
    id: 10,
    name: 'Amritpal Singh',
    class: '12',
    section: 'B',
    parentName: 'Bhagwan Das',
    feesStatus: 'Pending',
  },
]

const AllStudent = () => {
  // Pagination state and filter states
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSection, setSelectedSection] = useState('All')
  const [selectedFeesStatus, setSelectedFeesStatus] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const studentsPerPage = 20
  const [students, setStudents] = useState(recentStudents)

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
    navigate('/student/edit-student', { state: { studentId: id } })
  }

  // Filter the student list
  const filteredStudents = students.filter((student) => {
    const matchesClass = selectedClass === 'All' || student.class === selectedClass
    const matchesSection = selectedSection === 'All' || student.section === selectedSection
    const matchesFees = selectedFeesStatus === 'All' || student.feesStatus === selectedFeesStatus
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.feesStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesClass && matchesSection && matchesFees && matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const startIndex = (currentPage - 1) * studentsPerPage
  const displayedStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Students</strong>
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
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
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
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </CFormSelect>
              <CFormSelect
                value={selectedFeesStatus}
                onChange={(e) => {
                  setSelectedFeesStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="mb-2"
              >
                <option value="All">All Fees Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </CFormSelect>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Section</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Father Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Fees Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {displayedStudents.map((cls) => (
                  <CTableRow key={cls.id}>
                    <CTableDataCell>{cls.name}</CTableDataCell>
                    <CTableDataCell>{cls.class}</CTableDataCell>
                    <CTableDataCell>{cls.section}</CTableDataCell>
                    <CTableDataCell>{cls.parentName}</CTableDataCell>
                    <CTableDataCell>{cls.feesStatus}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEdit(cls.id)}>
                        Edit
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filteredStudents.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={6}>No records found.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
            {/* Pagination Controls */}
            <div className="pagination">
              {/* <span>Page {currentPage} of {totalPages}</span> */}
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
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AllStudent
