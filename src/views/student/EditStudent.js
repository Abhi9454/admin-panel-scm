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
  CFormTextarea,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'

const EditStudent = () => {
  const location = useLocation()
  const studentId = location.state?.studentId || null
  const [loading, setLoading] = useState(true)
  const [studentType, setStudentType] = useState('')
  const [locality, setLocality] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [department, setDepartment] = useState([])
  const [designation, setDesignation] = useState([])
  const [profession, setProfession] = useState([])
  const [hostel, setHostel] = useState([])
  const [group, setGroup] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    className: '',
    classNameId: '',
    sectionId: '',
    sectionName: '',
    caste: '',
    locality: '',
    bloodGroup: '',
    religion: '',
    aadhaarNumber: '',
    hostelId: '',
    hostelName: '',
    groupId: '',
    groupName: '',
    cityId: '',
    cityName: '',
    stateId: '',
    stateName: '',
    studentType: '',
    fatherContact: '',
    motherContact: '',
    fatherAnnualIncome: '',
    motherAnnualIncome: '',
    fatherEmail: '',
    motherEmail: '',
    fatherQualification: '',
    motherQualification: '',
    fatherProfessionId: '',
    fatherProfessionName: '',
    motherProfessionId: '',
    motherProfessionName: '',
    fatherDepartmentId: '',
    fatherDepartmentName: '',
    motherDepartmentId: '',
    motherDepartmentName: '',
    fatherDesignationId: '',
    fatherDesignationName: '',
    motherDesignationId: '',
    motherDesignationName: '',
    fatherOrgName: '',
    motherOrgName: '',
    fatherOfficeAddress: '',
    motherOfficeAddress: '',
    address: '',
    zip: '',
    nationality: 'Indian',
    phoneNumber: '',
    busRoute: '',
    busStop: '',
    game: '',
    personalIdMark: '',
    previousSchool: '',
    boardAdmNoIX_X: '',
    boardAdmNoXI_XII: '',
    boardRollNoIX_X: '',
    boardRollNoXI_XII: '',
    classAdmitted: '',
    remarks: '',
    height: '',
    weight: '',
    visionLeft: '',
    visionRight: '',
    teeth: '',
    oralHygiene: '',
    medicalHistory: '',
    doctorName: '',
    clinicAddress: '',
    clinicPhoneNumber: '',
    clinicMobileNumber: '',
    registrationStatus: '',
  })

  useEffect(() => {
    if (studentId) {
      fetchData()
      fetchStudentDetails()
    }
  }, [studentId])

  const fetchStudentDetails = async () => {
    try {
      const response = await studentManagementApi.getById('get', `${studentId}`)
      console.log(response)
      setFormData(response)
    } catch (error) {
      console.error('Error fetching student details:', error)
    }
  }

  // Auto-mapping useEffects (preserved from original)
  useEffect(() => {
    if (formData.className && classes.length > 0) {
      const matchedClass = classes.find((cls) => cls.name === formData.className)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          classNameId: matchedClass.id.toString(),
        }))
      }
    }
  }, [classes, formData.className])

  useEffect(() => {
    if (formData.sectionName && sections.length > 0) {
      const matchedClass = sections.find((cls) => cls.name === formData.sectionName)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          sectionId: matchedClass.id.toString(),
        }))
      }
    }
  }, [sections, formData.sectionName])

  useEffect(() => {
    if (formData.hostelName && hostel.length > 0) {
      const matchedClass = hostel.find((cls) => cls.name === formData.hostelName)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          hostelId: matchedClass.id.toString(),
        }))
      }
    }
  }, [hostel, formData.hostelName])

  useEffect(() => {
    if (formData.groupName && group.length > 0) {
      const matchedClass = group.find((cls) => cls.name === formData.groupName)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          groupId: matchedClass.id.toString(),
        }))
      }
    }
  }, [group, formData.groupName])

  useEffect(() => {
    if (formData.cityName && cities.length > 0) {
      const matchedClass = cities.find((cls) => cls.name === formData.cityName)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          cityId: matchedClass.id.toString(),
        }))
      }
    }
  }, [cities, formData.cityName])

  useEffect(() => {
    if (formData.stateName && states.length > 0) {
      const matchedClass = states.find((cls) => cls.name === formData.stateName)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          stateId: matchedClass.id.toString(),
        }))
      }
    }
  }, [states, formData.stateName])

  useEffect(() => {
    if (formData.motherDepartmentName && formData.fatherDepartmentName && department.length > 0) {
      const motherDepartment = department.find((cls) => cls.name === formData.motherDepartmentName)
      const fatherDepartment = department.find((cls) => cls.name === formData.fatherDepartmentName)
      console.log(motherDepartment)
      if (motherDepartment) {
        setFormData((prev) => ({
          ...prev,
          motherDepartmentId: motherDepartment.id.toString(),
        }))
      }
      if (fatherDepartment) {
        setFormData((prev) => ({
          ...prev,
          fatherDepartmentId: fatherDepartment.id.toString(),
        }))
      }
    }
  }, [department, formData.motherDepartmentName, formData.fatherDepartmentName])

  useEffect(() => {
    if (
      formData.motherDesignationName &&
      formData.fatherDesignationName &&
      designation.length > 0
    ) {
      const fatherDesignation = designation.find(
        (cls) => cls.name === formData.fatherDesignationName,
      )
      const motherDesignation = designation.find(
        (cls) => cls.name === formData.motherDesignationName,
      )
      if (fatherDesignation) {
        setFormData((prev) => ({
          ...prev,
          fatherDesignationId: fatherDesignation.id.toString(),
        }))
      }
      if (motherDesignation) {
        setFormData((prev) => ({
          ...prev,
          motherDesignationId: motherDesignation.id.toString(),
        }))
      }
    }
  }, [designation, formData.motherDesignationName, formData.fatherDesignationName])

  useEffect(() => {
    if (formData.fatherProfessionName && formData.motherProfessionName && profession.length > 0) {
      const fatherProfession = profession.find((cls) => cls.name === formData.fatherProfessionName)
      const motherProfession = profession.find((cls) => cls.name === formData.motherProfessionName)
      if (fatherProfession) {
        setFormData((prev) => ({
          ...prev,
          fatherProfessionId: fatherProfession.id.toString(),
        }))
      }
      if (motherProfession) {
        setFormData((prev) => ({
          ...prev,
          motherProfessionId: motherProfession.id.toString(),
        }))
      }
    }
  }, [profession, formData.motherProfessionName, formData.fatherProfessionName])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [
        classData,
        sectionData,
        hostelData,
        groupData,
        cityData,
        stateData,
        designationData,
        departmentData,
        professionData,
        localityData,
      ] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
        apiService.getAll('hostel/all'),
        apiService.getAll('group/all'),
        apiService.getAll('city/all'),
        apiService.getAll('state/all'),
        apiService.getAll('designation/all'),
        apiService.getAll('department/all'),
        apiService.getAll('profession/all'),
        apiService.getAll('locality/all'),
      ])

      setClasses(classData)
      setSections(sectionData)
      setCities(cityData)
      setStates(stateData)
      setHostel(hostelData)
      setGroup(groupData)
      setDepartment(departmentData)
      setProfession(professionData)
      setDesignation(designationData)
      setLocality(localityData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'classNameId' ||
        id === 'sectionId' ||
        id === 'cityId' ||
        id === 'stateId' ||
        id === 'hostelId' ||
        id === 'groupId' ||
        id === 'fatherDepartmentId' ||
        id === 'motherDepartmentId' ||
        id === 'fatherProfessionId' ||
        id === 'motherProfessionId' ||
        id === 'fatherDesignationId' ||
        id === 'motherDesignationId' ||
        id === 'locality'
          ? Number(value) || null
          : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = [
      'name',
      'studentType',
      'admissionNumber',
      'classNameId',
      'sectionId',
      'gender',
      'groupId',
      'cityId',
      'stateId',
    ]

    const newErrors = {}
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = true
      }
    })

    setFormErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      alert('Please fill all required fields.')
      return
    }

    setLoading(true)
    try {
      const response = await studentManagementApi.create(
        `saveOrUpdate?studentId=${studentId}`,
        formData,
      )
      console.log('Student updated successfully:', response)

      if (response && response.id) {
        alert('Student updated successfully!')
      } else {
        alert('Error updating student!')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student!')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <CRow className="g-2">
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardBody className="text-center py-4">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading student information...</span>
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
                <h6 className="mb-0 fw-bold text-primary">Edit Student</h6>
                <small className="text-muted">
                  Student ID: {studentId} | {formData.name} | {formData.admissionNumber}
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color="warning" className="me-2">
                  Edit Mode
                </CBadge>
                <CBadge color="info">
                  {Object.keys(formErrors).length === 0
                    ? 'Form Valid'
                    : `${Object.keys(formErrors).length} Errors`}
                </CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            <CForm onSubmit={handleSubmit}>
              <CRow className="g-2">
                {/* Student Type Selection */}
                <CCol xs={12} className="mb-2">
                  <div className="d-flex gap-3 align-items-center">
                    <strong className="text-muted">Student Type:</strong>
                    <CFormCheck
                      type="radio"
                      label="New Student"
                      value="new"
                      id="studentTypeNew"
                      checked={formData.studentType === 'new'}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                      }
                      invalid={!!formErrors.studentType}
                    />
                    <CFormCheck
                      type="radio"
                      label="Old Student"
                      value="old"
                      id="studentTypeOld"
                      checked={formData.studentType === 'old'}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                      }
                      invalid={!!formErrors.studentType}
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
                        reader.onloadend = () => {
                          setFormData((prev) => ({
                            ...prev,
                            photoPreview: reader.result,
                            photoFile: file,
                          }))
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <small className="text-muted d-block mt-1">Click to upload</small>
                </CCol>

                {/* Basic Information */}
                <CCol lg={10} md={9} sm={12}>
                  <CRow className="g-2">
                    {/* Row 1 - Basic Info */}
                    <CCol lg={3} md={6} sm={12}>
                      <CFormInput
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            Name<span style={{ color: 'red' }}> *</span>
                          </>
                        }
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
                        floatingLabel={
                          <>
                            Admission Number<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        type="text"
                        id="admissionNumber"
                        value={formData.admissionNumber}
                        onChange={handleChange}
                        invalid={!!formErrors.admissionNumber}
                      />
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormInput
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Father Name"
                        type="text"
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormInput
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Mother Name"
                        type="text"
                        id="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                      />
                    </CCol>

                    {/* Row 2 - Academic Info */}
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            Class<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="classNameId"
                        value={formData.classNameId || ''}
                        onChange={handleChange}
                        invalid={!!formErrors.classNameId}
                      >
                        <option value="">Choose</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            Section<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="sectionId"
                        value={formData.sectionId || ''}
                        onChange={handleChange}
                        invalid={!!formErrors.sectionId}
                      >
                        <option value="">Choose</option>
                        {sections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            Group<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="groupId"
                        value={formData.groupId || ''}
                        onChange={handleChange}
                        invalid={!!formErrors.groupId}
                      >
                        <option value="">Choose</option>
                        {group.map((grp) => (
                          <option key={grp.id} value={grp.id}>
                            {grp.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Hostel"
                        id="hostelId"
                        value={formData.hostelId || ''}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {hostel.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    {/* Row 3 - Personal Info */}
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            Gender<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        invalid={!!formErrors.gender}
                      >
                        <option value="">Choose</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormInput
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Date of Birth"
                        type="date"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Blood Group"
                        id="bloodGroup"
                        value={formData.bloodGroup}
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

                    {/* Row 4 - Location Info */}
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            State<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="stateId"
                        value={formData.stateId || ''}
                        onChange={handleChange}
                        invalid={!!formErrors.stateId}
                      >
                        <option value="">Choose</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel={
                          <>
                            City<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="cityId"
                        value={formData.cityId || ''}
                        onChange={handleChange}
                        invalid={!!formErrors.cityId}
                      >
                        <option value="">Choose</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6} sm={12}>
                      <CFormSelect
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Locality"
                        id="locality"
                        value={formData.locality || ''}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {locality.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
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

                    {/* Row 5 - Additional Info */}
                    <CCol lg={6} md={12}>
                      <CFormInput
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="Aadhaar Number"
                        type="text"
                        id="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CCol>

                {/* Submit Button */}
                <CCol xs={12} className="pt-3 border-top">
                  <div className="d-flex gap-2 align-items-center">
                    <CButton color="primary" type="submit" disabled={loading} className="px-4">
                      {loading ? <CSpinner size="sm" className="me-2" /> : null}
                      Update Student
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
          </CCardBody>
        </CCard>
      </CCol>

      {/* Additional Information Accordions - Compact Version */}
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <h6 className="mb-0 fw-bold text-primary">Additional Information</h6>
            <small className="text-muted">Complete student profile with additional details</small>
          </CCardHeader>

          <CCardBody className="p-2">
            <CAccordion className="accordion-compact">
              {/* Parents Information */}
              <CAccordionItem itemKey="parents">
                <CAccordionHeader className="py-2">👨‍👩‍👧‍👦 Parents Information</CAccordionHeader>
                <CAccordionBody className="py-2">
                  <CForm>
                    <CRow className="g-2">
                      {/* Parent Photos - Compact horizontal layout */}
                      <CCol xs={12} className="mb-3">
                        <CRow className="g-2">
                          <CCol md={2} sm={6} className="text-center">
                            <label htmlFor="father-photo-upload" style={{ cursor: 'pointer' }}>
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
                                  margin: '0 auto',
                                }}
                              >
                                {formData.fatherPhotoPreview ? (
                                  <img
                                    src={formData.fatherPhotoPreview}
                                    alt="Father"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="text-center">
                                    <div style={{ fontSize: '16px', color: '#6c757d' }}>👨</div>
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              type="file"
                              id="father-photo-upload"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      fatherPhotoPreview: reader.result,
                                      fatherPhotoFile: file,
                                    }))
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                            <small className="text-muted d-block mt-1">Father Photo</small>
                          </CCol>

                          <CCol md={2} sm={6} className="text-center">
                            <label htmlFor="mother-photo-upload" style={{ cursor: 'pointer' }}>
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
                                  margin: '0 auto',
                                }}
                              >
                                {formData.motherPhotoPreview ? (
                                  <img
                                    src={formData.motherPhotoPreview}
                                    alt="Mother"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div className="text-center">
                                    <div style={{ fontSize: '16px', color: '#6c757d' }}>👩</div>
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              type="file"
                              id="mother-photo-upload"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      motherPhotoPreview: reader.result,
                                      motherPhotoFile: file,
                                    }))
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                            <small className="text-muted d-block mt-1">Mother Photo</small>
                          </CCol>
                        </CRow>
                      </CCol>

                      {/* Contact Information */}
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="fatherContact"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Contact"
                          value={formData.fatherContact}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="motherContact"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Contact"
                          value={formData.motherContact}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="email"
                          id="fatherEmail"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Email"
                          value={formData.fatherEmail}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="email"
                          id="motherEmail"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Email"
                          value={formData.motherEmail}
                          onChange={handleChange}
                        />
                      </CCol>

                      {/* Income & Qualification */}
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="fatherAnnualIncome"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Annual Income"
                          value={formData.fatherAnnualIncome}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="motherAnnualIncome"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Annual Income"
                          value={formData.motherAnnualIncome}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="fatherQualification"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Qualification"
                          value={formData.fatherQualification}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="motherQualification"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Qualification"
                          value={formData.motherQualification}
                          onChange={handleChange}
                        />
                      </CCol>

                      {/* Professional Information */}
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          id="fatherProfessionId"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Profession"
                          value={formData.fatherProfessionId}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {profession.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                              {prof.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          id="motherProfessionId"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Profession"
                          value={formData.motherProfessionId}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {profession.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                              {prof.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          id="fatherDepartmentId"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Department"
                          value={formData.fatherDepartmentId}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {department.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          id="motherDepartmentId"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Department"
                          value={formData.motherDepartmentId}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {department.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      {/* Designation & Organization */}
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          id="fatherDesignationId"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Designation"
                          value={formData.fatherDesignationId}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {designation.map((design) => (
                            <option key={design.id} value={design.id}>
                              {design.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          id="motherDesignationId"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Designation"
                          value={formData.motherDesignationId}
                          onChange={handleChange}
                        >
                          <option value="">Choose</option>
                          {designation.map((design) => (
                            <option key={design.id} value={design.id}>
                              {design.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="fatherOrgName"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Organization"
                          value={formData.fatherOrgName}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="motherOrgName"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Organization"
                          value={formData.motherOrgName}
                          onChange={handleChange}
                        />
                      </CCol>

                      {/* Office Addresses */}
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="fatherOfficeAddress"
                          floatingClassName="mb-2"
                          floatingLabel="Father's Office Address"
                          value={formData.fatherOfficeAddress}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="motherOfficeAddress"
                          floatingClassName="mb-2"
                          floatingLabel="Mother's Office Address"
                          value={formData.motherOfficeAddress}
                          onChange={handleChange}
                        />
                      </CCol>
                    </CRow>
                  </CForm>
                </CAccordionBody>
              </CAccordionItem>

              {/* Contact & Address Information */}
              <CAccordionItem itemKey="contact">
                <CAccordionHeader className="py-2">
                  📍 Contact & Address Information
                </CAccordionHeader>
                <CAccordionBody className="py-2">
                  <CForm>
                    <CRow className="g-2">
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="address"
                          floatingClassName="mb-2"
                          floatingLabel="Home Address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="zip"
                          floatingClassName="mb-2"
                          floatingLabel="Pin Code"
                          value={formData.zip}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="phoneNumber"
                          floatingClassName="mb-2"
                          floatingLabel="Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="nationality"
                          floatingClassName="mb-2"
                          floatingLabel="Nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="busRoute"
                          floatingClassName="mb-2"
                          floatingLabel="Bus Route"
                          value={formData.busRoute}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="busStop"
                          floatingClassName="mb-2"
                          floatingLabel="Bus Stop"
                          value={formData.busStop}
                          onChange={handleChange}
                        />
                      </CCol>
                    </CRow>
                  </CForm>
                </CAccordionBody>
              </CAccordionItem>

              {/* Academic & Other Information */}
              <CAccordionItem itemKey="academic">
                <CAccordionHeader className="py-2">
                  🎓 Academic & Other Information
                </CAccordionHeader>
                <CAccordionBody className="py-2">
                  <CForm>
                    <CRow className="g-2">
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="game"
                          floatingClassName="mb-2"
                          floatingLabel="Favorite Game/Sport"
                          value={formData.game}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="personalIdMark"
                          floatingClassName="mb-2"
                          floatingLabel="Personal ID Mark"
                          value={formData.personalIdMark}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="previousSchool"
                          floatingClassName="mb-2"
                          floatingLabel="Previous School"
                          value={formData.previousSchool}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="classAdmitted"
                          floatingClassName="mb-2"
                          floatingLabel="Class Admitted"
                          value={formData.classAdmitted}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="boardAdmNoIX_X"
                          floatingClassName="mb-2"
                          floatingLabel="Board Adm No (IX-X)"
                          value={formData.boardAdmNoIX_X}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="boardAdmNoXI_XII"
                          floatingClassName="mb-2"
                          floatingLabel="Board Adm No (XI-XII)"
                          value={formData.boardAdmNoXI_XII}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="boardRollNoIX_X"
                          floatingClassName="mb-2"
                          floatingLabel="Board Roll No (IX-X)"
                          value={formData.boardRollNoIX_X}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="boardRollNoXI_XII"
                          floatingClassName="mb-2"
                          floatingLabel="Board Roll No (XI-XII)"
                          value={formData.boardRollNoXI_XII}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="remarks"
                          floatingClassName="mb-2"
                          floatingLabel="Remarks"
                          value={formData.remarks}
                          onChange={handleChange}
                        />
                      </CCol>
                    </CRow>
                  </CForm>
                </CAccordionBody>
              </CAccordionItem>

              {/* Medical Information */}
              <CAccordionItem itemKey="medical">
                <CAccordionHeader className="py-2">🏥 Medical Information</CAccordionHeader>
                <CAccordionBody className="py-2">
                  <CForm>
                    <CRow className="g-2">
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="number"
                          id="height"
                          floatingClassName="mb-2"
                          floatingLabel="Height (cm)"
                          value={formData.height}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="number"
                          id="weight"
                          floatingClassName="mb-2"
                          floatingLabel="Weight (kg)"
                          value={formData.weight}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="visionLeft"
                          floatingClassName="mb-2"
                          floatingLabel="Vision Left Eye"
                          value={formData.visionLeft}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="visionRight"
                          floatingClassName="mb-2"
                          floatingLabel="Vision Right Eye"
                          value={formData.visionRight}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="teeth"
                          floatingClassName="mb-2"
                          floatingLabel="Teeth Condition"
                          value={formData.teeth}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="oralHygiene"
                          floatingClassName="mb-2"
                          floatingLabel="Oral Hygiene"
                          value={formData.oralHygiene}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="doctorName"
                          floatingClassName="mb-2"
                          floatingLabel="Family Doctor"
                          value={formData.doctorName}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="clinicMobileNumber"
                          floatingClassName="mb-2"
                          floatingLabel="Clinic Mobile"
                          value={formData.clinicMobileNumber}
                          onChange={handleChange}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          type="text"
                          id="medicalHistory"
                          floatingClassName="mb-2"
                          floatingLabel="Medical History"
                          value={formData.medicalHistory}
                          onChange={handleChange}
                        />
                      </CCol>
                    </CRow>
                  </CForm>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>

            {/* Save Button for Additional Information */}
            <div className="border-top pt-3 mt-3">
              <CRow className="align-items-center">
                <CCol md={6}>
                  <small className="text-muted">Update all additional information sections</small>
                </CCol>
                <CCol md={6} className="text-end">
                  <CButton
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? <CSpinner size="sm" className="me-2" /> : null}
                    Save All Information
                  </CButton>
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditStudent
