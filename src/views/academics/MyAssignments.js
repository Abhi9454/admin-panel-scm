import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBook, cilPeople, cilCheckCircle } from '@coreui/icons'
import staffManagementApi from 'src/api/staffManagementApi'

const MyAssignments = () => {
  const [activeKey, setActiveKey] = useState(1)
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [assignmentsData, classesData] = await Promise.all([
        staffManagementApi.getMyAssignments(),
        staffManagementApi.getMyClasses(),
      ])

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.results || [])
      setClasses(Array.isArray(classesData) ? classesData : classesData.results || [])
    } catch (err) {
      console.error('Error fetching teacher schedule:', err)
      setError(err.message || 'Failed to fetch your schedule and class assignments.')
    } finally {
      setLoading(false)
    }
  }

  // Filter incharge classes for the second tab
  const inchargeClasses = classes.filter((c) => c.incharge)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="shadow-sm border-0 mb-4">
          <CCardHeader className="bg-primary text-white py-3">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <CIcon icon={cilBook} className="me-2" />
              My Teaching Schedule & Assignments
            </h5>
          </CCardHeader>
          <CCardBody className="p-4">
            {error && <CAlert color="danger" className="mb-4">{error}</CAlert>}

            <CNav variant="tabs" role="tablist" className="border-bottom-2">
              <CNavItem>
                <CNavLink
                  active={activeKey === 1}
                  onClick={() => setActiveKey(1)}
                  style={{ cursor: 'pointer' }}
                  className="fw-semibold px-4 py-2"
                >
                  <CIcon icon={cilBook} className="me-2" />
                  My Subjects & Classes ({assignments.length})
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeKey === 2}
                  onClick={() => setActiveKey(2)}
                  style={{ cursor: 'pointer' }}
                  className="fw-semibold px-4 py-2"
                >
                  <CIcon icon={cilPeople} className="me-2" />
                  Incharge Classes ({inchargeClasses.length})
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="mt-4">
              {/* Tab 1: All assigned subjects and classes */}
              <CTabPane visible={activeKey === 1}>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <div className="text-muted mt-2 small">Loading subjects...</div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <CTable hover align="middle" className="mb-0">
                      <CTableHead className="table-light">
                        <CTableRow>
                          <CTableHeaderCell className="ps-4">Class</CTableHeaderCell>
                          <CTableHeaderCell>Section</CTableHeaderCell>
                          <CTableHeaderCell>Subject Taught</CTableHeaderCell>
                          <CTableHeaderCell>Role / Responsibility</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {assignments.length > 0 ? (
                          assignments.map((a) => (
                            <CTableRow key={a.id}>
                              <CTableDataCell className="ps-4 fw-semibold text-dark">
                                {a.class_title}
                              </CTableDataCell>
                              <CTableDataCell className="fw-semibold text-dark">
                                {a.section_title}
                              </CTableDataCell>
                              <CTableDataCell>
                                {a.subject_title ? (
                                  <span className="badge bg-primary px-3 py-2">
                                    {a.subject_title}
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary px-3 py-2 text-uppercase">
                                    General Teacher
                                  </span>
                                )}
                              </CTableDataCell>
                              <CTableDataCell>
                                {a.incharge ? (
                                  <CBadge color="success" shape="rounded-pill" className="px-2 py-1">
                                    <CIcon icon={cilCheckCircle} className="me-1" />
                                    Attendance Incharge
                                  </CBadge>
                                ) : (
                                  <span className="text-muted small">—</span>
                                )}
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan="4" className="text-center py-5 text-muted">
                              No assignments mapped to your teacher profile.
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
              </CTabPane>

              {/* Tab 2: Class incharge responsibilities */}
              <CTabPane visible={activeKey === 2}>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <div className="text-muted mt-2 small">Loading class lists...</div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <CTable hover align="middle" className="mb-0">
                      <CTableHead className="table-light">
                        <CTableRow>
                          <CTableHeaderCell className="ps-4">Class Name</CTableHeaderCell>
                          <CTableHeaderCell>Section Name</CTableHeaderCell>
                          <CTableHeaderCell>Role</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {inchargeClasses.length > 0 ? (
                          inchargeClasses.map((c, index) => (
                            <CTableRow key={index}>
                              <CTableDataCell className="ps-4 fw-semibold text-dark">
                                {c.class_title}
                              </CTableDataCell>
                              <CTableDataCell className="fw-semibold text-dark">
                                {c.section_title}
                              </CTableDataCell>
                              <CTableDataCell>
                                <span className="badge bg-success px-3 py-2 text-uppercase">
                                  Incharge
                                </span>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        ) : (
                          <CTableRow>
                            <CTableDataCell colSpan="3" className="text-center py-5 text-muted">
                              You are not currently marked as the Attendance Incharge for any class.
                            </CTableDataCell>
                          </CTableRow>
                        )}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MyAssignments
