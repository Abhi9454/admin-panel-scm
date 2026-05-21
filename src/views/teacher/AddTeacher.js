import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import teacherManagementApi from 'src/api/teacherManagementApi'
import masterApi from 'src/api/masterApi'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const INITIAL_FORM_STATE = {
  // Card 1: Basic Info
  emp_name: '',
  email: '',
  phone: '',
  gender: 'Male',
  dob: '',
  caste: '',
  religion: '',
  locality_id: '',
  blood_group: '',
  photo: null,
  photoPreview: null,

  // Tab 1: Parents Information
  father_name: '',
  mother_name: '',
  father_contact: '',
  mother_contact: '',
  father_annual_income: '',
  mother_annual_income: '',
  mother_email: '',
  father_qualification: '',
  mother_qualification: '',
  father_profession: '',
  mother_profession: '',
  father_department: '',
  mother_department: '',
  father_designation: '',
  mother_designation: '',
  father_org_name: '',
  mother_org_name: '',
  father_office_address: '',
  mother_office_address: '',
  father_photo: null,
  mother_photo: null,

  // Tab 2: Contact & Certificates
  address_full: '',
  pin_code: '',
  nationality: 'Indian',
  city: '',
  state: '',
  alternate_phone: '',
  cv_resume: null,
  exp_cert: null,
  dob_cert: null,
  med_cert: null,
  sports_cert: null,
  father_proof: null,
  mother_proof: null,
  address_proof: null,

  // Tab 3: Other details
  bus_route: '',
  bus_stop: '',
  personal_id_mark: '',

  // Tab 4: Medical details
  height: '',
  weight: '',
  vision_l: '',
  vision_r: '',
  teeth: '',
  oral_hygiene: '',
  medical_history: '',
  doctor_name: '',
  clinic_address: '',
  clinic_phone: '',
  clinic_mobile: '',
}

