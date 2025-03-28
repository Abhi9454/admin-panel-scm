import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
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
  const [cities, setCities] = useState([])
  const [password, setPassword] = useState('')
  const [states, setStates] = useState([])
  const [showDetailsCard, setShowDetailsCard] = useState(false)
  const [studentId, setStudentId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    className: null,
    section: null,
    city: null,
    state: null,
    caste: '',
    bloodGroup: '',
    religion: '',
    aadhaarNumber: '',
    locality: '',
    hostel: null,
    group: null,
    studentDetails: {},
  })

  useEffect(() => {
    fetchData()
  }, [])

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log(formData)
      const response = await studentManagementApi.create('add', formData)
      console.log('Student added successfully:', response)
      if (response && response.id) {
        setStudentId(response.id) // Store student ID
        setPassword(response.password)
        setShowDetailsCard(true) // Show additional details card
      }
      alert('Student added successfully!')
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
              <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={10}>
                  <CFormLabel htmlFor="name">Name</CFormLabel>
                  <CFormInput type="text" id="name" value={formData.name} onChange={handleChange} />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="dateOfBirth">Date of Birth</CFormLabel>
                  <CFormInput
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="className">Class</CFormLabel>
                  <CFormSelect id="className" value={formData.className} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="section">Section</CFormLabel>
                  <CFormSelect id="section" value={formData.section} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
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
                <CCol md={4}>
                  <CFormLabel htmlFor="gender">Gender</CFormLabel>
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
                <CCol md={4}>
                  <CFormLabel htmlFor="group">Group</CFormLabel>
                  <CFormSelect id="group" value={formData.group} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {group.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
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
                <CCol md={6}>
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
                  <CFormLabel htmlFor="religion">Religion</CFormLabel>
                  <CFormInput
                    type="text"
                    id="religion"
                    value={formData.religion}
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
                <CCol xs={12}>
                  <CButton color="primary" type="submit">
                    Add Student
                  </CButton>
                  <p className="text-body-secondary small mt-2">
                    {password !== '' ? `Password for User Application is: ${password}` : ''}
                  </p>
                </CCol>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {showDetailsCard && <AdditionalStudentDetails studentId={studentId} />}
    </CRow>
  )
}

export default AddStudent
