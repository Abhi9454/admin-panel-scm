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
  CAlert,
} from '@coreui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import staffManagementApi from 'src/api/staffManagementApi'

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

const EditStaff = () => {
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
      const data = await staffManagementApi.getProfile(code)
      setProfileData(data)
      setFormData({
        emp_name: data.emp_name || '',
        short_name: data.short_name || '',
        gender: data.gender || '',
        date_of_birth: data.date_of_birth || '',
        emp_status: data.emp_status || '',
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
      console.error('Error loading staff profile:', error)
      setAlert({ type: 'danger', message: 'Failed to load staff profile.' })
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
        emp_name: formData.emp_name || undefined,
        short_name: formData.short_name || undefined,
        gender: formData.gender || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        emp_status: formData.emp_status || undefined,
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
      await staffManagementApi.updateProfile(empCode, payload)
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
                No staff member selected. Please navigate from the staff list.
              </p>
              <CButton
                color="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/staff/directory')}
              >
                Go to Staff List
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
              <span className="text-muted">Loading staff profile...</span>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow className="g-2">
      {alert && (
        <CCol xs={12}>
          <CAlert color={alert.type} dismissible onClose={() => setAlert(null)} className="shadow-sm mb-2 py-2">
            {alert.message}
          </CAlert>
        </CCol>
      )}

      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h5 className="mb-0 fw-bold text-primary">Edit Staff Profile</h5>
                <small className="text-muted">
                  Managing Profile for: <strong>{profileData?.emp_name}</strong> ({empCode})
                  <CBadge color={profileData?.user_type === 'staff' ? 'secondary' : 'primary'} className="ms-2">
                    {profileData?.user_type === 'staff' ? 'Staff' : 'Teacher'}
                  </CBadge>
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={() => navigate('/staff/directory')}
                >
                  ← Back to List
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-2">
                {/* Basic Details */}
                <CCol md={4}>
                  <CFormInput
                    label="Full Name"
                    type="text"
                    id="emp_name"
                    value={formData.emp_name}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Short Name (Initial)"
                    type="text"
                    id="short_name"
                    value={formData.short_name}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    label="Gender"
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                </CCol>

                <CCol md={4}>
                  <CFormInput
                    label="Date of Birth"
                    type="date"
                    id="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    label="Employment Status"
                    id="emp_status"
                    value={formData.emp_status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormSelect
                    label="Blood Group"
                    id="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                {/* Contact details */}
                <CCol md={4}>
                  <CFormInput
                    label="Email Address"
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Phone Number"
                    type="text"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormInput
                    label="Alternate Phone"
                    type="text"
                    id="alternate_phone"
                    value={formData.alternate_phone}
                    onChange={handleChange}
                  />
                </CCol>

                {/* Education */}
                <CCol md={6}>
                  <CFormInput
                    label="Academic Qualifications"
                    type="text"
                    id="academic_edu"
                    value={formData.academic_edu}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Professional Qualifications"
                    type="text"
                    id="professional_edu"
                    value={formData.professional_edu}
                    onChange={handleChange}
                  />
                </CCol>

                {/* Address */}
                <CCol md={6}>
                  <CFormInput
                    label="Full Address"
                    type="text"
                    id="address_full"
                    value={formData.address_full}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    label="City"
                    type="text"
                    id="address_city"
                    value={formData.address_city}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    label="State"
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

            {/* Quick Nav Buttons */}
            <div className="mt-3 d-flex flex-wrap gap-2">
              {profileData?.user_type !== 'staff' && (
                <CButton
                  color="info"
                  size="sm"
                  className="text-white"
                  onClick={() => navigate('/staff/assignments', { state: { empCode } })}
                >
                  📋 Manage Class Assignments
                </CButton>
              )}
              <CButton
                color="secondary"
                size="sm"
                onClick={() => navigate('/staff/attendance', { state: { empCode } })}
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

export default EditStaff
