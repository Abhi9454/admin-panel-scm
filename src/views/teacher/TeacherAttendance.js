import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
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
  CAlert,
} from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import teacherManagementApi from 'src/api/teacherManagementApi'

const STATUS_COLORS = {
  present: 'success',
  absent: 'danger',
  half_day: 'warning',
  leave: 'info',
}

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  half_day: 'Half Day',
  leave: 'Leave',
}

const today = new Date().toISOString().split('T')[0]
const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const EMPTY_MARK_FORM = {
  emp_code: '',
  attendance_date: today,
  status: 'present',
  check_in_time: '',
  check_out_time: '',
  remarks: '',
}

const TeacherAttendance = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const empCodeFromState = location.state?.empCode || ''

  const [records, setRecords] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [teachers, setTeachers] = useState([])

  // Filters
  const [filterEmpCode, setFilterEmpCode] = useState(empCodeFromState)
  const [filterFromDate, setFilterFromDate] = useState(oneMonthAgo)
  const [filterToDate, setFilterToDate] = useState(today)
  const [filterStatus, setFilterStatus] = useState('')

  // Summary
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Mark attendance modal
  const [markModalVisible, setMarkModalVisible] = useState(false)
  const [markForm, setMarkForm] = useState(EMPTY_MARK_FORM)
  const [markSaving, setMarkSaving] = useState(false)

  // Edit modal
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editSaving, setEditSaving] = useState(false)

  const [alert, setAlert] = useState(null)

  const perPage = 25

  useEffect(() => {
    teacherManagementApi.getAll({ page_size: 200 }).then((res) => {
      setTeachers(res.results || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [currentPage, filterEmpCode, filterFromDate, filterToDate, filterStatus])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const params = { page: currentPage, page_size: perPage }
      if (filterEmpCode) params.emp_code = filterEmpCode
      if (filterFromDate) params.from_date = filterFromDate
      if (filterToDate) params.to_date = filterToDate
      if (filterStatus) params.status = filterStatus

      const response = await teacherManagementApi.getAttendance(params)
      setRecords(response.results || [])
      setTotalCount(response.count || 0)
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    if (!filterEmpCode || !filterFromDate || !filterToDate) {
      setAlert({ type: 'warning', message: 'Please enter Emp Code, From Date, and To Date to view summary.' })
      return
    }
    setSummaryLoading(true)
    setSummary(null)
    try {
      const data = await teacherManagementApi.getAttendanceSummary({
        emp_code: filterEmpCode,
        from_date: filterFromDate,
        to_date: filterToDate,
      })
      setSummary(data)
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to load summary.' })
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleMarkFormChange = (e) => {
    const { id, value } = e.target
    setMarkForm((prev) => ({ ...prev, [id]: value }))
  }

  const handleMarkSubmit = async (e) => {
    e.preventDefault()
    setMarkSaving(true)
    setAlert(null)
    try {
      await teacherManagementApi.markAttendance({
        emp_code: Number(markForm.emp_code),
        attendance_date: markForm.attendance_date,
        status: markForm.status,
        check_in_time: markForm.check_in_time ? `${markForm.check_in_time}:00` : undefined,
        check_out_time: markForm.check_out_time ? `${markForm.check_out_time}:00` : undefined,
        remarks: markForm.remarks || undefined,
      })
      setAlert({ type: 'success', message: 'Attendance marked successfully.' })
      setMarkModalVisible(false)
      setMarkForm(EMPTY_MARK_FORM)
      fetchRecords()
    } catch (err) {
      const msg =
        err?.response?.status === 409
          ? 'Attendance already marked for this date.'
          : 'Failed to mark attendance.'
      setAlert({ type: 'danger', message: msg })
    } finally {
      setMarkSaving(false)
    }
  }

  const handleOpenEdit = (record) => {
    setEditRecord(record)
    setEditForm({
      status: record.status,
      check_in_time: record.check_in_time || '',
      check_out_time: record.check_out_time || '',
      remarks: record.remarks || '',
    })
    setEditModalVisible(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditSaving(true)
    setAlert(null)
    try {
      await teacherManagementApi.updateAttendance(editRecord.id, {
        status: editForm.status,
        check_in_time: editForm.check_in_time ? `${editForm.check_in_time}:00` : undefined,
        check_out_time: editForm.check_out_time ? `${editForm.check_out_time}:00` : undefined,
        remarks: editForm.remarks || undefined,
      })
      setAlert({ type: 'success', message: 'Attendance record updated.' })
      setEditModalVisible(false)
      fetchRecords()
    } catch {
      setAlert({ type: 'danger', message: 'Failed to update attendance.' })
    } finally {
      setEditSaving(false)
    }
  }

  const totalPages = Math.ceil(totalCount / perPage)
  const startIndex = (currentPage - 1) * perPage

  return (
    <CRow className="g-2">
      {/* Summary Card */}
      {summary && (
        <CCol xs={12}>
          <CCard className="shadow-sm border-start border-4 border-primary">
            <CCardBody className="py-2 px-3">
              <CRow className="align-items-center">
                <CCol>
                  <h6 className="fw-bold mb-1">
                    Attendance Summary — {summary.emp_name} ({summary.emp_code})
                  </h6>
                  <small className="text-muted">
                    {summary.period?.from_date} to {summary.period?.to_date}
                  </small>
                </CCol>
                <CCol xs="auto">
                  <CButton
                    size="sm"
                    color="outline-secondary"
                    onClick={() => setSummary(null)}
                  >
                    Close
                  </CButton>
                </CCol>
              </CRow>
              <CRow className="g-2 mt-1">
                {[
                  { label: 'Total Days', value: summary.summary?.total_working_days, color: 'secondary' },
                  { label: 'Present', value: summary.summary?.present_days, color: 'success' },
                  { label: 'Absent', value: summary.summary?.absent_days, color: 'danger' },
                  { label: 'Half Day', value: summary.summary?.half_day_leaves, color: 'warning' },
                  { label: 'On Leave', value: summary.summary?.on_leave_days, color: 'info' },
                  {
                    label: 'Attendance %',
                    value: `${summary.summary?.attendance_percentage?.toFixed(1)}%`,
                    color: summary.summary?.attendance_percentage >= 75 ? 'success' : 'danger',
                  },
                ].map(({ label, value, color }) => (
                  <CCol key={label} xs={6} sm={4} md={2}>
                    <div className="text-center p-2 bg-light rounded">
                      <div className={`fw-bold text-${color} fs-5`}>{value}</div>
                      <small className="text-muted">{label}</small>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      )}

      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center g-2">
              <CCol lg={2} md={12}>
                <h6 className="mb-0 fw-bold text-primary d-flex align-items-center">
                  Staff Attendance
                  <CBadge color="info" className="ms-2">
                    {totalCount}
                  </CBadge>
                </h6>
              </CCol>

              {/* Filters */}
              <CCol lg={3} md={4} sm={8}>
                <CFormSelect
                  size="sm"
                  value={filterEmpCode}
                  onChange={(e) => {
                    setFilterEmpCode(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.emp_code} value={t.emp_code}>
                      [{t.emp_code}] {t.emp_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol lg={2} md={3} sm={6}>
                <CFormInput
                  size="sm"
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => {
                    setFilterFromDate(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </CCol>
              <CCol lg={2} md={3} sm={6}>
                <CFormInput
                  size="sm"
                  type="date"
                  value={filterToDate}
                  onChange={(e) => {
                    setFilterToDate(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </CCol>
              <CCol lg={1} md={3} sm={6}>
                <CFormSelect
                  size="sm"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value)
                    setCurrentPage(1)
                  }}
                >
                  <option value="">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">Leave</option>
                </CFormSelect>
              </CCol>

              {/* Action Buttons */}
              <CCol lg={3} md={12} className="d-flex gap-2 justify-content-end flex-wrap">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={() => navigate('/teacher/all-teachers')}
                >
                  ← Back
                </CButton>
                <CButton
                  size="sm"
                  color="outline-info"
                  onClick={fetchSummary}
                  disabled={summaryLoading}
                >
                  {summaryLoading ? <CSpinner size="sm" /> : 'Summary'}
                </CButton>
                <CButton
                  size="sm"
                  color="primary"
                  onClick={() => {
                    setMarkForm({ ...EMPTY_MARK_FORM, emp_code: filterEmpCode })
                    setMarkModalVisible(true)
                  }}
                >
                  + Mark
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          {alert && (
            <div className="px-3 pt-2">
              <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </CAlert>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading attendance records...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No attendance records found.</p>
            </div>
          ) : (
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable hover small className="mb-0">
                  <CTableHead className="table-light">
                    <CTableRow>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Emp Code
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Teacher Name
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Date
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Status
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Check In
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Check Out
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                        Remarks
                      </CTableHeaderCell>
                      <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                        Action
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {records.map((r) => (
                      <CTableRow key={r.id} className="align-middle">
                        <CTableDataCell className="py-2 px-3">
                          <span className="badge bg-light text-dark border">{r.emp_code}</span>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 fw-semibold">
                          {r.emp_name}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">{r.attendance_date}</CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          <CBadge color={STATUS_COLORS[r.status] || 'secondary'}>
                            {STATUS_LABELS[r.status] || r.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          {r.check_in_time || '—'}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          {r.check_out_time || '—'}
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3">
                          <small>{r.remarks || '—'}</small>
                        </CTableDataCell>
                        <CTableDataCell className="py-2 px-3 text-center">
                          <CButton
                            color="warning"
                            size="sm"
                            onClick={() => handleOpenEdit(r)}
                            className="px-2 py-1"
                          >
                            Edit
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {totalPages > 1 && (
                <div className="border-top bg-light px-3 py-2">
                  <CRow className="align-items-center">
                    <CCol md={6}>
                      <small className="text-muted">
                        Showing {startIndex + 1}–{Math.min(startIndex + perPage, totalCount)} of{' '}
                        {totalCount}
                      </small>
                    </CCol>
                    <CCol md={6} className="text-md-end text-center">
                      <div className="btn-group btn-group-sm">
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(1)}
                        >
                          ««
                        </CButton>
                        <CButton
                          color="outline-primary"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Prev
                        </CButton>
                        <CButton color="primary" disabled>
                          {currentPage} / {totalPages}
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

      {/* Mark Attendance Modal */}
      <CModal
        visible={markModalVisible}
        onClose={() => setMarkModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Mark Teacher Attendance</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleMarkSubmit}>
          <CModalBody>
            <CRow className="g-2">
              <CCol md={4}>
                <CFormSelect
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel={
                    <>
                      Teacher<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  id="emp_code"
                  value={markForm.emp_code}
                  onChange={handleMarkFormChange}
                  required
                >
                  <option value="">Choose Teacher</option>
                  {teachers.map((t) => (
                    <option key={t.emp_code} value={t.emp_code}>
                      [{t.emp_code}] {t.emp_name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel={
                    <>
                      Date<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="date"
                  id="attendance_date"
                  value={markForm.attendance_date}
                  onChange={handleMarkFormChange}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel={
                    <>
                      Status<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  id="status"
                  value={markForm.status}
                  onChange={handleMarkFormChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">Leave</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Check In Time"
                  type="time"
                  id="check_in_time"
                  value={markForm.check_in_time}
                  onChange={handleMarkFormChange}
                  onClick={(e) => e.target.showPicker?.()}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Check Out Time"
                  type="time"
                  id="check_out_time"
                  value={markForm.check_out_time}
                  onChange={handleMarkFormChange}
                  onClick={(e) => e.target.showPicker?.()}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Remarks"
                  type="text"
                  id="remarks"
                  value={markForm.remarks}
                  onChange={handleMarkFormChange}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setMarkModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={markSaving}>
              {markSaving ? <CSpinner size="sm" className="me-1" /> : null}
              Mark Attendance
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Edit Attendance Modal */}
      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            Edit Attendance — {editRecord?.emp_name} ({editRecord?.attendance_date})
          </CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleEditSubmit}>
          <CModalBody>
            <CRow className="g-2">
              <CCol md={4}>
                <CFormSelect
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Status"
                  id="status"
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">Leave</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Check In Time"
                  type="time"
                  value={editForm.check_in_time || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, check_in_time: e.target.value }))}
                  onClick={(e) => e.target.showPicker?.()}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Check Out Time"
                  type="time"
                  value={editForm.check_out_time || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, check_out_time: e.target.value }))}
                  onClick={(e) => e.target.showPicker?.()}
                />
              </CCol>
              <CCol xs={12}>
                <CFormInput
                  size="sm"
                  floatingClassName="mb-2"
                  floatingLabel="Remarks"
                  type="text"
                  value={editForm.remarks || ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, remarks: e.target.value }))}
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
              Cancel
            </CButton>
            <CButton color="primary" type="submit" disabled={editSaving}>
              {editSaving ? <CSpinner size="sm" className="me-1" /> : null}
              Update
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CRow>
  )
}

export default TeacherAttendance
