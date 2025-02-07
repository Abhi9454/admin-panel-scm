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

// Generate sample teacher data (40 records)
const teachers = Array.from({ length: 40 }, (_, i) => {
    // Calculate a DOJ (date of joining) between 2015 and 2020
    const year = 2015 + (i % 6); 
    const month = ((i % 12) + 1).toString().padStart(2, "0");
    const doj = `${year}-${month}-15`;
    
    const subjects = ["Math", "Science", "History", "English", "Geography"];
    const statusTypes = ["Permanent", "Contractual", "Guest"];
    
    return {
      id: i + 1,
      name: `Teacher ${i + 1}`,
      doj,
      parentName: `Parent ${i + 1}`,
      subject: subjects[i % subjects.length],
      statusType: statusTypes[i % statusTypes.length],
    };
  });

const AllTeacher = () => {
  // Pagination state and filter states
   // Pagination state
   const [currentPage, setCurrentPage] = useState(1);
   // Filter state for subject and status type
   const [selectedSubject, setSelectedSubject] = useState("All");
   const [selectedStatus, setSelectedStatus] = useState("All");
   // Search term for filtering by teacher name or parent's name
   const [searchTerm, setSearchTerm] = useState("");

   const teachersPerPage = 15;

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
  }

 
  // Filter teachers based on subject, status type, and search term.
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSubject =
      selectedSubject === "All" || teacher.subject === selectedSubject;
    const matchesStatus =
      selectedStatus === "All" || teacher.statusType === selectedStatus;
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeachers.length / teachersPerPage);
  const startIndex = (currentPage - 1) * teachersPerPage ;
  const displayedTeachers = filteredTeachers.slice(
    startIndex,
    startIndex + teachersPerPage
  );

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Teachers</strong>
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
                value={selectedSubject}
                onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1)
                }}
                className='mb-2'
              >
                <option value="All">All Subjects</option>
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="English">English</option>
              </CFormSelect>
              <CFormSelect
                value={selectedStatus}
                onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                }}
                className='mb-2'
              >
                <option value="All">All Status</option>
                <option value="Paid">Permanent</option>
                <option value="Pending">Contractual</option>
                <option value="Pending">Guest</option>
              </CFormSelect>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">DOJ</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Parent Name</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Status Type</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {displayedTeachers.map((cls) => (
                  <CTableRow key={cls.id}>
                    <CTableDataCell>{cls.name}</CTableDataCell>
                    <CTableDataCell>{cls.doj}</CTableDataCell>
                    <CTableDataCell>{cls.parentName}</CTableDataCell>
                    <CTableDataCell>{cls.subject}</CTableDataCell>
                    <CTableDataCell>{cls.statusType}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEdit(cls.id)}>
                        Edit
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {displayedTeachers.length === 0 && (
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
                <CButton disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className='m-2 bg-warning'>
                  Previous
                </CButton>
                <CButton disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className='m-2 bg-primary'>
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

export default AllTeacher
