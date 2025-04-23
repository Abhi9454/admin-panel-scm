import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormSelect,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const studentList = []

const StudentAttendance = () => {
  const [searchDate, setSearchDate] = useState('')
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSection, setSelectedSection] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const filteredStudents = studentList.filter((student) => {
    const matchesDate = !searchDate || student.date === searchDate
    const matchesClass = selectedClass === 'All' || student.class === selectedClass
    const matchesSection = selectedSection === 'All' || student.section === selectedSection
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus
    return matchesDate && matchesClass && matchesSection && matchesStatus
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Attendance</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={3}>
                <CFormInput
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="All">All Classes</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="All">All Sections</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Father Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Section</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <CTableRow key={student.id}>
                      <CTableDataCell>{student.name}</CTableDataCell>
                      <CTableDataCell>{student.fatherName}</CTableDataCell>
                      <CTableDataCell>{student.class}</CTableDataCell>
                      <CTableDataCell>{student.section}</CTableDataCell>
                      <CTableDataCell>{student.status}</CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="5" className="text-center">
                      No records found.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentAttendance
