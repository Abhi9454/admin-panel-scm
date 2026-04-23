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
  CBadge,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import teacherManagementApi from 'src/api/teacherManagementApi'

const STATUS_COLORS = {
  Active: 'success',
  Inactive: 'secondary',
  'On Leave': 'warning',
}

const AllTeacher = () => {
  const [teachers, setTeachers] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const navigate = useNavigate()

  const teachersPerPage = 25

  useEffect(() => {
    fetchTeachers()
  }, [currentPage, selectedStatus, searchTerm])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const params = { page: currentPage, page_size: teachersPerPage }
      if (searchTerm.length >= 2) params.search = searchTerm
      if (selectedStatus) params.status = selectedStatus

      const response = await teacherManagementApi.getAll(params)
      setTeachers(response.results || [])
      setTotalCount(response.count || 0)
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (empCode) => {
    navigate('/teacher/edit-teacher', { state: { empCode } })
  }

  const handleAttendance = (empCode) => {
    navigate('/teacher/teacher-attendance', { state: { empCode } })
  }

  const handleAssignments = (empCode) => {
    navigate('/teacher/teacher-assignments', { state: { empCode } })
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedStatus('')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalCount / teachersPerPage)
  const startIndex = (currentPage - 1) * teachersPerPage
  const showNoMessage = !loading && teachers.length === 0

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          {/* Compact Header */}
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center g-2">
              <CCol lg={2} md={12}>
                <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                  All Teachers
                  <CBadge color="info" className="ms-2 fs-7">
                    {totalCount}
                  </CBadge>
                </h6>
              </CCol>

              {/* Search */}
              <CCol lg={4} md={5} sm={6}>
                <CFormInput
                  size="sm"
                  type="text"
                  placeholder="Search by name, emp code or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </CCol>

              {/* Status Filter */}
              <CCol lg={2} md={3} sm={6}>
                <CFormSelect
                  size="sm"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </CFormSelect>
              </CCol>

              {/* Actions */}
              <CCol lg={4} md={4} sm={12} className="d-flex gap-2 justify-content-end">
                <CButton size="sm" color="outline-secondary" onClick={resetFilters}>
                  Reset
                </CButton>
                <CButton
                  size="sm"
                  color="primary"
                  onClick={() => navigate('/teacher/add-teacher')}
                >
                  + Add Teacher
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading teachers...</span>
            </div>
          ) : showNoMessage ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <p className="mb-2">No teachers found matching your criteria</p>
                <CButton size="sm" color="link" onClick={resetFilters}>
                  Clear all filters
                </CButton>
              </div>
            </div>
          ) : (
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable hover className="mb-0" small>
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="py-2 px-3 fw-semibold border-end">
                        Emp Code
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 fw-semibold border-end">
                        Teacher Name
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 fw-semibold border-end">
                        Email
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 fw-semibold border-end text-center">
                        Classes
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 fw-semibold border-end">
                        Status
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 fw-semibold text-center">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {teachers.map((teacher) => (
                      <CTableRow key={teacher.emp_code} className="align-middle">
                        <CTableDataCell className="py-2 px-3 border-end">
                          <span className="badge bg-light text-dark border">
                            {teacher.emp_code}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 border-end">
                          <div className="fw-semibold">{teacher.emp_name}</div>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 border-end">
                          <small>{teacher.email || 'N/A'}</small>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 border-end text-center">
                          <CBadge color="info">{teacher.classes_count ?? 0}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 border-end">
                          <CBadge color={STATUS_COLORS[teacher.emp_status] || 'secondary'}>
                            {teacher.emp_status || 'N/A'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <CButton
                              color="warning"
                              size="sm"
                              onClick={() => handleView(teacher.emp_code)}
                              className="px-2 py-1"
                              title="Edit Profile"
                            >
                              Edit
                            </CButton>
                            <CButton
                              color="info"
                              size="sm"
                              onClick={() => handleAssignments(teacher.emp_code)}
                              className="px-2 py-1 text-white"
                              title="Class Assignments"
                            >
                              Classes
                            </CButton>
                            <CButton
                              color="secondary"
                              size="sm"
                              onClick={() => handleAttendance(teacher.emp_code)}
                              className="px-2 py-1"
                              title="Attendance"
                            >
                              Attend.
                            </CButton>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="border-top bg-light px-3 py-2">
                  <CRow className="align-items-center">
                    <CCol md={6} sm={12} className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Showing {startIndex + 1} to{' '}
                        {Math.min(startIndex + teachersPerPage, totalCount)} of {totalCount}{' '}
                        teachers
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

export default AllTeacher
