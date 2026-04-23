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
  CRow,
  CSpinner,
  CBadge,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CAlert,
} from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import teacherManagementApi from 'src/api/teacherManagementApi'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const EMPTY_FORM = {
  email: '',
  phone: '',
  alternate_phone: '',
  blood_group: '',
  academic_edu: '',
  professional_edu: '',
  address_full: '',
  address_city: '',
  address_state: '',
}

const EditTeacher = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const empCode = location.state?.empCode || null

  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null) // { type, message }

  useEffect(() => {
    if (empCode) loadProfile(empCode)
  }, [empCode])

  const loadProfile = async (code) => {
    setLoading(true)
    try {
      const data = await teacherManagementApi.getProfile(code)
      setProfileData(data)
      setFormData({
        email: data.email || '',
        phone: data.phone || '',
        alternate_phone: data.alternate_phone || '',
        blood_group: data.blood_group || '',
        academic_edu: data.academic_edu || '',
        professional_edu: data.professional_edu || '',
        address_full: data.address?.full || '',
        address_city: data.address?.city || '',
        address_state: data.address?.state || '',
      })
    } catch (error) {
      console.error('Error loading teacher profile:', error)
      setAlert({ type: 'danger', message: 'Failed to load teacher profile.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setAlert(null)
    try {
      const payload = {
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        alternate_phone: formData.alternate_phone || undefined,
        blood_group: formData.blood_group || undefined,
        academic_edu: formData.academic_edu || undefined,
        professional_edu: formData.professional_edu || undefined,
        address: {
          full: formData.address_full || undefined,
          city: formData.address_city || undefined,
          state: formData.address_state || undefined,
        },
      }
      await teacherManagementApi.updateProfile(empCode, payload)
      setAlert({ type: 'success', message: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setAlert({ type: 'danger', message: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!empCode) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardBody className="text-center py-4">
              <p className="text-danger mb-0">
                No teacher selected. Please navigate from the teacher list.
              </p>
              <CButton
                color="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/teacher/all-teachers')}
              >
                Go to Teacher List
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardBody className="text-center py-4">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading teacher profile...</span>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h5 className="mb-0 fw-bold text-primary">Edit Teacher Profile</h5>
                <small className="text-muted">
                  Emp Code: {empCode} | {profileData?.emp_name}
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={() => navigate('/teacher/all-teachers')}
                >
                  ← Back to List
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {alert && (
              <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </CAlert>
            )}

            <CAccordion alwaysOpen>
              {/* ── Read-Only Info ──────────────────────────────────────── */}
              <CAccordionItem itemKey="readonly">
                <CAccordionHeader>👤 Personal Information (Read-only)</CAccordionHeader>
                <CAccordionBody>
                  <CRow className="g-2">
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Full Name</small>
                        <span className="fw-semibold">{profileData?.emp_name || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Short Name</small>
                        <span>{profileData?.short_name || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Gender</small>
                        <span>{profileData?.gender || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Date of Birth</small>
                        <span>{profileData?.date_of_birth || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Date of Joining</small>
                        <span>{profileData?.date_of_joining || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Teacher ID</small>
                        <span>{profileData?.teacher_id || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Designation</small>
                        <span>{profileData?.designation?.title || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Department</small>
                        <span>{profileData?.department?.title || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Status</small>
                        <CBadge
                          color={
                            profileData?.emp_status === 'Active'
                              ? 'success'
                              : profileData?.emp_status === 'Inactive'
                                ? 'secondary'
                                : 'warning'
                          }
                        >
                          {profileData?.emp_status || '—'}
                        </CBadge>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Incharge Class</small>
                        <span>{profileData?.incharge_class?.name || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Father Name</small>
                        <span>{profileData?.father_name || '—'}</span>
                      </div>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <div className="mb-2">
                        <small className="text-muted d-block">Mother Name</small>
                        <span>{profileData?.mother_name || '—'}</span>
                      </div>
                    </CCol>
                    {profileData?.subjects?.length > 0 && (
                      <CCol xs={12}>
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">Assigned Subjects</small>
                          <div className="d-flex flex-wrap gap-1">
                            {profileData.subjects.map((s) => (
                              <CBadge key={s.id} color="info">
                                {s.name}
                              </CBadge>
                            ))}
                          </div>
                        </div>
                      </CCol>
                    )}
                    {profileData?.classes?.length > 0 && (
                      <CCol xs={12}>
                        <div className="mb-2">
                          <small className="text-muted d-block mb-1">Assigned Classes</small>
                          <div className="d-flex flex-wrap gap-1">
                            {profileData.classes.map((c) => (
                              <CBadge key={c.id} color="primary">
                                {c.name}
                              </CBadge>
                            ))}
                          </div>
                        </div>
                      </CCol>
                    )}
                  </CRow>
                </CAccordionBody>
              </CAccordionItem>

              {/* ── Editable Contact & Education ────────────────────────── */}
              <CAccordionItem itemKey="editable">
                <CAccordionHeader>✏️ Contact & Education (Editable)</CAccordionHeader>
                <CAccordionBody>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Email"
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Phone"
                          type="text"
                          id="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Alternate Phone"
                          type="text"
                          id="alternate_phone"
                          value={formData.alternate_phone}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Blood Group"
                          id="blood_group"
                          value={formData.blood_group}
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Academic Education"
                          type="text"
                          id="academic_edu"
                          value={formData.academic_edu}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Professional Education"
                          type="text"
                          id="professional_edu"
                          value={formData.professional_edu}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Full Address"
                          type="text"
                          id="address_full"
                          value={formData.address_full}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="City"
                          type="text"
                          id="address_city"
                          value={formData.address_city}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="State"
                          type="text"
                          id="address_state"
                          value={formData.address_state}
                          onChange={handleChange}
                        />
                      </CCol>
                    </CRow>

                    <div className="border-top pt-3 mt-1">
                      <CButton
                        color="primary"
                        type="submit"
                        disabled={saving}
                        className="px-4"
                      >
                        {saving ? <CSpinner size="sm" className="me-2" /> : null}
                        Save Changes
                      </CButton>
                    </div>
                  </CForm>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>

            {/* Quick Nav Buttons */}
            <div className="mt-3 d-flex flex-wrap gap-2">
              <CButton
                color="info"
                size="sm"
                className="text-white"
                onClick={() => navigate('/teacher/teacher-assignments', { state: { empCode } })}
              >
                📋 Manage Class Assignments
              </CButton>
              <CButton
                color="secondary"
                size="sm"
                onClick={() => navigate('/teacher/teacher-attendance', { state: { empCode } })}
              >
                📅 View Attendance
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditTeacher
