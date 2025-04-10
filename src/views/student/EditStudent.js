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
} from '@coreui/react'
import { useLocation } from 'react-router-dom'
import studentManagementApi from 'src/api/studentManagementApi'
import apiService from 'src/api/schoolManagementApi'
import AdditionalStudentDetails from 'src/views/student/AdditionalStudentDetails'

const EditStudent = () => {
  const location = useLocation()
  const studentId = location.state?.studentId || null
  // State to track the active tab in the second card
  const [activeTab, setActiveTab] = useState('parents')
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
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
    section: '',
    caste: '',
    locality: '',
    bloodGroup: '',
    religion: '',
    aadhaarNumber: '',
    hostel: '',
    group: '',
    city: '',
    state: '',
    studentDetails: {
      motherName: '',
      fatherContact: '',
      motherContact: '',
      fatherAnnualIncome: '',
      motherAnnualIncome: '',
      fatherEmail: '',
      motherEmail: '',
      fatherQualification: '',
      motherQualification: '',
      fatherProfession: '',
      motherProfession: '',
      fatherDepartment: '',
      motherDepartment: '',
      fatherDesignation: '',
      motherDesignation: '',
      fatherOrgName: '',
      motherOrgName: '',
      fatherOfficeAddress: '',
      motherOfficeAddress: '',
      address: '',
      zip: '',
      nationality: 'Indian',
      city: '',
      state: '',
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
    },
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
      setFormData(response)
    } catch (error) {
      console.error('Error fetching student details:', error)
    }
  }

  useEffect(() => {
    if (formData.className && classes.length > 0) {
      const matchedClass = classes.find((cls) => cls.name === formData.className.name)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          className: matchedClass.id.toString(),
        }))
      }
    }
  }, [classes, formData.className])

  useEffect(() => {
    if (formData.section && sections.length > 0) {
      const matchedClass = sections.find((cls) => cls.name === formData.section.name)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          section: matchedClass.id.toString(),
        }))
      }
    }
  }, [sections, formData.section])

  useEffect(() => {
    if (formData.hostel && hostel.length > 0) {
      const matchedClass = hostel.find((cls) => cls.name === <formData className="hostel"></formData>)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          hostel: matchedClass.id.toString(),
        }))
      }
    }
  }, [hostel, formData.hostel])

  useEffect(() => {
    if (formData.group && group.length > 0) {
      const matchedClass = group.find((cls) => cls.name === formData.group)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          group: matchedClass.id.toString(),
        }))
      }
    }
  }, [group, formData.group])

  useEffect(() => {
    if (formData.city && cities.length > 0) {
      const matchedClass = cities.find((cls) => cls.name === formData.city.name)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          city: matchedClass.id.toString(),
        }))
      }
    }
  }, [cities, formData.city])

  useEffect(() => {
    if (formData.state && states.length > 0) {
      const matchedClass = states.find((cls) => cls.name === formData.state.name)
      if (matchedClass) {
        setFormData((prev) => ({
          ...prev,
          state: matchedClass.id.toString(),
        }))
      }
    }
  }, [states, formData.state])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classData, sectionData, hostelData, groupData, cityData, stateData] =
        await Promise.all([
          apiService.getAll('class/all'),
          apiService.getAll('section/all'),
          apiService.getAll('hostel/all'),
          apiService.getAll('group/all'),
          apiService.getAll('city/all'),
          apiService.getAll('state/all'),
          apiService.getAll('hostel/all'),
          apiService.getAll('group/all'),
        ])

      setClasses(classData)
      setSections(sectionData)
      setCities(cityData)
      setStates(stateData)
      setHostel(hostelData)
      setGroup(groupData)
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
        id === 'group'
          ? Number(value) || null // Convert to number, handle empty selection as null
          : value,
    }))
  }

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      console.log(formData)
      const response = await studentManagementApi.update('update', studentId, formData)
      console.log('Student updated successfully:', response)
      if (response && response.id) {
      }
      alert('Student updated successfully!')
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
              <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                  <CFormLabel htmlFor="name">Name</CFormLabel>
                  <span style={{ color: 'red' }}>*</span>
                  <CFormInput type="text" id="name" value={formData.name} onChange={handleChange} />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="admissionNumber">Admission Number</CFormLabel>
                  <span style={{ color: 'red' }}>*</span>
                  <CFormInput
                    type="text"
                    id="admissionNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fatherName">Father Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherName">Mother Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="dateOfBirth">Date of Birth</CFormLabel>
                  <CFormInput
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="className">Class</CFormLabel>
                  <span style={{ color: 'red' }}>*</span>
                  <CFormSelect id="className" value={formData.className} onChange={handleChange}>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CFormLabel htmlFor="section">Section</CFormLabel>
                  <span style={{ color: 'red' }}>*</span>
                  <CFormSelect id="section" value={formData.section} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="bloodGroup">Blood Group</CFormLabel>
                  <CFormSelect id="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg, index) => (
                      <option key={index} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="gender">Gender</CFormLabel>
                  <span style={{ color: 'red' }}>*</span>
                  <CFormSelect id="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Choose...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="hostel">Hostel</CFormLabel>
                  <CFormSelect id="hostel" value={formData.hostel} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {hostel.map((hostel) => (
                      <option key={hostel.id} value={hostel.id}>
                        {hostel.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel htmlFor="group">Group</CFormLabel>
                  <span style={{ color: 'red' }}>*</span>
                  <CFormSelect id="group" value={formData.group} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {group.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2}>
                  <CFormLabel htmlFor="religion">Religion</CFormLabel>
                  <CFormInput
                    type="text"
                    id="religion"
                    value={formData.religion}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="city">City</CFormLabel>
                  <CFormSelect id="city" value={formData.city} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="state">State</CFormLabel>
                  <CFormSelect id="state" value={formData.state} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="caste">Caste</CFormLabel>
                  <CFormInput
                    type="text"
                    id="caste"
                    value={formData.caste}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="aadhaarNumber">Aadhaar Number</CFormLabel>
                  <CFormInput
                    type="text"
                    id="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                  />
                </CCol>
                <div className="mb-3">
                  <CFormLabel htmlFor="formFile">Student Photo</CFormLabel>
                  <CFormInput type="file" id="formFile" />
                </div>
                <CCol xs={8}>
                  <CButton color="primary" type="submit">
                    Update Student
                  </CButton>
                </CCol>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {/*{showDetailsCard && <AdditionalStudentDetails studentId={studentId} />}*/}
    </CRow>
  )
}

export default EditStudent
