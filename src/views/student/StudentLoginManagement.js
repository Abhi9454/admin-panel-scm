import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
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
import studentLoginApi from 'src/api/studentLoginApi'
import masterApi from 'src/api/masterApi'

const PAGE_SIZE = 25

const StudentLoginManagement = () => {
  const [data, setData] = useState({ count: 0, results: [] })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [filters, setFilters] = useState({ q: '', is_active: '', is_locked: '', class_id: '' })
  const [actionLoading, setActionLoading] = useState(null)

  const [resetModal, setResetModal] = useState({ visible: false, adm_no: null, name: '' })
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    masterApi
      .getAll('classes')
      .then((r) => setClasses(r.results || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchLogins()
  }, [page, filters])

  const fetchLogins = async () => {
    try {
      setLoading(true)
      const params = { page, page_size: PAGE_SIZE }
      if (filters.q.length >= 2) params.q = filters.q
      if (filters.is_active !== '') params.is_active = filters.is_active
      if (filters.is_locked !== '') params.is_locked = filters.is_locked
      if (filters.class_id) params.class_id = filters.class_id
      const result = await studentLoginApi.getAllLogins(params)
      setData(result)
    } catch (err) {
      console.error('Failed to fetch student logins:', err)
    } finally {
      setLoading(false)
    }
  }

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ q: '', is_active: '', is_locked: '', class_id: '' })
    setPage(1)
  }

  const updateRow = (adm_no, patch) => {
    setData((prev) => ({
      ...prev,
      results: prev.results.map((r) => (r.adm_no === adm_no ? { ...r, ...patch } : r)),
    }))
  }

  const handleToggleActive = async (row) => {
    const newValue = !row.is_active
    setActionLoading(row.adm_no + '-active')
    try {
      await studentLoginApi.toggle(row.adm_no, { is_active: newValue })
      updateRow(row.adm_no, { is_active: newValue })
    } catch (err) {
      console.error('Toggle active failed:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnlock = async (adm_no) => {
    setActionLoading(adm_no + '-unlock')
    try {
      await studentLoginApi.toggle(adm_no, { is_locked: false })
      updateRow(adm_no, { is_locked: false, failed_login_attempts: 0 })
    } catch (err) {
      console.error('Unlock failed:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const openResetModal = (row) => {
    setResetModal({ visible: true, adm_no: row.adm_no, name: row.name })
    setNewPassword('')
  }

  const closeResetModal = () => {
    setResetModal({ visible: false, adm_no: null, name: '' })
  }

  const handleResetPassword = async () => {
    setActionLoading(resetModal.adm_no + '-reset')
    try {
      await studentLoginApi.resetPassword(resetModal.adm_no, newPassword || null)
      updateRow(resetModal.adm_no, {
        must_change_password: true,
        is_locked: false,
        failed_login_attempts: 0,
      })
      closeResetModal()
    } catch (err) {
      console.error('Reset password failed:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDateTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString()
  }

  const totalPages = Math.ceil(data.count / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE

  return (
    <>
      <CRow className="g-2">
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardHeader className="py-2 px-3">
              <CRow className="align-items-center g-2">
                <CCol lg={2} md={12}>
                  <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                    Student Logins
                    <CBadge color="info" className="ms-2 fs-7">
                      {data.count}
                    </CBadge>
                  </h6>
                </CCol>

                <CCol lg={3} md={4} sm={6}>
                  <CFormInput
                    size="sm"
                    placeholder="Search name / adm no / username..."
                    value={filters.q}
                    onChange={(e) => setFilter('q', e.target.value)}
                  />
                </CCol>

                <CCol lg={2} md={3} sm={6}>
                  <CFormSelect
                    size="sm"
                    value={filters.class_id}
                    onChange={(e) => setFilter('class_id', e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol lg={2} md={2} sm={6}>
                  <CFormSelect
                    size="sm"
                    value={filters.is_active}
                    onChange={(e) => setFilter('is_active', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </CFormSelect>
                </CCol>

                <CCol lg={1} md={2} sm={6}>
                  <CFormSelect
                    size="sm"
                    value={filters.is_locked}
                    onChange={(e) => setFilter('is_locked', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="true">Locked</option>
                    <option value="false">Unlocked</option>
                  </CFormSelect>
                </CCol>

                <CCol lg={2} md={1} sm={6}>
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
                <span className="text-muted">Loading...</span>
              </div>
            ) : data.results.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-2">No login records found.</p>
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
                          Adm No
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          Name
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          Father Name
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          Class / Sec
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          Last Login
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          Last IP
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                          Active
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                          Locked
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                          Actions
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {data.results.map((row) => (
                        <CTableRow key={row.adm_no} className="align-middle">
                          <CTableDataCell className="py-2 px-3">
                            <span className="badge bg-light text-dark border">{row.adm_no}</span>
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3">
                            <div className="fw-semibold">{row.name}</div>
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3">
                            {row.father_name || '—'}
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3">
                            {row.class_title}
                            {row.section_title ? ` - ${row.section_title}` : ''}
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3">
                            <small>{formatDateTime(row.last_login_time)}</small>
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3">
                            <small className="text-muted">{row.last_login_ip || '—'}</small>
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3 text-center">
                            <CBadge
                              color={row.is_active ? 'success' : 'danger'}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleActive(row)}
                              title={row.is_active ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {actionLoading === row.adm_no + '-active'
                                ? '...'
                                : row.is_active
                                  ? 'Active'
                                  : 'Inactive'}
                            </CBadge>
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3 text-center">
                            {row.is_locked ? (
                              <CBadge color="warning" className="text-dark">
                                Locked ({row.failed_login_attempts})
                              </CBadge>
                            ) : (
                              <CBadge color="secondary">—</CBadge>
                            )}
                          </CTableDataCell>

                          <CTableDataCell className="py-2 px-3 text-center">
                            <div className="d-flex gap-1 justify-content-center flex-wrap">
                              <CButton
                                size="sm"
                                color="info"
                                variant="outline"
                                onClick={() => openResetModal(row)}
                                disabled={actionLoading === row.adm_no + '-reset'}
                                className="py-0 px-2"
                              >
                                Reset Pwd
                              </CButton>
                              {row.is_locked && (
                                <CButton
                                  size="sm"
                                  color="warning"
                                  variant="outline"
                                  onClick={() => handleUnlock(row.adm_no)}
                                  disabled={actionLoading === row.adm_no + '-unlock'}
                                  className="py-0 px-2"
                                >
                                  {actionLoading === row.adm_no + '-unlock' ? '...' : 'Unlock'}
                                </CButton>
                              )}
                            </div>
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
                          Showing {startIndex + 1} to{' '}
                          {Math.min(startIndex + PAGE_SIZE, data.count)} of {data.count} records
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

      <CModal visible={resetModal.visible} onClose={closeResetModal}>
        <CModalHeader>
          <CModalTitle>
            Reset Password — {resetModal.name} ({resetModal.adm_no})
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="text-muted small mb-3">
            Leave blank to reset to the admission number (
            <strong>{resetModal.adm_no}</strong>). The student will be prompted to change their
            password on next login.
          </p>
          <CFormInput
            type="password"
            placeholder={`New password (or blank to use ${resetModal.adm_no})`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={closeResetModal}>
            Cancel
          </CButton>
          <CButton
            color="danger"
            onClick={handleResetPassword}
            disabled={actionLoading === resetModal.adm_no + '-reset'}
          >
            {actionLoading === resetModal.adm_no + '-reset' ? 'Resetting...' : 'Reset Password'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default StudentLoginManagement
