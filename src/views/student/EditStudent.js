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
  CInputGroup,
  CInputGroupText,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormTextarea,
  CSpinner,
  CFormFloating,
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'
import AdditionalStudentDetails from 'src/views/student/AdditionalStudentDetails'
import { Colors } from 'chart.js'

const EditStudent = () => {
  const location = useLocation()
  const studentId = location.state?.studentId || null
  // State to track the active tab in the second card
  const [activeTab, setActiveTab] = useState('parents')
  const [loading, setLoading] = useState(true)
  const [studentType, setStudentType] = useState('')
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [department, setDepartment] = useState([])
  const [designation, setDesignation] = useState([])
  const [profession, setProfession] = useState([])
  const [hostel, setHostel] = useState([])
  const [group, setGroup] = useState([])
  const [cities, setCities] = useState([])
  const [states, setStates] = useState([])
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
  }, [cities, formData.className])

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
    if (formData.motherDepartmentName && states.length > 0) {
      const motherDepartment = department.find((cls) => cls.name === formData.motherDepartmentName)
      console.log(motherDepartment)
      if (motherDepartment) {
        setFormData((prev) => ({
          ...prev,
          motherDepartmentId: motherDepartment.id.toString(),
        }))
      }
      console.log(formData.motherDepartmentId)
    }
  }, [department, formData.motherDepartment])

  useEffect(() => {
    if (formData.motherDesignation && designation.length > 0) {
      const fatherDesignation = department.find(
        (cls) => cls.name === formData.fatherDesignationName,
      )
      const motherDesignation = department.find(
        (cls) => cls.name === formData.motherDesignationName,
      )
      if (fatherDesignation) {
        setFormData((prev) => ({
          ...prev,
          fatherDesignation: fatherDesignation.id.toString(),
        }))
      }
      if (motherDesignation) {
        setFormData((prev) => ({
          ...prev,
          motherDesignation: motherDesignation.id.toString(),
        }))
      }
    }
  }, [designation, formData.motherDesignation, formData.fatherDesignation])

  useEffect(() => {
    if (formData.fatherProfessionName && formData.motherProfessionName && profession.length > 0) {
      const fatherProfession = department.find((cls) => cls.name === formData.fatherProfessionName)
      const motherProfession = department.find((cls) => cls.name === formData.motherProfessionName)
      if (fatherProfession) {
        setFormData((prev) => ({
          ...prev,
          fatherProfession: fatherProfession.id.toString(),
        }))
      }
      if (motherProfession) {
        setFormData((prev) => ({
          ...prev,
          motherProfession: motherProfession.id.toString(),
        }))
      }
    }
  }, [profession, formData.motherProfession, formData.fatherProfession])

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
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target
    console.log(id)
    console.log(value)
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
        id === 'motherDesignationId'
          ? Number(value) || null // Convert to number, handle empty selection as null
          : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const requiredFields = [
      { key: 'name', label: 'Name is required' },
      { key: 'studentType', label: 'Select New or Old student' },
      { key: 'admissionNumber', label: 'Admission Number is required' },
      { key: 'classId', label: 'Class is required' },
      { key: 'sectionId', label: 'Section is required' },
      { key: 'gender', label: 'Gender is required' },
      { key: 'groupId', label: 'Group is required' },
      { key: 'cityId', label: 'City is required' },
      { key: 'stateId', label: 'State is required' },
    ]

    const missingFields = requiredFields
      .filter((field) => !formData[field.key] || formData[field.key] === '')
      .map((field) => field.label)

    if (missingFields.length > 0) {
      alert(`Please fill out the following required fields:\n\n${missingFields.join('\n')}`)
      return
    }
    setLoading(true)
    try {
      console.log(formData)
      const response = await studentManagementApi.create(
        `saveOrUpdate?studentId=${studentId}`,
        formData,
      )
      if (response.error === 'Not Found') {
        alert('Duplicate Admission number!')
      } else {
        alert('Student updated successfully')
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
            <strong>Edit Student</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Edit Student Details</p>
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
                          label="New Student"
                          value="new"
                          id="studentType"
                          checked={formData.studentType === 'new'}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                          }
                        />
                      </CCol>
                      <CCol xs="auto">
                        <CFormCheck
                          type="radio"
                          label="Old Student"
                          value="old"
                          id="studentType"
                          checked={formData.studentType === 'old'}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, studentType: e.target.value }))
                          }
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
                      >
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
                      >
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
                      >
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
                      >
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
                      >
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
                    <CCol xs={12} className="m-2">
                      <CButton color="primary" type="submit">
                        Update Student
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
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Additional Information</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs">
              {['parents', 'contact', 'other', 'medical'].map((tab) => (
                <CNavItem key={tab}>
                  <CNavLink active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>

            {loading ? (
              <div className="text-center m-3">
                <CSpinner color="primary" />
                <p>Loading data...</p>
              </div>
            ) : (
              <CTabContent className="mt-3">
                <CTabPane visible={activeTab === 'parents'}>
                  <CRow className="mt-3">
                    <CCol md={9}>
                      <CForm className="row g-3">
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="fatherContact"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Contact"
                            placeholder="Father's Contact"
                            value={formData.fatherContact}
                            onChange={handleChange}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="motherContact"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Contact"
                            placeholder="Mother's Contact"
                            value={formData.motherContact}
                            onChange={handleChange}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="fatherAnnualIncome"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Annual Income"
                            value={formData.fatherAnnualIncome}
                            onChange={handleChange}
                            placeholder="Enter Father's Annual Income"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="motherAnnualIncome"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Annual Income"
                            value={formData.motherAnnualIncome}
                            onChange={handleChange}
                            placeholder="Enter Mother's Annual Income"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="fatherEmail"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Email Id"
                            value={formData.fatherEmail}
                            onChange={handleChange}
                            placeholder="Enter Father's Email Id"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="motherEmail"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Email Id"
                            value={formData.motherEmail}
                            onChange={handleChange}
                            placeholder="Enter Mother's Email Id"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Qualification"
                            id="fatherQualification"
                            value={formData.fatherQualification}
                            onChange={handleChange}
                            placeholder="Father's Qualification"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="motherQualification"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Qualification"
                            value={formData.motherQualification}
                            onChange={handleChange}
                            placeholder="Mother's Qualification"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            id="fatherProfession"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Profession"
                            value={formData.fatherProfession}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            {profession.map((prof) => (
                              <option key={prof.id} value={prof.id}>
                                {prof.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            id="motherProfession"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Profession"
                            value={formData.motherProfession}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            {profession.map((prof) => (
                              <option key={prof.id} value={prof.id}>
                                {prof.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            id="fatherDepartment"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Department"
                            value={formData.fatherDepartment}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            {department.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            id="motherDepartment"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Department"
                            value={formData.motherDepartment}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            {department.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            id="fatherDesignation"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Designation"
                            value={formData.fatherDesignation}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            {designation.map((design) => (
                              <option key={design.id} value={design.id}>
                                {design.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormSelect
                            id="motherDesignation"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Designation"
                            value={formData.motherDesignation}
                            onChange={handleChange}
                          >
                            <option value="">Choose...</option>
                            {designation.map((design) => (
                              <option key={design.id} value={design.id}>
                                {design.name}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="fatherOrgName"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Org Name"
                            value={formData.fatherOrgName}
                            onChange={handleChange}
                            placeholder="Father's Org Name"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="fatherOrgName"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Org Name"
                            value={formData.fatherOrgName}
                            onChange={handleChange}
                            placeholder="Mother's Org Name"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="fatherOfficeAddress"
                            floatingClassName="mb-3"
                            floatingLabel="Father's Office Address"
                            value={formData.fatherOfficeAddress}
                            onChange={handleChange}
                            placeholder="Father's Office Address"
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            id="motherOfficeAddress"
                            floatingClassName="mb-3"
                            floatingLabel="Mother's Office Address"
                            value={formData.motherOfficeAddress}
                            onChange={handleChange}
                            placeholder="Mother's Office Address"
                          />
                        </CCol>
                        <CCol xs={12}>
                          <CButton color="primary" onClick={handleSubmit}>
                            Save
                          </CButton>
                        </CCol>
                      </CForm>
                    </CCol>
                    <CCol md={3} className="d-flex flex-column align-items-end">
                      <CCol
                        md={12}
                        className="d-flex justify-content-center align-items-start mb-3"
                      >
                        <div className="text-center">
                          <label htmlFor="father-photo-upload" style={{ cursor: 'pointer' }}>
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
                              {formData.fatherPhotoPreview ? (
                                <img
                                  src={formData.fatherPhotoPreview}
                                  alt="Father"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{ color: '#6c757d' }}>Father's Photo</span>
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
                        </div>
                      </CCol>
                      <CCol md={12} className="d-flex justify-content-center align-items-start">
                        <div className="text-center">
                          <label htmlFor="mother-photo-upload" style={{ cursor: 'pointer' }}>
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
                              {formData.motherPhotoPreview ? (
                                <img
                                  src={formData.motherPhotoPreview}
                                  alt="Mother"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <span style={{ color: '#6c757d' }}>Mother's Photo</span>
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
                        </div>
                      </CCol>
                    </CCol>
                  </CRow>
                </CTabPane>

                {/* Contact Details Tab */}
                <CTabPane visible={activeTab === 'contact'}>
                  <CForm className="row g-3">
                    <CCol md={6}>
                      <CFormInput
                        type="text"
                        id="address"
                        floatingClassName="mb-3"
                        floatingLabel="Address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Address"
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="zip"
                        floatingClassName="mb-3"
                        floatingLabel="Pin Code"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder="Pin Code"
                      />
                    </CCol>
                    <CCol xs={12}>
                      <CButton color="primary" onClick={handleSubmit}>
                        Save
                      </CButton>
                    </CCol>
                  </CForm>
                </CTabPane>

                <CTabPane visible={activeTab === 'medical'}>
                  <CForm className="row g-3">
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        id="height"
                        floatingClassName="mb-3"
                        floatingLabel="Height"
                        placeholder="Height"
                        value={formData.height}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        id="weight"
                        floatingClassName="mb-3"
                        floatingLabel="Weight"
                        placeholder="Weight"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="visionLeft"
                        floatingClassName="mb-3"
                        floatingLabel="Vision Left"
                        placeholder="Vision Left"
                        value={formData.visionLeft}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="visionRight"
                        floatingClassName="mb-3"
                        floatingLabel="Vision Right"
                        placeholder="Vision Right"
                        value={formData.visionRight}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="teeth"
                        floatingClassName="mb-3"
                        floatingLabel="Teeth"
                        placeholder="Teeth"
                        value={formData.teeth}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="oralHygiene"
                        floatingClassName="mb-3"
                        floatingLabel="Oral Hygiene"
                        placeholder="Oral Hygiene"
                        value={formData.oralHygiene}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="medicalHistory"
                        floatingClassName="mb-3"
                        floatingLabel="Medical History"
                        placeholder="Medical History"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="doctorName"
                        floatingClassName="mb-3"
                        floatingLabel="Doctor Name"
                        placeholder="Doctor Name"
                        value={formData.doctorName}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="string"
                        id="clinicMobileNumber"
                        floatingClassName="mb-3"
                        floatingLabel="Clinic MobileNumber"
                        placeholder="Clinic MobileNumbe"
                        value={formData.clinicMobileNumber}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol xs={12}>
                      <CButton color="primary" onClick={handleSubmit}>
                        Save
                      </CButton>
                    </CCol>
                  </CForm>
                </CTabPane>

                {/* Other Details Tab */}
                <CTabPane visible={activeTab === 'other'}>
                  <CForm className="row g-3">
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="game"
                        floatingClassName="mb-3"
                        floatingLabel="Game"
                        placeholder="Game"
                        value={formData.game}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="personalIdMark"
                        floatingClassName="mb-3"
                        floatingLabel="Personal ID Mark"
                        placeholder="Personal ID Mark"
                        value={formData.personalIdMark}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="previousSchool"
                        floatingClassName="mb-3"
                        floatingLabel="Previous School"
                        placeholder="Previous School"
                        value={formData.previousSchool}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="boardAdmNoIX_X"
                        floatingClassName="mb-3"
                        floatingLabel="BoardAdmNo IX_X"
                        placeholder="BoardAdmNo IX_X"
                        value={formData.boardAdmNoIX_X}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="boardAdmNoXI_XII"
                        floatingClassName="mb-3"
                        floatingLabel="BoardAdmNo XI_XII"
                        placeholder="BoardAdmNo XI_XII"
                        value={formData.boardAdmNoXI_XII}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="classAdmitted"
                        floatingClassName="mb-3"
                        floatingLabel="Class Admitted"
                        placeholder="Class Admitted"
                        value={formData.classAdmitted}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        id="remarks"
                        floatingClassName="mb-3"
                        floatingLabel="Remarks"
                        placeholder="Remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol xs={12}>
                      <CButton color="primary" onClick={handleSubmit}>
                        Save
                      </CButton>
                    </CCol>
                  </CForm>
                </CTabPane>
              </CTabContent>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditStudent
