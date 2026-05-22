import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
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
import staffManagementApi from 'src/api/staffManagementApi'

const PAGE_SIZE = 20

const StaffLoginDetails = () => {
  const [data, setData] = useState({ count: 0, results: [] })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTeachers()
  }, [page, searchQuery])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const params = { page, page_size: PAGE_SIZE }
      if (searchQuery.length >= 2) params.search = searchQuery

      const result = await staffManagementApi.getAll(params)
      setData(result)
    } catch (err) {
      console.error('Failed to fetch staff login details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setPage(1)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setPage(1)
  }

  const totalPages = Math.ceil((data.count || 0) / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center g-2">
              <CCol lg={4} md={12}>
                <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                  Staff Login Details
                  <CBadge color="info" className="ms-2 fs-7">
                    {data.count || 0}
                  </CBadge>
                </h6>
              </CCol>

              <CCol lg={4} md={6} sm={6}>
                <CFormInput
                  size="sm"
                  placeholder="Search by name, emp code, or email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </CCol>

              <CCol lg={4} md={6} sm={6} className="text-end">
                <CButton size="sm" color="outline-secondary" onClick={resetFilters}>
                  Reset Filters
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          {loading ? (
            <div className="text-center py-3">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading...</span>
            </div>
          ) : data.results?.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-2">No staff or teacher records found.</p>
              <CButton size="sm" color="link" onClick={resetFilters}>
                Clear all filters
              </CButton>
            </div>
          ) : (
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable hover className="mb-0" small>
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Emp Code (User ID)
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Name
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Type
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Email (Login)
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Department
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Designation
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        Status
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {data.results.map((row) => (
                      <CTableRow key={row.emp_code} className="align-middle">
                        <CTableDataCell className="py-2 px-3">
                          <span className="badge bg-light text-dark border">{row.emp_code}</span>
                        </CTableDataCell>

                        <CTableDataCell className="py-2 px-3">
                          <div className="fw-semibold">{row.emp_name}</div>
                          {row.short_name && <small className="text-muted">({row.short_name})</small>}
                        </CTableDataCell>

                        <CTableDataCell className="py-2 px-3">
                          <CBadge color={row.user_type === 'staff' ? 'secondary' : 'primary'}>
                            {row.user_type === 'staff' ? 'Staff' : 'Teacher'}
                          </CBadge>
                        </CTableDataCell>

                        <CTableDataCell className="py-2 px-3">{row.email || '—'}</CTableDataCell>

                        <CTableDataCell className="py-2 px-3">
                          {row.department ? row.department.title : '—'}
                        </CTableDataCell>

                        <CTableDataCell className="py-2 px-3">
                          {row.designation ? row.designation.title : '—'}
                        </CTableDataCell>

                        <CTableDataCell className="py-2 px-3 text-center">
                          <CBadge color={row.emp_status === 'Active' ? 'success' : 'danger'}>
                            {row.emp_status || 'Unknown'}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {totalPages > 1 && (
                <div className="border-top bg-light px-3 py-2">
                  <CRow className="align-items-center">
                    <CCol md={6} sm={12} className="mb-2 mb-md-0">
                      <small className="text-muted">
                        Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, data.count)} of{' '}
                        {data.count} records
                      </small>
                    </CCol>
                    <CCol md={6} sm={12} className="text-md-end text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <CButton
                          color="outline-primary"
                          disabled={page === 1}
                          onClick={() => setPage(1)}
                          title="First Page"
                        >
                          ««
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous
                        </CButton>
                        <CButton color="primary" disabled>
                          {page} of {totalPages}
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={page === totalPages}
                          onClick={() => setPage(page + 1)}
                        >
                          Next
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={page === totalPages}
                          onClick={() => setPage(totalPages)}
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

export default StaffLoginDetails