const AddTeacher = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('parents')
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [formErrors, setFormErrors] = useState({})
  const [createdEmpCode, setCreatedEmpCode] = useState(null)
  
  // Dynamic Master dropdown data
  const [localities, setLocalities] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [educations, setEducations] = useState([])
  const [professions, setProfessions] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null) // { type, message }

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const fetchDropdowns = async () => {
    setLoading(true)
    try {
      const [
        localityData,
        cityData,
        stateData,
        educationData,
        professionData,
        departmentData,
        designationData,
      ] = await Promise.all([
        masterApi.getAll('localities').catch(() => ({ results: [] })),
        masterApi.getAll('cities').catch(() => ({ results: [] })),
        masterApi.getAll('states').catch(() => ({ results: [] })),
        masterApi.getAll('parent-educations').catch(() => ({ results: [] })),
        masterApi.getAll('parent-professions').catch(() => ({ results: [] })),
        masterApi.getAll('parent-departments').catch(() => ({ results: [] })),
        masterApi.getAll('parent-designations').catch(() => ({ results: [] })),
      ])
      setLocalities(localityData.results || [])
      setCities(cityData.results || [])
      setStates(stateData.results || [])
      setEducations(educationData.results || [])
      setProfessions(professionData.results || [])
      setDepartments(departmentData.results || [])
      setDesignations(designationData.results || [])
    } catch (error) {
      console.error('Error fetching dropdowns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    // Clear validation error when field is typed in
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleFileChange = (e) => {
    const { id, files } = e.target
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [id]: files[0],
      }))
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () =>
        setFormData((prev) => ({
          ...prev,
          photoPreview: reader.result,
          photo: file,
        }))
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitMain = async (e) => {
    e.preventDefault()
    setAlertInfo(null)

    // Validation check for mandatory fields
    const requiredFields = ['emp_name', 'email', 'phone', 'gender']
    const newErrors = {}
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      setAlertInfo({
        type: 'danger',
        message: '⚠️ Missing mandatory fields! Please fill out Name, Email, Phone Number, and Gender.',
      })
      alert('Please fill all mandatory fields: Name, Email, Phone, and Gender.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        emp_name: formData.emp_name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        date_of_birth: formData.dob || undefined,
        caste: formData.caste || undefined,
        religion: formData.religion || undefined,
        locality_id: formData.locality_id ? Number(formData.locality_id) : undefined,
        blood_group: formData.blood_group || undefined,
        emp_status: 'Active',
      }

      let response
      if (formData.photo) {
        const multipartPayload = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined) multipartPayload.append(k, v)
        })
        multipartPayload.append('photo', formData.photo)
        response = await teacherManagementApi.create(multipartPayload)
      } else {
        response = await teacherManagementApi.create(payload)
      }

      if (response && response.emp_code) {
        setCreatedEmpCode(response.emp_code)
        setAlertInfo({
          type: 'success',
          message: `🎉 Teacher added successfully! Employee Code: ${response.emp_code}. You can now fill in the additional information below.`,
        })
      } else {
        setAlertInfo({
          type: 'success',
          message: '🎉 Teacher added successfully!',
        })
      }
    } catch (error) {
      console.error('Error adding teacher:', error)
      const errData = error?.response?.data
      let detailMsg = 'Failed to add teacher.'
      if (errData) {
        detailMsg = Object.entries(errData)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n')
      }
      setAlertInfo({
        type: 'danger',
        message: `❌ Error adding teacher:\n${detailMsg}`,
      })
      alert(`Error adding teacher:\n${detailMsg}`)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateAdditional = async (e) => {
    e.preventDefault()
    setAlertInfo(null)

    if (!createdEmpCode) {
      setAlertInfo({
        type: 'warning',
        message: '⚠️ Please add the main Teacher details above first before saving additional information.',
      })
      alert('Please add the main Teacher details above first before saving additional information.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        // Parents info
        father_name: formData.father_name || undefined,
        mother_name: formData.mother_name || undefined,
        father_contact: formData.father_contact || undefined,
        mother_contact: formData.mother_contact || undefined,
        father_annual_income: formData.father_annual_income || undefined,
        mother_annual_income: formData.mother_annual_income || undefined,
        mother_email: formData.mother_email || undefined,
        father_qualification: formData.father_qualification || undefined,
        mother_qualification: formData.mother_qualification || undefined,
        father_profession: formData.father_profession || undefined,
        mother_profession: formData.mother_profession || undefined,
        father_department: formData.father_department || undefined,
        mother_department: formData.mother_department || undefined,
        father_designation: formData.father_designation || undefined,
        mother_designation: formData.mother_designation || undefined,
        father_org_name: formData.father_org_name || undefined,
        mother_org_name: formData.mother_org_name || undefined,
        father_office_address: formData.father_office_address || undefined,
        mother_office_address: formData.mother_office_address || undefined,

        // Contact details
        address: {
          full: formData.address_full || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
        },
        pin_code: formData.pin_code || undefined,
        nationality: formData.nationality || undefined,
        alternate_phone: formData.alternate_phone || undefined,

        // Other details
        bus_route: formData.bus_route || undefined,
        bus_stop: formData.bus_stop || undefined,
        personal_id_mark: formData.personal_id_mark || undefined,

        // Medical details
        height: formData.height || undefined,
        weight: formData.weight || undefined,
        vision_l: formData.vision_l || undefined,
        vision_r: formData.vision_r || undefined,
        teeth: formData.teeth || undefined,
        oral_hygiene: formData.oral_hygiene || undefined,
        medical_history: formData.medical_history || undefined,
        doctor_name: formData.doctor_name || undefined,
        clinic_address: formData.clinic_address || undefined,
        clinic_phone: formData.clinic_phone || undefined,
        clinic_mobile: formData.clinic_mobile || undefined,
      }

      await teacherManagementApi.updateProfile(createdEmpCode, payload)
      setAlertInfo({
        type: 'success',
        message: '🎉 Additional details saved successfully for teacher ' + createdEmpCode + '!',
      })
      alert('Additional details saved successfully!')
    } catch (error) {
      console.error('Error saving additional details:', error)
      setAlertInfo({
        type: 'danger',
        message: '❌ Failed to save additional details. Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE)
    setFormErrors({})
    setCreatedEmpCode(null)
    setAlertInfo(null)
  }

  return (
    <CRow className="g-3">
      {/* Alert Header */}
      {alertInfo && (
        <CCol xs={12}>
          <CAlert color={alertInfo.type} dismissible onClose={() => setAlertInfo(null)} className="shadow-sm">
            {alertInfo.message}
          </CAlert>
        </CCol>
      )}

      {/* Card 1: Add Teacher Details */}
      <CCol xs={12}>
        <CCard className="shadow-sm mb-4">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={6}>
                <h5 className="mb-0 fw-bold text-primary">Add Teacher</h5>
                <small className="text-muted">Enter basic details to register a new teacher</small>
              </CCol>
              <CCol md={6} className="text-md-end text-start mt-2 mt-md-0">
                <CButton size="sm" color="outline-secondary" onClick={resetForm} className="me-2">
                  Reset Form
                </CButton>
                <CButton size="sm" color="outline-primary" onClick={() => navigate('/teacher/all-teachers')}>
                  ← Back to List
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-4">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading form metadata...</span>
              </div>
            ) : (
              <CForm className="row g-3" onSubmit={handleSubmitMain}>
                {/* Row 1: Name and Thumbnail */}
                <CCol md={10}>
                  <CFormLabel htmlFor="emp_name" className="fw-semibold">
                    Name <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="emp_name"
                    placeholder="Enter teacher's full name"
                    value={formData.emp_name}
                    onChange={handleChange}
                    invalid={!!formErrors.emp_name}
                  />
                </CCol>
                <CCol md={2} className="d-flex align-items-center justify-content-center">
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      border: '2px dashed #ccc',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {formData.photoPreview ? (
                      <img
                        src={formData.photoPreview}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span className="text-muted" style={{ fontSize: '20px' }}>📷</span>
                    )}
                  </div>
                </CCol>

                {/* Row 2: Email, Phone, Gender */}
                <CCol md={5}>
                  <CFormLabel htmlFor="email" className="fw-semibold">
                    Email <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="email"
                    id="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    invalid={!!formErrors.email}
                  />
                </CCol>
                <CCol md={5}>
                  <CFormLabel htmlFor="phone" className="fw-semibold">
                    Phone Number <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="phone"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    invalid={!!formErrors.phone}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel htmlFor="gender" className="fw-semibold">
                    Gender <span style={{ color: 'red' }}>*</span>
                  </CFormLabel>
                  <CFormSelect
                    id="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    invalid={!!formErrors.gender}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                </CCol>

                {/* Row 3: DOB, Blood Group, Caste, Religion, Locality (All Optional) */}
                <CCol md={4}>
                  <CFormLabel htmlFor="dob">Date of Birth</CFormLabel>
                  <CFormInput
                    type="date"
                    id="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="blood_group">Blood Group</CFormLabel>
                  <CFormSelect
                    id="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    <option value="">Choose...</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="locality_id">Locality</CFormLabel>
                  <CFormSelect
                    id="locality_id"
                    value={formData.locality_id}
                    onChange={handleChange}
                  >
                    <option value="">Choose...</option>
                    {localities.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.title}</option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="caste">Caste</CFormLabel>
                  <CFormInput
                    type="text"
                    id="caste"
                    placeholder="Enter caste"
                    value={formData.caste}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="religion">Religion</CFormLabel>
                  <CFormInput
                    type="text"
                    id="religion"
                    placeholder="Enter religion"
                    value={formData.religion}
                    onChange={handleChange}
                  />
                </CCol>

                {/* Photo Upload File Selector */}
                <CCol md={12} className="mb-3">
                  <CFormLabel htmlFor="photo-upload-input" className="fw-semibold">Teacher Photo</CFormLabel>
                  <CFormInput
                    type="file"
                    id="photo-upload-input"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </CCol>

                <CCol xs={12} className="pt-2 border-top d-flex align-items-center">
                  <CButton color="primary" type="submit" disabled={saving}>
                    {saving && !createdEmpCode ? <CSpinner size="sm" className="me-2" /> : null}
                    Add Teacher
                  </CButton>
                  <div className="ms-auto text-muted small">
                    <span style={{ color: 'red' }}>*</span> Mandatory fields
                  </div>
                </CCol>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Card 2: Additional Information */}
      <CCol xs={12}>
        <CCard className="shadow-sm mb-4">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={6}>
                <strong className="text-primary">Additional Information</strong>
              </CCol>
              <CCol md={6} className="text-md-end text-start mt-2 mt-md-0">
                {createdEmpCode ? (
                  <CBadge color="success" className="px-2 py-1">
                    Editing Employee Code: {createdEmpCode}
                  </CBadge>
                ) : (
                  <CBadge color="warning" className="px-2 py-1 text-dark">
                    🔒 Locked: Add teacher above first
                  </CBadge>
                )}
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody className={createdEmpCode ? 'p-3' : 'p-3 bg-light text-center py-5 text-muted'}>
            {!createdEmpCode ? (
              <div>
                <h5>🔒 Additional Info Form Locked</h5>
                <p className="mb-0 small text-secondary">
                  Please fill out the Name, Email, Phone, and Gender above and click <strong>Add Teacher</strong> to generate an Employee Code first.
                </p>
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <CNav variant="tabs" role="tablist">
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'parents'}
                      onClick={() => setActiveTab('parents')}
                      style={{ cursor: 'pointer' }}
                    >
                      Parents Information
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'contact'}
                      onClick={() => setActiveTab('contact')}
                      style={{ cursor: 'pointer' }}
                    >
                      Contact and Certificate
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'other'}
                      onClick={() => setActiveTab('other')}
                      style={{ cursor: 'pointer' }}
                    >
                      Other Details
                    </CNavLink>
                  </CNavItem>
                  <CNavItem>
                    <CNavLink
                      active={activeTab === 'medical'}
                      onClick={() => setActiveTab('medical')}
                      style={{ cursor: 'pointer' }}
                    >
                      Medical
                    </CNavLink>
                  </CNavItem>
                </CNav>

                {/* Tab Content */}
                <CTabContent className="mt-3">
                  {/* Parents Tab */}
                  <CTabPane visible={activeTab === 'parents'}>
                    <CForm className="row g-3" onSubmit={handleUpdateAdditional}>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_name">Father's Name</CFormLabel>
                        <CFormInput
                          type="text"
                          id="father_name"
                          placeholder="Enter Father's Name"
                          value={formData.father_name}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_name">Mother's Name</CFormLabel>
                        <CFormInput
                          type="text"
                          id="mother_name"
                          placeholder="Enter Mother's Name"
                          value={formData.mother_name}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_contact">Father's Contact</CFormLabel>
                        <CFormInput
                          type="text"
                          id="father_contact"
                          placeholder="Enter Father's Contact"
                          value={formData.father_contact}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_contact">Mother's Contact</CFormLabel>
                        <CFormInput
                          type="text"
                          id="mother_contact"
                          placeholder="Enter Mother's Contact"
                          value={formData.mother_contact}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_annual_income">Father's Annual Income</CFormLabel>
                        <CFormInput
                          type="text"
                          id="father_annual_income"
                          placeholder="Enter Father's Annual Income"
                          value={formData.father_annual_income}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_annual_income">Mother's Annual Income</CFormLabel>
                        <CFormInput
                          type="text"
                          id="mother_annual_income"
                          placeholder="Enter Mother's Annual Income"
                          value={formData.mother_annual_income}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_email">Mother's Email Id</CFormLabel>
                        <CFormInput
                          type="email"
                          id="mother_email"
                          placeholder="Enter Mother's Email Id"
                          value={formData.mother_email}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_qualification">Father's Qualification</CFormLabel>
                        <CFormSelect
                          id="father_qualification"
                          value={formData.father_qualification}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {educations.map((edu) => (
                            <option key={edu.id} value={edu.title}>{edu.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_qualification">Mother's Qualification</CFormLabel>
                        <CFormSelect
                          id="mother_qualification"
                          value={formData.mother_qualification}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {educations.map((edu) => (
                            <option key={edu.id} value={edu.title}>{edu.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_profession">Father's Profession</CFormLabel>
                        <CFormSelect
                          id="father_profession"
                          value={formData.father_profession}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {professions.map((prof) => (
                            <option key={prof.id} value={prof.title}>{prof.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_profession">Mother's Profession</CFormLabel>
                        <CFormSelect
                          id="mother_profession"
                          value={formData.mother_profession}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {professions.map((prof) => (
                            <option key={prof.id} value={prof.title}>{prof.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_department">Father's Department</CFormLabel>
                        <CFormSelect
                          id="father_department"
                          value={formData.father_department}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.title}>{dept.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_department">Mother's Department</CFormLabel>
                        <CFormSelect
                          id="mother_department"
                          value={formData.mother_department}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.title}>{dept.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_designation">Father's Designation</CFormLabel>
                        <CFormSelect
                          id="father_designation"
                          value={formData.father_designation}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {designations.map((desig) => (
                            <option key={desig.id} value={desig.title}>{desig.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_designation">Mother's Designation</CFormLabel>
                        <CFormSelect
                          id="mother_designation"
                          value={formData.mother_designation}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {designations.map((desig) => (
                            <option key={desig.id} value={desig.title}>{desig.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_org_name">Father's Org Name</CFormLabel>
                        <CFormInput
                          type="text"
                          id="father_org_name"
                          placeholder="Enter Father's Org Name"
                          value={formData.father_org_name}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_org_name">Mother's Org Name</CFormLabel>
                        <CFormInput
                          type="text"
                          id="mother_org_name"
                          placeholder="Enter Mother's Org Name"
                          value={formData.mother_org_name}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_office_address">Father's Office Address</CFormLabel>
                        <CFormInput
                          type="text"
                          id="father_office_address"
                          placeholder="Enter Father's Office Address"
                          value={formData.father_office_address}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_office_address">Mother's Office Address</CFormLabel>
                        <CFormInput
                          type="text"
                          id="mother_office_address"
                          placeholder="Enter Mother's Office Address"
                          value={formData.mother_office_address}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6} className="mb-2">
                        <CFormLabel htmlFor="father_photo">Father's Photo</CFormLabel>
                        <CFormInput type="file" id="father_photo" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6} className="mb-2">
                        <CFormLabel htmlFor="mother_photo">Mother's Photo</CFormLabel>
                        <CFormInput type="file" id="mother_photo" onChange={handleFileChange} />
                      </CCol>
                      <CCol xs={12}>
                        <CButton color="primary" type="submit" disabled={saving}>
                          {saving ? <CSpinner size="sm" className="me-2" /> : null}
                          Save
                        </CButton>
                      </CCol>
                    </CForm>
                  </CTabPane>

                  {/* Contact and Certificate Tab */}
                  <CTabPane visible={activeTab === 'contact'}>
                    <CForm className="row g-3" onSubmit={handleUpdateAdditional}>
                      <CCol xs={8}>
                        <CFormLabel htmlFor="address_full">Address</CFormLabel>
                        <CFormInput
                          id="address_full"
                          placeholder="Enter Address"
                          value={formData.address_full}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel htmlFor="pin_code">Pin code</CFormLabel>
                        <CFormInput
                          id="pin_code"
                          placeholder="Enter Pin code"
                          value={formData.pin_code}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="nationality">Nationality</CFormLabel>
                        <CFormSelect
                          id="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                        >
                          <option value="Indian">Indian</option>
                          <option value="Nepalese">Nepalese</option>
                          <option value="Bhutanese">Bhutanese</option>
                          <option value="Other">Other</option>
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="city">City</CFormLabel>
                        <CFormSelect
                          id="city"
                          value={formData.city}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {cities.map((c) => (
                            <option key={c.id} value={c.title}>{c.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="state">State</CFormLabel>
                        <CFormSelect
                          id="state"
                          value={formData.state}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          {states.map((s) => (
                            <option key={s.id} value={s.title}>{s.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="alternate_phone">Alternate Phone Number</CFormLabel>
                        <CFormInput
                          type="text"
                          id="alternate_phone"
                          placeholder="Enter alternate contact number"
                          value={formData.alternate_phone}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="cv_resume">CV/Resume Form</CFormLabel>
                        <CFormInput type="file" id="cv_resume" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="exp_cert">Experience Certificate</CFormLabel>
                        <CFormInput type="file" id="exp_cert" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="dob_cert">DOB Certificate</CFormLabel>
                        <CFormInput type="file" id="dob_cert" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="med_cert">Medical Certificate</CFormLabel>
                        <CFormInput type="file" id="med_cert" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="sports_cert">Sports Certificate</CFormLabel>
                        <CFormInput type="file" id="sports_cert" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="father_proof">Father Proof Id</CFormLabel>
                        <CFormInput type="file" id="father_proof" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="mother_proof">Mother Proof Id</CFormLabel>
                        <CFormInput type="file" id="mother_proof" onChange={handleFileChange} />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="address_proof">Address Proof</CFormLabel>
                        <CFormInput type="file" id="address_proof" onChange={handleFileChange} />
                      </CCol>
                      <CCol xs={12} className="mt-3">
                        <CButton color="primary" type="submit" disabled={saving}>
                          {saving ? <CSpinner size="sm" className="me-2" /> : null}
                          Save
                        </CButton>
                      </CCol>
                    </CForm>
                  </CTabPane>

                  {/* Other Tab */}
                  <CTabPane visible={activeTab === 'other'}>
                    <CForm className="row g-3" onSubmit={handleUpdateAdditional}>
                      <CCol md={6}>
                        <CFormLabel htmlFor="bus_route">Bus Route</CFormLabel>
                        <CFormInput
                          type="text"
                          id="bus_route"
                          placeholder="Enter Bus Route"
                          value={formData.bus_route}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="bus_stop">Bus Stop</CFormLabel>
                        <CFormInput
                          type="text"
                          id="bus_stop"
                          placeholder="Enter Bus Stop"
                          value={formData.bus_stop}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="personal_id_mark">Personal ID Mark</CFormLabel>
                        <CFormInput
                          type="text"
                          id="personal_id_mark"
                          placeholder="Enter Personal ID Mark"
                          value={formData.personal_id_mark}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol xs={12} className="mt-3">
                        <CButton color="primary" type="submit" disabled={saving}>
                          {saving ? <CSpinner size="sm" className="me-2" /> : null}
                          Save
                        </CButton>
                      </CCol>
                    </CForm>
                  </CTabPane>

                  {/* Medical Tab */}
                  <CTabPane visible={activeTab === 'medical'}>
                    <CForm className="row g-3" onSubmit={handleUpdateAdditional}>
                      <CCol md={2}>
                        <CFormLabel htmlFor="height">Height(CM)</CFormLabel>
                        <CFormInput
                          type="text"
                          id="height"
                          placeholder="Height"
                          value={formData.height}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormLabel htmlFor="weight">Weight(KG)</CFormLabel>
                        <CFormInput
                          type="text"
                          id="weight"
                          placeholder="Weight"
                          value={formData.weight}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormLabel htmlFor="vision_l">Vision(L)</CFormLabel>
                        <CFormInput
                          type="text"
                          id="vision_l"
                          placeholder="Vision(L)"
                          value={formData.vision_l}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormLabel htmlFor="vision_r">Vision(R)</CFormLabel>
                        <CFormInput
                          type="text"
                          id="vision_r"
                          placeholder="Vision(R)"
                          value={formData.vision_r}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormLabel htmlFor="teeth">Teeth</CFormLabel>
                        <CFormInput
                          type="text"
                          id="teeth"
                          placeholder="Teeth"
                          value={formData.teeth}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={2}>
                        <CFormLabel htmlFor="oral_hygiene">Oral Hygiene</CFormLabel>
                        <CFormInput
                          type="text"
                          id="oral_hygiene"
                          placeholder="Oral Hygiene"
                          value={formData.oral_hygiene}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="medical_history">Medical History</CFormLabel>
                        <CFormInput
                          type="text"
                          id="medical_history"
                          placeholder="Enter Medical History"
                          value={formData.medical_history}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="doctor_name">Doctor Name</CFormLabel>
                        <CFormInput
                          type="text"
                          id="doctor_name"
                          placeholder="Enter Doctor name"
                          value={formData.doctor_name}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="clinic_address">Clinic Address</CFormLabel>
                        <CFormInput
                          type="text"
                          id="clinic_address"
                          placeholder="Enter Clinic Address"
                          value={formData.clinic_address}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="clinic_phone">Clinic Phone Number</CFormLabel>
                        <CFormInput
                          type="text"
                          id="clinic_phone"
                          placeholder="Enter Clinic Phone Number"
                          value={formData.clinic_phone}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel htmlFor="clinic_mobile">Clinic Mobile Number</CFormLabel>
                        <CFormInput
                          type="text"
                          id="clinic_mobile"
                          placeholder="Enter Clinic Mobile Number"
                          value={formData.clinic_mobile}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol xs={12} className="mt-3">
                        <CButton color="primary" type="submit" disabled={saving}>
                          {saving ? <CSpinner size="sm" className="me-2" /> : null}
                          Save
                        </CButton>
                      </CCol>
                    </CForm>
                  </CTabPane>
                </CTabContent>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddTeacher
