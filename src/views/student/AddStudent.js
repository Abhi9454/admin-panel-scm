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
  CRow,
  CSpinner,
  CBadge,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from 'src/api/studentManagementApi'
import AdditionalStudentDetails from 'src/views/student/AdditionalStudentDetails'

const AddStudent = () => {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [hostel, setHostel] = useState([])
  const [group, setGroup] = useState([])
  const [locality, setLocality] = useState([])
  const [cities, setCities] = useState([])
  const [password, setPassword] = useState('')
  const [studentType, setStudentType] = useState('')
  const [states, setStates] = useState([])
  const [showDetailsCard, setShowDetailsCard] = useState(false)
  const [studentId, setStudentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    admissionNumber: '',
    gender: '',
    dateOfBirth: '',
    classNameId: null,
    sectionId: null,
    cityId: null,
    stateId: null,
    caste: '',
    bloodGroup: '',
    religion: '',
    aadhaarNumber: '',
    locality: '',
    hostel: null,
    groupId: null,
    fatherName: '',
    motherName: '',
    studentType: '',
    enquiry: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classData, sectionData, hostelData, groupData, cityData, stateData, localityData] =
        await Promise.all([
          apiService.getAll('class/all'),
          apiService.getAll('section/all'),
          apiService.getAll('hostel/all'),
          apiService.getAll('group/all'),
          apiService.getAll('city/all'),
          apiService.getAll('state/all'),
          apiService.getAll('locality/all'),
        ])

      setClasses(classData)
      setSections(sectionData)
      setCities(cityData)
      setStates(stateData)
      setHostel(hostelData)
      setGroup(groupData)
      setLocality(localityData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'classNameId' ||
        id === 'sectionId' ||
        id === 'cityId' ||
        id === 'stateId' ||
        id === 'hostel' ||
        id === 'groupId' ||
        id === 'localityId'
          ? Number(value) || null // Convert to number, handle empty selection as null
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
      console.log(formData)
      const response = await studentManagementApi.create('saveOrUpdate', formData)
      console.log('Student added successfully:', response)
      if (response && response.id) {
        setStudentId(response.id)
        setPassword(response.plainText)
        setShowDetailsCard(true)
        alert('Student added successfully!')
      } else {
        alert('Duplicate Admission number!')
      }
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student!')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      admissionNumber: '',
      gender: '',
      dateOfBirth: '',
      classNameId: null,
      sectionId: null,
      cityId: null,
      stateId: null,
      caste: '',
      bloodGroup: '',
      religion: '',
      aadhaarNumber: '',
      locality: '',
      hostel: null,
      groupId: null,
      fatherName: '',
      motherName: '',
      studentType: '',
      enquiry: false,
      photoPreview: null,
      photoFile: null,
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
                <CBadge color="info">
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
                  {/* Student Type Selection */}
                  <CCol xs={12} className="mb-2">
                    <div className="d-flex gap-3 align-items-center">
                      <CFormLabel className="mb-0 fw-semibold">Student Type:</CFormLabel>
                      <CFormCheck
                        type="radio"
                        id="studentTypeNew"
                        label="New Student"
                        value="new"
                        checked={formData.studentType === 'new'}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                        }
                        invalid={!!formErrors.studentType}
                      />
                      <CFormCheck
                        type="radio"
                        id="studentTypeOld"
                        label="Old Student"
                        value="old"
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

                  {/* Form Fields */}
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
                          id="hostel"
                          value={formData.hostel || ''}
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
                          id="localityId"
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
                      <CCol lg={3} md={6} sm={12}>
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
                      <CCol lg={3} md={6} sm={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Enquiry"
                          id="enquiry"
                          value={formData.enquiry}
                          onChange={handleChange}
                        >
                          <option value={false}>No</option>
                          <option value={true}>Yes</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                  </CCol>

                  {/* Submit Button */}
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

      {showDetailsCard && (
        <AdditionalStudentDetails
          studentId={studentId}
          admissionNumber={formData.admissionNumber}
        />
      )}
    </CRow>
  )
}

export default AddStudent
