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
} from '@coreui/react'
import masterApi from '../../api/masterApi'
import studentManagementApi from 'src/api/studentManagementApi'
import AdditionalStudentDetails from 'src/views/student/AdditionalStudentDetails'

const AddStudent = () => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [hostels, setHostels] = useState([])
  const [groups, setGroups] = useState([])
  const [localities, setLocalities] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [showDetailsCard, setShowDetailsCard] = useState(false)
  const [admNo, setAdmNo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    adm_no: '',
    name: '',
    student_type: '',
    gender: '',
    dob: '',
    class_id: '',
    section_id: '',
    city_id: '',
    state_id: '',
    caste: '',
    blood_group: '',
    religion: '',
    aadhaar_no: '',
    locality_id: '',
    hostel_id: '',
    group_id: '',
    father_name: '',
    mother_name: '',
    enquiry: false,
    photo: null,
    photoPreview: null,
  })

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const fetchDropdowns = async () => {
    setLoading(true)
    try {
      const [classData, sectionData, hostelData, groupData, cityData, stateData, localityData] =
        await Promise.all([
          masterApi.getAll('classes'),
          masterApi.getAll('sections'),
          masterApi.getAll('hostels'),
          masterApi.getAll('groups'),
          masterApi.getAll('cities'),
          masterApi.getAll('states'),
          masterApi.getAll('localities'),
        ])
      setClasses(classData.results || [])
      setSections(sectionData.results || [])
      setHostels(hostelData.results || [])
      setGroups(groupData.results || [])
      setCities(cityData.results || [])
      setStates(stateData.results || [])
      setLocalities(localityData.results || [])
    } catch (error) {
      console.error('Error fetching dropdowns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    const numericFields = ['class_id', 'section_id', 'city_id', 'state_id', 'hostel_id', 'group_id', 'locality_id']
    setFormData((prev) => ({
      ...prev,
      [id]: numericFields.includes(id) ? (Number(value) || '') : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const requiredFields = ['name', 'student_type', 'adm_no', 'class_id', 'section_id', 'gender', 'group_id', 'city_id', 'state_id']
    const newErrors = {}
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field] === '') newErrors[field] = true
    })
    setFormErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      alert('Please fill all required fields.')
      return
    }

    setLoading(true)
    try {
      const { photo, photoPreview, ...fields } = formData
      let payload

      if (photo) {
        payload = new FormData()
        Object.entries(fields).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') payload.append(k, v)
        })
        payload.append('photo', photo)
      } else {
        payload = Object.fromEntries(
          Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== ''),
        )
      }

      const response = await studentManagementApi.create(payload)
      if (response && response.adm_no) {
        setAdmNo(response.adm_no)
        setShowDetailsCard(true)
        alert('Student added successfully!')
      } else {
        alert('Failed to add student. Please check the details.')
      }
    } catch (error) {
      const errData = error?.response?.data
      if (errData?.adm_no) {
        alert('Duplicate Admission Number!')
      } else {
        alert('Failed to add student!')
      }
      console.error('Error adding student:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      adm_no: '',
      name: '',
      student_type: '',
      gender: '',
      dob: '',
      class_id: '',
      section_id: '',
      city_id: '',
      state_id: '',
      caste: '',
      blood_group: '',
      religion: '',
      aadhaar_no: '',
      locality_id: '',
      hostel_id: '',
      group_id: '',
      father_name: '',
      mother_name: '',
      enquiry: false,
      photo: null,
      photoPreview: null,
    })
    setFormErrors({})
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={6}>
                <h5 className="mb-0 fw-bold text-primary">Add Student</h5>
                <small className="text-muted">Enter student details below</small>
              </CCol>
              <CCol md={6} className="text-end">
                <CButton size="sm" color="outline-secondary" onClick={resetForm} className="me-2">
                  Reset Form
                </CButton>
                <CBadge color={Object.keys(formErrors).length === 0 ? 'info' : 'danger'}>
                  {Object.keys(formErrors).length === 0
                    ? 'Form Valid'
                    : `${Object.keys(formErrors).length} Errors`}
                </CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading form data...</span>
              </div>
            ) : (
              <CForm onSubmit={handleSubmit}>
                <CRow className="g-2">
                  {/* Student Type */}
                  <CCol xs={12} className="mb-2">
                    <div className="d-flex gap-3 align-items-center">
                      <span className="mb-0 fw-semibold">Student Type:</span>
                      <CFormCheck
                        type="radio"
                        id="student_type_new"
                        label="New Student"
                        checked={formData.student_type === 'new'}
                        onChange={() => setFormData((prev) => ({ ...prev, student_type: 'new' }))}
                        invalid={!!formErrors.student_type}
                      />
                      <CFormCheck
                        type="radio"
                        id="student_type_old"
                        label="Old Student"
                        checked={formData.student_type === 'old'}
                        onChange={() => setFormData((prev) => ({ ...prev, student_type: 'old' }))}
                        invalid={!!formErrors.student_type}
                      />
                    </div>
                  </CCol>

                  {/* Photo Upload */}
                  <CCol lg={2} md={3} sm={12} className="text-center mb-3">
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                      <div
                        style={{
                          width: '120px',
                          height: '120px',
                          border: '2px dashed #ccc',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          margin: '0 auto',
                        }}
                      >
                        {formData.photoPreview ? (
                          <img
                            src={formData.photoPreview}
                            alt="Student"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
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
                      id="photo-upload"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
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
                      }}
                    />
                    <small className="text-muted d-block mt-1">Click to upload</small>
                  </CCol>

                  {/* Form Fields */}
                  <CCol lg={10} md={9} sm={12}>
                    <CRow className="g-2">
                      {/* Row 1 — Basic Info */}
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>Name<span style={{ color: 'red' }}> *</span></>}
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          invalid={!!formErrors.name}
                        />
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>Admission Number<span style={{ color: 'red' }}> *</span></>}
                          type="text"
                          id="adm_no"
                          value={formData.adm_no}
                          onChange={handleChange}
                          invalid={!!formErrors.adm_no}
                        />
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Father Name"
                          type="text"
                          id="father_name"
                          value={formData.father_name}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Mother Name"
                          type="text"
                          id="mother_name"
                          value={formData.mother_name}
                          onChange={handleChange}
                        />
                      </CCol>

                      {/* Row 2 — Academic */}
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>Class<span style={{ color: 'red' }}> *</span></>}
                          id="class_id"
                          value={formData.class_id}
                          onChange={handleChange}
                          invalid={!!formErrors.class_id}
                        >
                          <option value="">Choose</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>Section<span style={{ color: 'red' }}> *</span></>}
                          id="section_id"
                          value={formData.section_id}
                          onChange={handleChange}
                          invalid={!!formErrors.section_id}
                        >
                          <option value="">Choose</option>
                          {sections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>Group<span style={{ color: 'red' }}> *</span></>}
                          id="group_id"
                          value={formData.group_id}
                          onChange={handleChange}
                          invalid={!!formErrors.group_id}
                        >
                          <option value="">Choose</option>
                          {groups.map((grp) => (
                            <option key={grp.id} value={grp.id}>
                              {grp.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Hostel"
                          id="hostel_id"
                          value={formData.hostel_id}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {hostels.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      {/* Row 3 — Personal */}
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>Gender<span style={{ color: 'red' }}> *</span></>}
                          id="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          invalid={!!formErrors.gender}
                        >
                          <option value="">Choose</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Date of Birth"
                          type="date"
                          id="dob"
                          value={formData.dob}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Blood Group"
                          id="blood_group"
                          value={formData.blood_group}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Religion"
                          type="text"
                          id="religion"
                          value={formData.religion}
                          onChange={handleChange}
                        />
                      </CCol>

                      {/* Row 4 — Location */}
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>State<span style={{ color: 'red' }}> *</span></>}
                          id="state_id"
                          value={formData.state_id}
                          onChange={handleChange}
                          invalid={!!formErrors.state_id}
                        >
                          <option value="">Choose</option>
                          {states.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={<>City<span style={{ color: 'red' }}> *</span></>}
                          id="city_id"
                          value={formData.city_id}
                          onChange={handleChange}
                          invalid={!!formErrors.city_id}
                        >
                          <option value="">Choose</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Locality"
                          id="locality_id"
                          value={formData.locality_id}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {localities.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.title}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Caste"
                          type="text"
                          id="caste"
                          value={formData.caste}
                          onChange={handleChange}
                        />
                      </CCol>

                      {/* Row 5 — Additional */}
                      <CCol lg={3} md={6} sm={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Aadhaar Number"
                          type="text"
                          id="aadhaar_no"
                          value={formData.aadhaar_no}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Enquiry"
                          id="enquiry"
                          value={formData.enquiry}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              enquiry: e.target.value === 'true',
                            }))
                          }
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CCol>

                  {/* Submit */}
                  <CCol xs={12} className="pt-3 border-top">
                    <div className="d-flex gap-2 align-items-center">
                      <CButton color="primary" type="submit" disabled={loading} className="px-4">
                        {loading ? <CSpinner size="sm" className="me-2" /> : null}
                        Add Student
                      </CButton>
                      <CButton color="outline-secondary" type="button" onClick={resetForm}>
                        Clear Form
                      </CButton>
                      <div className="ms-auto">
                        <small className="text-muted">
                          <span style={{ color: 'red' }}>*</span> Required fields
                        </small>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {showDetailsCard && <AdditionalStudentDetails adm_no={admNo} />}
    </CRow>
  )
}

export default AddStudent
