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

const MyAssignments = () => {
  const [activeKey, setActiveKey] = useState(1)
  const [assignments, setAssignments] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE_URL = 'http://localhost:8000/api'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Assuming headers would contain the teacher's auth token
      const headers = {
        // 'Authorization': 'Bearer <teacher_token>'
      }

      const [assignmentsRes, classesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/teacher/my-assignments/`, { headers }),
        fetch(`${API_BASE_URL}/teacher/my-classes/`, { headers })
      ])

      if (!assignmentsRes.ok) throw new Error('Failed to fetch assignments')
      if (!classesRes.ok) throw new Error('Failed to fetch classes')

      const assignmentsData = await assignmentsRes.json()
      const classesData = await classesRes.json()

      setAssignments(assignmentsData.results || assignmentsData)
      setClasses(classesData.results || classesData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>My Schedule & Assignments</strong>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}

            <CNav variant="tabs" role="tablist">
              <CNavItem>
                <CNavLink
                  active={activeKey === 1}
                  onClick={() => setActiveKey(1)}
                  style={{ cursor: 'pointer' }}
                >
                  My Subjects
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeKey === 2}
                  onClick={() => setActiveKey(2)}
                  style={{ cursor: 'pointer' }}
                >
                  My Incharge Classes
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent className="mt-4">
              <CTabPane visible={activeKey === 1}>
                {loading ? (
                  <div className="text-center"><CSpinner /></div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Subject</th>
                        <th>Incharge</th>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {assignments.length > 0 ? assignments.map((a) => (
                        <CTableRow key={a.id}>
                          <CTableDataCell>{a.class_title}</CTableDataCell>
                          <CTableDataCell>{a.section_title}</CTableDataCell>
                          <CTableDataCell>
                            {a.subject_title ? <CBadge color="primary">{a.subject_title}</CBadge> : <span className="text-muted">—</span>}
                          </CTableDataCell>
                          <CTableDataCell>
                            {a.incharge && <CBadge color="success">Yes</CBadge>}
                          </CTableDataCell>
                        </CTableRow>
                      )) : (
                        <CTableRow>
                          <CTableDataCell colSpan="4" className="text-center">No assignments found.</CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>

              <CTabPane visible={activeKey === 2}>
                {loading ? (
                  <div className="text-center"><CSpinner /></div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <th>Class</th>
                        <th>Section</th>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {classes.length > 0 ? classes.map((c, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>{c.class_title}</CTableDataCell>
                          <CTableDataCell>{c.section_title}</CTableDataCell>
                        </CTableRow>
                      )) : (
                        <CTableRow>
                          <CTableDataCell colSpan="2" className="text-center">You are not incharge of any classes.</CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
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
