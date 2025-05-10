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
        id === 'className' ||
        id === 'section' ||
        id === 'city' ||
        id === 'state' ||
        id === 'hostel' ||
        id === 'group' ||
        id === 'locality'
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
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Student</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Student Details</p>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading data...</p>
              </div>
            ) : (
              <CRow className="mt-3">
                <CCol md={9}>
                  <CForm className="row g-3" onSubmit={handleSubmit}>
                    <CRow className="mt-3 mb-3">
                      <CCol xs="auto">
                        <CFormCheck
                          type="radio"
                          id="studentType"
                          label="New Student"
                          value="new"
                          checked={formData.studentType === 'new'}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                          }
                          invalid={!!formErrors.studentType}
                        />
                      </CCol>
                      <CCol xs="auto">
                        <CFormCheck
                          type="radio"
                          id="studentType"
                          label="Old Student"
                          value="old"
                          checked={formData.studentType === 'old'}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                          }
                          invalid={!!formErrors.studentType}
                        />
                      </CCol>
                    </CRow>
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
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
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
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
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
                        floatingLabel="Father Name"
                        type="text"
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
                        floatingLabel="Mother Name"
                        type="text"
                        id="motherName"
                        value={formData.motherName}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
                        floatingLabel="Date of Birth"
                        type="date"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel={
                          <>
                            Class<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="classNameId"
                        value={formData.classId}
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
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel={
                          <>
                            Section<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="sectionId"
                        value={formData.sectionId}
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
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel="Blood Group"
                        id="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                      >
                        <option value="">Choose...</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg, index) => (
                          <option key={index} value={bg}>
                            {bg}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel={
                          <>
                            Gender<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        invalid={!!formErrors.gender}
                        id="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Choose...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel="Hostel"
                        id="hostel"
                        value={formData.hostelId}
                        onChange={handleChange}
                      >
                        <option value="">Choose...</option>
                        {hostel.map((hostel) => (
                          <option key={hostel.id} value={hostel.id}>
                            {hostel.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel={
                          <>
                            Group<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="groupId"
                        value={formData.groupId}
                        onChange={handleChange}
                        invalid={!!formErrors.groupId}
                      >
                        <option value="">Choose...</option>
                        {group.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
                        floatingLabel="Religion"
                        type="text"
                        id="religion"
                        value={formData.religion}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel={
                          <>
                            City<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="cityId"
                        value={formData.cityId}
                        onChange={handleChange}
                        invalid={!!formErrors.cityId}
                      >
                        <option value="">Choose...</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel={
                          <>
                            State<span style={{ color: 'red' }}> *</span>
                          </>
                        }
                        id="stateId"
                        value={formData.stateId}
                        onChange={handleChange}
                        invalid={!!formErrors.stateId}
                      >
                        <option value="">Choose...</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.id}>
                            {state.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        floatingClassName="mb-3"
                        floatingLabel="Caste"
                        type="text"
                        id="caste"
                        value={formData.caste}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        floatingClassName="mb-3"
                        floatingLabel="Aadhaar Number"
                        id="aadhaarNumber"
                        value={formData.aadhaarNumber}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormSelect
                        floatingClassName="mb-3"
                        floatingLabel="Locality"
                        id="localityId"
                        value={formData.locality}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {locality.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol xs={12} className="m-2">
                      <CButton color="primary" type="submit">
                        Add Student
                      </CButton>
                    </CCol>
                  </CForm>
                </CCol>
                <CCol md={3} className="d-flex justify-content-center align-items-start">
                  <div className="text-center">
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                      <div
                        style={{
                          width: '150px',
                          height: '150px',
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
                            alt="Student"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: '#6c757d' }}>Student Photo</span>
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
                  </div>
                </CCol>
              </CRow>
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
