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
  const [department, setDepartment] = useState([])
  const [designation, setDesignation] = useState([])
  const [profession, setProfession] = useState([])
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
      console.log(response)
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
      const matchedClass = hostel.find((cls) => cls.name === formData.hostel)
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

  useEffect(() => {
    if (
      formData?.studentDetails &&
      profession.length > 0 &&
      department.length > 0 &&
      designation.length > 0
    ) {
      const updatedStudentDetails = { ...formData.studentDetails }

      // Profession
      const matchedFatherProfession = profession.find(
        (p) => p.name === formData.studentDetails.fatherProfession,
      )
      const matchedMotherProfession = profession.find(
        (p) => p.name === formData.studentDetails.motherProfession,
      )

      if (matchedFatherProfession) {
        updatedStudentDetails.fatherProfession = matchedFatherProfession.id.toString()
      }
      if (matchedMotherProfession) {
        updatedStudentDetails.motherProfession = matchedMotherProfession.id.toString()
      }

      // Designation
      const matchedFatherDesignation = designation.find(
        (d) => d.name === formData.studentDetails.fatherDesignation,
      )
      const matchedMotherDesignation = designation.find(
        (d) => d.name === formData.studentDetails.motherDesignation,
      )

      if (matchedFatherDesignation) {
        updatedStudentDetails.fatherDesignation = matchedFatherDesignation.id.toString()
      }
      if (matchedMotherDesignation) {
        updatedStudentDetails.motherDesignation = matchedMotherDesignation.id.toString()
      }

      // Department
      const matchedFatherDepartment = department.find(
        (d) => d.name === formData.studentDetails.fatherDepartment,
      )
      const matchedMotherDepartment = department.find(
        (d) => d.name === formData.studentDetails.motherDepartment,
      )

      if (matchedFatherDepartment) {
        updatedStudentDetails.fatherDepartment = matchedFatherDepartment.id.toString()
      }
      if (matchedMotherDepartment) {
        updatedStudentDetails.motherDepartment = matchedMotherDepartment.id.toString()
      }

      setFormData((prev) => ({
        ...prev,
        studentDetails: updatedStudentDetails,
      }))
    }
  }, [profession, designation, department, formData.state])

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
      setHostel(hostelData)
      setGroup(groupData)
      setCities(cityData)
      setStates(stateData)
      setProfession(professionData)
      setDepartment(departmentData)
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
    const keys = id.split('.')

    setFormData((prev) => {
      const updated = { ...prev }
      let obj = updated

      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] } // create shallow copy
        obj = obj[keys[i]]
      }

      const finalKey = keys[keys.length - 1]

      const shouldBeNumber = [
        'className',
        'section',
        'city',
        'state',
        'hostel',
        'group',
        'studentDetails.fatherProfession',
        'studentDetails.motherProfession',
        'studentDetails.fatherDepartment',
        'studentDetails.motherDepartment',
        'studentDetails.motherDesignation',
        'studentDetails.fatherDesignation',
      ].includes(finalKey)

      obj[finalKey] = shouldBeNumber ? Number(value) || null : value

      return updated
    })
  }

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
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

  const handleUpdate = async () => {
    try {
      console.log(formData.studentDetails)
      const response = await studentManagementApi.update(
        `update/details`,
        studentId,
        formData.studentDetails,
      )
      alert('Student details updated successfully!')
      console.log('Student details updated successfully:', response)
    } catch (error) {
      console.error('Error updating student details:', error)
      alert('Failed to update student details!')
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
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Additional Information</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs">
              {['parents', 'contact', 'other', 'medical', 'enquiry'].map((tab) => (
                <CNavItem key={tab}>
                  <CNavLink active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </CNavLink>
                </CNavItem>
              ))}
            </CNav>

            <CTabContent className="mt-3">
              {/* Parent Details Tab */}
              <CTabPane visible={activeTab === 'parents'}>
                <CForm className="row g-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherContact">Father's Contact</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.fatherContact"
                      value={formData.studentDetails.fatherContact}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherContact">Mother's Contact</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.motherContact"
                      value={formData.studentDetails.motherContact}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherAnnualIncome">Father's Annual Income</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.fatherAnnualIncome"
                      onChange={handleChange}
                      value={formData.studentDetails.fatherAnnualIncome}
                      placeholder="Enter Father's Annual Income"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherAnnualIncome">Mother's Annual Income</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.motherAnnualIncome"
                      onChange={handleChange}
                      value={formData.studentDetails.motherAnnualIncome}
                      placeholder="Enter Mother's Annual Income"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherEmail">Mother's Email Id</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.motherEmail"
                      value={formData.studentDetails.motherEmail}
                      placeholder="Enter Mother's Email Id"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherQualification">Father's Qualification</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.fatherQualification"
                      value={formData.studentDetails.fatherQualification}
                      placeholder="Father's Qualification"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherQualification">Mother's Qualification</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.motherQualification"
                      value={formData.studentDetails.motherQualification}
                      placeholder="Mother's Qualification"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherProfession">Father's Profession</CFormLabel>
                    <CFormSelect id="studentDetails.fatherProfession">
                      <option
                        value={formData.studentDetails.fatherProfession}
                        onChange={handleChange}
                      >
                        Choose...
                      </option>
                      {profession.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherProfession">Mother's Profession</CFormLabel>
                    <CFormSelect id="studentDetails.motherProfession">
                      <option
                        value={formData.studentDetails.motherProfession}
                        onChange={handleChange}
                      >
                        Choose...
                      </option>
                      {profession.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fdepartment">Father's Department</CFormLabel>
                    <CFormSelect id="studentDetails.fatherDepartment">
                      <option
                        value={formData.studentDetails.fatherDepartment}
                        onChange={handleChange}
                      >
                        Choose...
                      </option>
                      {department.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="mdepartment">Mother's Department</CFormLabel>
                    <CFormSelect id="studentDetails.motherDepartment">
                      <option
                        value={formData.studentDetails.motherDepartment}
                        onChange={handleChange}
                      >
                        Choose...
                      </option>
                      {department.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherDesignation">Father's Designation</CFormLabel>
                    <CFormSelect id="studentDetails.fatherDesignation">
                      <option
                        value={formData.studentDetails.fatherDesignation}
                        onChange={handleChange}
                      >
                        Choose...
                      </option>
                      {designation.map((design) => (
                        <option key={design.id} value={design.id}>
                          {design.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherDesignation">Mother's Designation</CFormLabel>
                    <CFormSelect id="studentDetails.motherDesignation">
                      <option
                        value={formData.studentDetails.motherDesignation}
                        onChange={handleChange}
                      >
                        Choose...
                      </option>
                      {designation.map((design) => (
                        <option key={design.id} value={design.id}>
                          {design.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherOrgName">Father's Org Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="fatherOrgName"
                      value={formData.studentDetails.fatherOrgName}
                      onChange={handleChange}
                      placeholder="Enter Father's Org Name"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherOrgName">Mother's Org Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="fatherOrgName"
                      onChange={handleChange}
                      value={formData.studentDetails.fatherOrgName}
                      placeholder="Enter Mother's Org Name"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherOfficeAddress">Father's Office Address</CFormLabel>
                    <CFormInput
                      type="text"
                      id="fatherOfficeAddress"
                      onChange={handleChange}
                      value={formData.studentDetails.fatherOfficeAddress}
                      placeholder="Enter Father's Office Address"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherOfficeAddress">Mother's Office Address</CFormLabel>
                    <CFormInput
                      type="text"
                      id="motherOfficeAddress"
                      onChange={handleChange}
                      value={formData.studentDetails.motherOfficeAddress}
                      placeholder="Enter Mother's Office Address"
                    />
                  </CCol>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Father's Photo</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Mother's Photo</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <CCol xs={12}>
                    <CButton color="primary" onClick={handleUpdate}>
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>

              {/* Contact Details Tab */}
              <CTabPane visible={activeTab === 'contact'}>
                <CForm className="row g-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="address">Address</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.address"
                      value={formData.studentDetails.address}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="zip">Zip Code</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.zip"
                      value={formData.studentDetails.zip}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CButton color="primary" onClick={handleUpdate}>
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>

              {/* Medical Details Tab */}
              <CTabPane visible={activeTab === 'medical'}>
                <CForm className="row g-3">
                  <CCol md={2}>
                    <CFormLabel htmlFor="height">Height</CFormLabel>
                    <CFormInput
                      type="number"
                      id="studentDetails.height"
                      value={formData.studentDetails.height}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel htmlFor="weight">Weight</CFormLabel>
                    <CFormInput
                      type="number"
                      id="studentDetails.weight"
                      value={formData.studentDetails.weight}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CButton color="primary" onClick={handleUpdate}>
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>

              {/* Other Details Tab */}
              <CTabPane visible={activeTab === 'other'}>
                <CForm className="row g-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="game">Game</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.game"
                      value={formData.studentDetails.game}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="personalIdMark">Personal ID Mark</CFormLabel>
                    <CFormInput
                      type="text"
                      id="studentDetails.personalIdMark"
                      value={formData.studentDetails.personalIdMark}
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CButton color="primary" onClick={handleUpdate}>
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditStudent
