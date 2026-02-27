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
  CFormSelect,
  CRow,
  CSpinner,
  CBadge,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import studentManagementApi from 'src/api/studentManagementApi'
import masterApi from '../../api/masterApi'

const EMPTY_FORM = {
  // Core
  adm_no: '',
  name: '',
  student_type: '',
  gender: '',
  dob: '',
  blood_group: '',
  religion: '',
  caste: '',
  aadhaar_no: '',
  enquiry: false,
  photo: null,
  photo_preview: null,
  // Academic placement
  class_id: '',
  section_id: '',
  group_id: '',
  hostel_id: '',
  locality_id: '',
  city_id: '',
  state_id: '',
  // Parents basic
  father_name: '',
  mother_name: '',
  // Parent contact
  father_cell_no: '',
  mother_cell_no: '',
  father_email: '',
  mother_email: '',
  father_annual_income: '',
  mother_annual_income: '',
  father_qualification: '',
  mother_qualification: '',
  // Parent professional
  father_profession_id: '',
  mother_profession_id: '',
  father_department_id: '',
  mother_department_id: '',
  father_designation_id: '',
  mother_designation_id: '',
  father_org_name: '',
  mother_org_name: '',
  father_office_address: '',
  mother_office_address: '',
  // Parent photos
  father_photo: null,
  father_photo_preview: null,
  mother_photo: null,
  mother_photo_preview: null,
  // Address
  address: '',
  pin_code: '',
  nationality: 'Indian',
  phone_no: '',
  bus_route: '',
  bus_stop: '',
  // Academic history
  personal_id_mark: '',
  previous_school: '',
  class_admitted: '',
  board_adm_no_ix_x: '',
  board_adm_no_xi_xii: '',
  board_roll_ix_x: '',
  board_roll_xi_xii: '',
  remarks: '',
  // Medical
  height: '',
  weight: '',
  vision_left: '',
  vision_right: '',
  teeth: '',
  oral_hygiene: '',
  medical_history: '',
  doctor_name: '',
  clinic_mobile: '',
  clinic_phone: '',
  clinic_address: '',
}

const EditStudent = () => {
  const location = useLocation()
  const adm_no = location.state?.adm_no || location.state?.admNo || null

  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [hostels, setHostels] = useState([])
  const [groups, setGroups] = useState([])
  const [localities, setLocalities] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [professions, setProfessions] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => {
    if (adm_no) {
      loadAll(adm_no)
    }
  }, [adm_no])

  const loadAll = async (admNo) => {
    setLoading(true)
    try {
      const [
        studentData,
        classData, sectionData, hostelData, groupData,
        cityData, stateData, localityData,
        profData, deptData, desigData,
      ] = await Promise.all([
        studentManagementApi.getByAdmNo(admNo),
        masterApi.getAll('classes'),
        masterApi.getAll('sections'),
        masterApi.getAll('hostels'),
        masterApi.getAll('groups'),
        masterApi.getAll('cities'),
        masterApi.getAll('states'),
        masterApi.getAll('localities'),
        masterApi.getAll('parent-professions'),
        masterApi.getAll('parent-departments'),
        masterApi.getAll('parent-designations'),
      ])

      setClasses(classData.results || [])
      setSections(sectionData.results || [])
      setHostels(hostelData.results || [])
      setGroups(groupData.results || [])
      setCities(cityData.results || [])
      setStates(stateData.results || [])
      setLocalities(localityData.results || [])
      setProfessions(profData.results || [])
      setDepartments(deptData.results || [])
      setDesignations(desigData.results || [])

      // Map the API response directly — all IDs come back as-is
      setFormData((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(studentData).map(([k, v]) => [k, v ?? '']),
        ),
        // photo fields stay null (we only replace if user picks a new file)
        photo: null,
        photo_preview: studentData.photo || null,
        father_photo: null,
        father_photo_preview: studentData.father_photo || null,
        mother_photo: null,
        mother_photo_preview: studentData.mother_photo || null,
      }))
    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    const numericFields = [
      'class_id', 'section_id', 'group_id', 'hostel_id',
      'locality_id', 'city_id', 'state_id',
      'father_profession_id', 'mother_profession_id',
      'father_department_id', 'mother_department_id',
      'father_designation_id', 'mother_designation_id',
    ]
    setFormData((prev) => ({
      ...prev,
      [id]: numericFields.includes(id) ? (Number(value) || '') : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const requiredFields = ['name', 'student_type', 'class_id', 'section_id', 'gender', 'group_id', 'city_id', 'state_id']
    const newErrors = {}
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field] === '') newErrors[field] = true
    })
    setFormErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      alert('Please fill all required fields.')
      return
    }

    setSaving(true)
    try {
      const {
        photo, photo_preview,
        father_photo, father_photo_preview,
        mother_photo, mother_photo_preview,
        adm_no: _adm,
        id: _id,
        school_code: _sc,
        created_at: _ca,
        std_status: _ss,
        // strip title-only read fields returned by GET
        class_title: _ct, section_title: _st, group_title: _gt,
        hostel_title: _ht, locality_title: _lt, city_title: _city,
        state_title: _state,
        father_profession_title: _fpt, mother_profession_title: _mpt,
        father_department_title: _fdt, mother_department_title: _mdt,
        father_designation_title: _fdesigt, mother_designation_title: _mdesigt,
        session_id: _si, session: _sess,
        ...rest
      } = formData

      const hasNewFiles = photo || father_photo || mother_photo
      let payload

      if (hasNewFiles) {
        payload = new FormData()
        Object.entries(rest).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') payload.append(k, v)
        })
        if (photo) payload.append('photo', photo)
        if (father_photo) payload.append('father_photo', father_photo)
        if (mother_photo) payload.append('mother_photo', mother_photo)
      } else {
        payload = Object.fromEntries(
          Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== ''),
        )
      }

      await studentManagementApi.patch(adm_no, payload)
      alert('Student updated successfully!')
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Failed to save changes!')
    } finally {
      setSaving(false)
    }
  }

  if (!adm_no) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardBody className="text-center py-4">
              <p className="text-danger mb-0">No student selected. Please navigate from the student list.</p>
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
              <span className="text-muted">Loading student data...</span>
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
                <h5 className="mb-0 fw-bold text-primary">Edit Student</h5>
                <small className="text-muted">Adm No: {adm_no} | {formData.name}</small>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color={Object.keys(formErrors).length === 0 ? 'info' : 'danger'}>
                  {Object.keys(formErrors).length === 0 ? 'Form Valid' : `${Object.keys(formErrors).length} Errors`}
                </CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            <CForm onSubmit={handleSubmit}>
              <CAccordion alwaysOpen>

                {/* ── Core Information ─────────────────────────────────── */}
                <CAccordionItem itemKey="core">
                  <CAccordionHeader>📋 Core Information</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-2">
                      {/* Student Type */}
                      <CCol xs={12} className="mb-2">
                        <div className="d-flex gap-3 align-items-center">
                          <span className="fw-semibold">Student Type:</span>
                          <CFormCheck
                            type="radio"
                            id="st_new"
                            label="New Student"
                            checked={formData.student_type === 'new'}
                            onChange={() => setFormData((p) => ({ ...p, student_type: 'new' }))}
                            invalid={!!formErrors.student_type}
                          />
                          <CFormCheck
                            type="radio"
                            id="st_old"
                            label="Old Student"
                            checked={formData.student_type === 'old'}
                            onChange={() => setFormData((p) => ({ ...p, student_type: 'old' }))}
                            invalid={!!formErrors.student_type}
                          />
                        </div>
                      </CCol>

                      {/* Photo */}
                      <CCol lg={2} md={3} sm={12} className="text-center">
                        <label htmlFor="edit-photo-upload" style={{ cursor: 'pointer' }}>
                          <div style={{ width: '120px', height: '120px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto' }}>
                            {formData.photo_preview ? (
                              <img src={formData.photo_preview} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div className="text-center">
                                <div style={{ fontSize: '24px', color: '#6c757d' }}>📷</div>
                                <small style={{ color: '#6c757d' }}>Photo</small>
                              </div>
                            )}
                          </div>
                        </label>
                        <input
                          type="file"
                          id="edit-photo-upload"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () =>
                                setFormData((p) => ({ ...p, photo_preview: reader.result, photo: file }))
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                        <small className="text-muted d-block mt-1">Click to change</small>
                      </CCol>

                      {/* Fields */}
                      <CCol lg={10} md={9} sm={12}>
                        <CRow className="g-2">
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel={<>Name<span style={{ color: 'red' }}> *</span></>} type="text" id="name" value={formData.name} onChange={handleChange} invalid={!!formErrors.name} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel="Father Name" type="text" id="father_name" value={formData.father_name} onChange={handleChange} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel="Mother Name" type="text" id="mother_name" value={formData.mother_name} onChange={handleChange} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel={<>Gender<span style={{ color: 'red' }}> *</span></>} id="gender" value={formData.gender} onChange={handleChange} invalid={!!formErrors.gender}>
                              <option value="">Choose</option>
                              <option value="M">Male</option>
                              <option value="F">Female</option>
                              <option value="O">Other</option>
                            </CFormSelect>
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel="Date of Birth" type="date" id="dob" value={formData.dob} onChange={handleChange} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel="Blood Group" id="blood_group" value={formData.blood_group} onChange={handleChange}>
                              <option value="">Choose</option>
                              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                              ))}
                            </CFormSelect>
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel="Religion" type="text" id="religion" value={formData.religion} onChange={handleChange} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel="Caste" type="text" id="caste" value={formData.caste} onChange={handleChange} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormInput size="sm" floatingClassName="mb-2" floatingLabel="Aadhaar Number" type="text" id="aadhaar_no" value={formData.aadhaar_no} onChange={handleChange} />
                          </CCol>
                          <CCol lg={3} md={6}>
                            <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel="Enquiry" id="enquiry" value={formData.enquiry}
                              onChange={(e) => setFormData((p) => ({ ...p, enquiry: e.target.value === 'true' }))}>
                              <option value={false}>No</option>
                              <option value={true}>Yes</option>
                            </CFormSelect>
                          </CCol>
                        </CRow>
                      </CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* ── Academic Placement ───────────────────────────────── */}
                <CAccordionItem itemKey="placement">
                  <CAccordionHeader>🎓 Academic Placement</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-2">
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel={<>Class<span style={{ color: 'red' }}> *</span></>} id="class_id" value={formData.class_id} onChange={handleChange} invalid={!!formErrors.class_id}>
                          <option value="">Choose</option>
                          {classes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel={<>Section<span style={{ color: 'red' }}> *</span></>} id="section_id" value={formData.section_id} onChange={handleChange} invalid={!!formErrors.section_id}>
                          <option value="">Choose</option>
                          {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel={<>Group<span style={{ color: 'red' }}> *</span></>} id="group_id" value={formData.group_id} onChange={handleChange} invalid={!!formErrors.group_id}>
                          <option value="">Choose</option>
                          {groups.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel="Hostel" id="hostel_id" value={formData.hostel_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {hostels.map((h) => <option key={h.id} value={h.id}>{h.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel={<>State<span style={{ color: 'red' }}> *</span></>} id="state_id" value={formData.state_id} onChange={handleChange} invalid={!!formErrors.state_id}>
                          <option value="">Choose</option>
                          {states.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel={<>City<span style={{ color: 'red' }}> *</span></>} id="city_id" value={formData.city_id} onChange={handleChange} invalid={!!formErrors.city_id}>
                          <option value="">Choose</option>
                          {cities.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" floatingClassName="mb-2" floatingLabel="Locality" id="locality_id" value={formData.locality_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {localities.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* ── Parents Information ──────────────────────────────── */}
                <CAccordionItem itemKey="parents">
                  <CAccordionHeader>👨‍👩‍👧‍👦 Parents Information</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-2">
                      {/* Parent Photos */}
                      <CCol xs={12} className="mb-2">
                        <CRow className="g-2">
                          {[
                            { label: 'Father Photo', icon: '👨', uploadId: 'edit-father-photo', previewKey: 'father_photo_preview', fileKey: 'father_photo' },
                            { label: 'Mother Photo', icon: '👩', uploadId: 'edit-mother-photo', previewKey: 'mother_photo_preview', fileKey: 'mother_photo' },
                          ].map(({ label, icon, uploadId, previewKey, fileKey }) => (
                            <CCol md={2} sm={4} className="text-center" key={uploadId}>
                              <label htmlFor={uploadId} style={{ cursor: 'pointer' }}>
                                <div style={{ width: '80px', height: '80px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto' }}>
                                  {formData[previewKey] ? (
                                    <img src={formData[previewKey]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <div style={{ fontSize: '16px', color: '#6c757d' }}>{icon}</div>
                                  )}
                                </div>
                              </label>
                              <input type="file" id={uploadId} accept="image/*" hidden
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () =>
                                      setFormData((p) => ({ ...p, [previewKey]: reader.result, [fileKey]: file }))
                                    reader.readAsDataURL(file)
                                  }
                                }}
                              />
                              <small className="text-muted d-block">{label}</small>
                            </CCol>
                          ))}
                        </CRow>
                      </CCol>

                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_cell_no" floatingClassName="mb-2" floatingLabel="Father's Contact" value={formData.father_cell_no} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_cell_no" floatingClassName="mb-2" floatingLabel="Mother's Contact" value={formData.mother_cell_no} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="email" id="father_email" floatingClassName="mb-2" floatingLabel="Father's Email" value={formData.father_email} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="email" id="mother_email" floatingClassName="mb-2" floatingLabel="Mother's Email" value={formData.mother_email} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_annual_income" floatingClassName="mb-2" floatingLabel="Father's Annual Income" value={formData.father_annual_income} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_annual_income" floatingClassName="mb-2" floatingLabel="Mother's Annual Income" value={formData.mother_annual_income} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_qualification" floatingClassName="mb-2" floatingLabel="Father's Qualification" value={formData.father_qualification} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_qualification" floatingClassName="mb-2" floatingLabel="Mother's Qualification" value={formData.mother_qualification} onChange={handleChange} /></CCol>

                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" id="father_profession_id" floatingClassName="mb-2" floatingLabel="Father's Profession" value={formData.father_profession_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {professions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" id="mother_profession_id" floatingClassName="mb-2" floatingLabel="Mother's Profession" value={formData.mother_profession_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {professions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" id="father_department_id" floatingClassName="mb-2" floatingLabel="Father's Department" value={formData.father_department_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {departments.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" id="mother_department_id" floatingClassName="mb-2" floatingLabel="Mother's Department" value={formData.mother_department_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {departments.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" id="father_designation_id" floatingClassName="mb-2" floatingLabel="Father's Designation" value={formData.father_designation_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect size="sm" id="mother_designation_id" floatingClassName="mb-2" floatingLabel="Mother's Designation" value={formData.mother_designation_id} onChange={handleChange}>
                          <option value="">Choose</option>
                          {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_org_name" floatingClassName="mb-2" floatingLabel="Father's Organization" value={formData.father_org_name} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_org_name" floatingClassName="mb-2" floatingLabel="Mother's Organization" value={formData.mother_org_name} onChange={handleChange} /></CCol>
                      <CCol lg={6} md={12}><CFormInput size="sm" type="text" id="father_office_address" floatingClassName="mb-2" floatingLabel="Father's Office Address" value={formData.father_office_address} onChange={handleChange} /></CCol>
                      <CCol lg={6} md={12}><CFormInput size="sm" type="text" id="mother_office_address" floatingClassName="mb-2" floatingLabel="Mother's Office Address" value={formData.mother_office_address} onChange={handleChange} /></CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* ── Contact & Address ─────────────────────────────────── */}
                <CAccordionItem itemKey="contact">
                  <CAccordionHeader>📍 Contact & Address</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-2">
                      <CCol lg={6} md={12}><CFormInput size="sm" type="text" id="address" floatingClassName="mb-2" floatingLabel="Home Address" value={formData.address} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="pin_code" floatingClassName="mb-2" floatingLabel="Pin Code" value={formData.pin_code} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="phone_no" floatingClassName="mb-2" floatingLabel="Phone Number" value={formData.phone_no} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="nationality" floatingClassName="mb-2" floatingLabel="Nationality" value={formData.nationality} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="bus_route" floatingClassName="mb-2" floatingLabel="Bus Route" value={formData.bus_route} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="bus_stop" floatingClassName="mb-2" floatingLabel="Bus Stop" value={formData.bus_stop} onChange={handleChange} /></CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* ── Academic History ──────────────────────────────────── */}
                <CAccordionItem itemKey="academic">
                  <CAccordionHeader>📚 Academic History</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-2">
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="personal_id_mark" floatingClassName="mb-2" floatingLabel="Personal ID Mark" value={formData.personal_id_mark} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="previous_school" floatingClassName="mb-2" floatingLabel="Previous School" value={formData.previous_school} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="class_admitted" floatingClassName="mb-2" floatingLabel="Class Admitted" value={formData.class_admitted} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_adm_no_ix_x" floatingClassName="mb-2" floatingLabel="Board Adm No (IX-X)" value={formData.board_adm_no_ix_x} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_adm_no_xi_xii" floatingClassName="mb-2" floatingLabel="Board Adm No (XI-XII)" value={formData.board_adm_no_xi_xii} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_roll_ix_x" floatingClassName="mb-2" floatingLabel="Board Roll No (IX-X)" value={formData.board_roll_ix_x} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_roll_xi_xii" floatingClassName="mb-2" floatingLabel="Board Roll No (XI-XII)" value={formData.board_roll_xi_xii} onChange={handleChange} /></CCol>
                      <CCol xs={12}><CFormInput size="sm" type="text" id="remarks" floatingClassName="mb-2" floatingLabel="Remarks" value={formData.remarks} onChange={handleChange} /></CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* ── Medical Information ───────────────────────────────── */}
                <CAccordionItem itemKey="medical">
                  <CAccordionHeader>🏥 Medical Information</CAccordionHeader>
                  <CAccordionBody>
                    <CRow className="g-2">
                      <CCol lg={3} md={6}><CFormInput size="sm" type="number" id="height" floatingClassName="mb-2" floatingLabel="Height (cm)" value={formData.height} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="number" id="weight" floatingClassName="mb-2" floatingLabel="Weight (kg)" value={formData.weight} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="vision_left" floatingClassName="mb-2" floatingLabel="Vision Left Eye" value={formData.vision_left} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="vision_right" floatingClassName="mb-2" floatingLabel="Vision Right Eye" value={formData.vision_right} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="teeth" floatingClassName="mb-2" floatingLabel="Teeth Condition" value={formData.teeth} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="oral_hygiene" floatingClassName="mb-2" floatingLabel="Oral Hygiene" value={formData.oral_hygiene} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="doctor_name" floatingClassName="mb-2" floatingLabel="Family Doctor" value={formData.doctor_name} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="clinic_mobile" floatingClassName="mb-2" floatingLabel="Clinic Mobile" value={formData.clinic_mobile} onChange={handleChange} /></CCol>
                      <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="clinic_phone" floatingClassName="mb-2" floatingLabel="Clinic Phone" value={formData.clinic_phone} onChange={handleChange} /></CCol>
                      <CCol xs={12}><CFormInput size="sm" type="text" id="medical_history" floatingClassName="mb-2" floatingLabel="Medical History" value={formData.medical_history} onChange={handleChange} /></CCol>
                      <CCol xs={12}><CFormInput size="sm" type="text" id="clinic_address" floatingClassName="mb-2" floatingLabel="Clinic Address" value={formData.clinic_address} onChange={handleChange} /></CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

              </CAccordion>

              {/* Save */}
              <div className="border-top pt-3 mt-3">
                <div className="d-flex gap-2 align-items-center">
                  <CButton color="primary" type="submit" disabled={saving} className="px-4">
                    {saving ? <CSpinner size="sm" className="me-2" /> : null}
                    Save Changes
                  </CButton>
                  <div className="ms-auto">
                    <small className="text-muted">
                      <span style={{ color: 'red' }}>*</span> Required fields
                    </small>
                  </div>
                </div>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditStudent
