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
    studentDetails: {
      fatherName: '',
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
      fetchStudentDetails()
      fetchData()
    }
  }, [studentId])

  const fetchStudentDetails = async () => {
    try {
      const response = await studentManagementApi.getById(`${studentId}`)
      setFormData(response)
    } catch (error) {
      console.error('Error fetching student details:', error)
    }
  }

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
    e.preventDefault()
    try {
      console.log(formData)
      const response = await studentManagementApi.create('add', formData)
      console.log('Student added successfully:', response)
      if (response && response.id) {
        setStudentId(response.id) // Store student ID
        setShowDetailsCard(true) // Show additional details card
      }
      alert('Student added successfully!')
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student!')
    }
  }

  return (
    <CRow>
      {/* First Card: Edit Student */}
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
                <CCol md={10}>
                  <CFormLabel htmlFor="name">Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="dateOfBirth">Date of Birth</CFormLabel>
                  <CFormInput
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="className">Class</CFormLabel>
                  <CFormSelect
                    id="className"
                    value={formData.className?.id || ''}
                    onChange={handleChange}
                  >
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
                  <CFormSelect
                    id="section"
                    value={formData.section?.id || ''}
                    onChange={handleChange}
                  >
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
                  <CFormSelect
                    id="bloodGroup"
                    value={formData.bloodGroup || ''}
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
                  <CFormLabel htmlFor="gender">Gender</CFormLabel>
                  <CFormSelect id="gender" value={formData.gender || ''} onChange={handleChange}>
                    <option value="">Choose...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="hostel">Hostel</CFormLabel>
                  <CFormSelect
                    id="hostel"
                    value={formData.hostel?.id || ''}
                    onChange={handleChange}
                  >
                    <option value="">Choose...</option>
                    {hostel.map((hst) => (
                      <option key={hst.id} value={hst.id}>
                        {hst.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="group">Group</CFormLabel>
                  <CFormSelect id="group" value={formData.group?.id || ''} onChange={handleChange}>
                    <option value="">Choose...</option>
                    {group.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="city">City</CFormLabel>
                  <CFormSelect id="city" value={formData.city?.id || ''} onChange={handleChange}>
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
                  <CFormSelect id="state" value={formData.state?.id || ''} onChange={handleChange}>
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
                    value={formData.caste || ''}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="religion">Religion</CFormLabel>
                  <CFormInput
                    type="text"
                    id="religion"
                    value={formData.religion || ''}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="aadhaarNumber">Aadhaar Number</CFormLabel>
                  <CFormInput
                    type="text"
                    id="aadhaarNumber"
                    value={formData.aadhaarNumber || ''}
                    onChange={handleChange}
                  />
                </CCol>
                <div className="mb-3">
                  <CFormLabel htmlFor="formFile">Student Photo</CFormLabel>
                  <CFormInput type="file" id="formFile" />
                </div>
                <CCol xs={12}>
                  <CButton color="primary" type="submit">
                    Update Student
                  </CButton>
                </CCol>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {/* Second Card: Additional Information Tabs */}
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>Additional Information</strong>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      /!* Tab Navigation *!/*/}
      {/*      <CNav variant="tabs" role="tablist">*/}
      {/*        <CNavItem>*/}
      {/*          <CNavLink*/}
      {/*            active={activeTab === 'parents'}*/}
      {/*            onClick={() => setActiveTab('parents')}*/}
      {/*            style={{ cursor: 'pointer' }}*/}
      {/*          >*/}
      {/*            Parents Information*/}
      {/*          </CNavLink>*/}
      {/*        </CNavItem>*/}
      {/*        <CNavItem>*/}
      {/*          <CNavLink*/}
      {/*            active={activeTab === 'contact'}*/}
      {/*            onClick={() => setActiveTab('contact')}*/}
      {/*            style={{ cursor: 'pointer' }}*/}
      {/*          >*/}
      {/*            Contact and Certificate*/}
      {/*          </CNavLink>*/}
      {/*        </CNavItem>*/}
      {/*        <CNavItem>*/}
      {/*          <CNavLink*/}
      {/*            active={activeTab === 'siblings'}*/}
      {/*            onClick={() => setActiveTab('siblings')}*/}
      {/*            style={{ cursor: 'pointer' }}*/}
      {/*          >*/}
      {/*            Siblings*/}
      {/*          </CNavLink>*/}
      {/*        </CNavItem>*/}
      {/*        <CNavItem>*/}
      {/*          <CNavLink*/}
      {/*            active={activeTab === 'other'}*/}
      {/*            onClick={() => setActiveTab('other')}*/}
      {/*            style={{ cursor: 'pointer' }}*/}
      {/*          >*/}
      {/*            Other Details*/}
      {/*          </CNavLink>*/}
      {/*        </CNavItem>*/}
      {/*        <CNavItem>*/}
      {/*          <CNavLink*/}
      {/*            active={activeTab === 'medical'}*/}
      {/*            onClick={() => setActiveTab('medical')}*/}
      {/*            style={{ cursor: 'pointer' }}*/}
      {/*          >*/}
      {/*            Medical*/}
      {/*          </CNavLink>*/}
      {/*        </CNavItem>*/}
      {/*        <CNavItem>*/}
      {/*          <CNavLink*/}
      {/*            active={activeTab === 'enquiry'}*/}
      {/*            onClick={() => setActiveTab('enquiry')}*/}
      {/*            style={{ cursor: 'pointer' }}*/}
      {/*          >*/}
      {/*            Enquiry Status*/}
      {/*          </CNavLink>*/}
      {/*        </CNavItem>*/}
      {/*      </CNav>*/}

      {/*      /!* Tab Content *!/*/}
      {/*      <CTabContent className="mt-3">*/}
      {/*        /!* Parents Tab *!/*/}
      {/*        <CTabPane visible={activeTab === 'parents'}>*/}
      {/*          <CForm className="row g-3">*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fatherName">Father's Name</CFormLabel>*/}
      {/*              <CFormInput type="text" id="fatherName" placeholder="Enter Father's Name" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherName">Mother's Name</CFormLabel>*/}
      {/*              <CFormInput type="text" id="motherName" placeholder="Enter Mother's Name" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fatherContact">Father's Contact</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="fatherContact"*/}
      {/*                placeholder="Enter Father's Contact"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherContact">Mother's Contact</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="motherContact"*/}
      {/*                placeholder="Enter Mother's Contact"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fatherContact">Father's Annual Income</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="fatherContact"*/}
      {/*                placeholder="Enter Father's Annual Income"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherContact">Mother's Annual Income</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="motherContact"*/}
      {/*                placeholder="Enter Mother's Annual Income"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherContact">Mother's Email Id</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="motherContact"*/}
      {/*                placeholder="Enter Mother's Email Id"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fqualification">Father's Qualification</CFormLabel>*/}
      {/*              <CFormSelect id="fqualification">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="mqualification">Mother's Qualification</CFormLabel>*/}
      {/*              <CFormSelect id="mqualification">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fprofession">Father's Profession</CFormLabel>*/}
      {/*              <CFormSelect id="fprofession">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="mprofession">Mother's Profession</CFormLabel>*/}
      {/*              <CFormSelect id="mprofession">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fdepartment">Father's Department</CFormLabel>*/}
      {/*              <CFormSelect id="fdepartment">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="mdepartment">Mother's Department</CFormLabel>*/}
      {/*              <CFormSelect id="mdepartment">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fdesignation">Father's Designation</CFormLabel>*/}
      {/*              <CFormSelect id="fdesignation">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="mdesignation">Mother's Designation</CFormLabel>*/}
      {/*              <CFormSelect id="mdesignation">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="forgname">Father's Org Name</CFormLabel>*/}
      {/*              <CFormInput type="text" id="forgname" placeholder="Enter Father's Org Name" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherContact">Mother's Org Name</CFormLabel>*/}
      {/*              <CFormInput type="text" id="morgname" placeholder="Enter Mother's Org Name" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fatherContact">Father's Office Address</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="fofficeaddress"*/}
      {/*                placeholder="Enter Father's Office Address"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherContact">Mother's Office Address</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="mofficeaddress"*/}
      {/*                placeholder="Enter Mother's Office Address"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Father's Photo</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Mother's Photo</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <CCol xs={12}>*/}
      {/*              <CButton color="primary" type="submit">*/}
      {/*                Save*/}
      {/*              </CButton>*/}
      {/*            </CCol>*/}
      {/*          </CForm>*/}
      {/*        </CTabPane>*/}

      {/*        /!* Contact and Certificate Tab *!/*/}
      {/*        <CTabPane visible={activeTab === 'contact'}>*/}
      {/*          <CForm className="row g-3">*/}
      {/*            <CCol xs={8}>*/}
      {/*              <CFormLabel htmlFor="address">Address</CFormLabel>*/}
      {/*              <CFormInput id="address" placeholder="Enter Address" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={4}>*/}
      {/*              <CFormLabel htmlFor="zip">Pin code</CFormLabel>*/}
      {/*              <CFormInput id="zip" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="nationality">Nationality</CFormLabel>*/}
      {/*              <CFormSelect id="nationality">*/}
      {/*                <option>Indian</option>*/}
      {/*                <option>Nepalese</option>*/}
      {/*                <option>Bhutanese</option>*/}
      {/*                <option>Other</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="city">City</CFormLabel>*/}
      {/*              <CFormSelect id="city">*/}
      {/*                <option>Choose...</option>*/}
      {/*                <option>...</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="state">State</CFormLabel>*/}
      {/*              <CFormSelect id="state">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="phone">Phone Number</CFormLabel>*/}
      {/*              <CFormInput type="phone" id="phone" />*/}
      {/*            </CCol>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Registration Form</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Admission Form</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">DOB Certificate</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Report Card</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">TC Certificate</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Character Certificate</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Medical Certificate</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Sports Certificate</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Migration Certificate</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Father Proof Id</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Mother Proof Id</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <div className="mb-3">*/}
      {/*              <CFormLabel htmlFor="formFile">Address Proof</CFormLabel>*/}
      {/*              <CFormInput type="file" id="formFile" />*/}
      {/*            </div>*/}
      {/*            <CCol xs={12}>*/}
      {/*              <CButton color="primary" type="submit">*/}
      {/*                Save*/}
      {/*              </CButton>*/}
      {/*            </CCol>*/}
      {/*          </CForm>*/}
      {/*        </CTabPane>*/}

      {/*        /!* Siblings Tab *!/*/}
      {/*        <CTabPane visible={activeTab === 'siblings'}>*/}
      {/*          <CForm className="row g-3">*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="registrationNumber">Search Registration Number</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="registrationNumber"*/}
      {/*                placeholder="Enter Registration Number"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol xs={12}>*/}
      {/*              <CButton color="primary" type="submit">*/}
      {/*                Search*/}
      {/*              </CButton>*/}
      {/*            </CCol>*/}
      {/*          </CForm>*/}
      {/*        </CTabPane>*/}

      {/*        /!* Other Tab *!/*/}
      {/*        <CTabPane visible={activeTab === 'other'}>*/}
      {/*          <CForm className="row g-3">*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="city">Bus Route</CFormLabel>*/}
      {/*              <CFormSelect id="city">*/}
      {/*                <option>Choose...</option>*/}
      {/*                <option>...</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="state">Bus Stop</CFormLabel>*/}
      {/*              <CFormSelect id="state">*/}
      {/*                <option>Punjab</option>*/}
      {/*                <option>Uttar Pradesh</option>*/}
      {/*                <option>Delhi</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="game">Game</CFormLabel>*/}
      {/*              <CFormSelect id="game">*/}
      {/*                <option>Choose</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="fatherName">Personal ID Mark</CFormLabel>*/}
      {/*              <CFormInput type="text" id="fatherName" placeholder="Enter Personal ID Mark" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherName">Previous School</CFormLabel>*/}
      {/*              <CFormInput type="text" id="motherName" placeholder="Enter Previous School" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherName">Board Adm. No. IX-X</CFormLabel>*/}
      {/*              <CFormInput type="text" id="motherName" placeholder="Enter Previous School" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherName">Board Adm. No. XI-XII</CFormLabel>*/}
      {/*              <CFormInput type="text" id="motherName" placeholder="Enter Previous School" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherName">Board Roll No. IX-X</CFormLabel>*/}
      {/*              <CFormInput type="text" id="motherName" placeholder="Enter Previous School" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="motherName">Board Roll. No. XI-XII</CFormLabel>*/}
      {/*              <CFormInput type="text" id="motherName" placeholder="Enter Previous School" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="admitted">Class Admitted</CFormLabel>*/}
      {/*              <CFormInput type="text" id="admitted" placeholder="Enter Class Admitted" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={12}>*/}
      {/*              <CFormLabel htmlFor="fatherContact">Remarks</CFormLabel>*/}
      {/*              <CFormTextarea type="textArea" id="remarks" placeholder="Enter Remarks" />*/}
      {/*            </CCol>*/}
      {/*            <CCol xs={12}>*/}
      {/*              <CButton color="primary" type="submit">*/}
      {/*                Save*/}
      {/*              </CButton>*/}
      {/*            </CCol>*/}
      {/*          </CForm>*/}
      {/*        </CTabPane>*/}

      {/*        /!* Medical Tab *!/*/}
      {/*        <CTabPane visible={activeTab === 'medical'}>*/}
      {/*          <CForm className="row g-3">*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="height">Height(CM)</CFormLabel>*/}
      {/*              <CFormInput type="text" id="height" placeholder="Enter Height(CM)" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="weight">Weight(KG)</CFormLabel>*/}
      {/*              <CFormInput type="text" id="weight" placeholder="Enter Weight(KG)" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="visionl">Vision(L)</CFormLabel>*/}
      {/*              <CFormInput type="text" id="visionl" placeholder="Enter Vision(L)" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="visionr">Vision(R)</CFormLabel>*/}
      {/*              <CFormInput type="text" id="visionr" placeholder="Enter Vision(R)" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="teeth">Teeth</CFormLabel>*/}
      {/*              <CFormInput type="text" id="teeth" placeholder="Enter Teeth" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={2}>*/}
      {/*              <CFormLabel htmlFor="fatherName">Oral Hygiene</CFormLabel>*/}
      {/*              <CFormInput type="text" id="fatherName" placeholder="Enter Oral Hygiene" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="medicalHistory">Medical History</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="medicalHistory"*/}
      {/*                placeholder="Enter Medical History"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="medicalHistory">Doctor Name</CFormLabel>*/}
      {/*              <CFormInput type="text" id="doctorName" placeholder="Enter Doctor name" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="clinicAddress">Clinic Address</CFormLabel>*/}
      {/*              <CFormInput type="text" id="clinicAddress" placeholder="Enter Clinic Address" />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="clinicPhoneNumber">Clinic Phone Number</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="clinicPhoneNumber"*/}
      {/*                placeholder="Enter Clinic Phone Number"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="clinicMobileNumber">Clinic Mobile Number</CFormLabel>*/}
      {/*              <CFormInput*/}
      {/*                type="text"*/}
      {/*                id="clinicMobileNumber"*/}
      {/*                placeholder="Enter Clinic Mobile Number"*/}
      {/*              />*/}
      {/*            </CCol>*/}
      {/*            <CCol xs={12}>*/}
      {/*              <CButton color="primary" type="submit">*/}
      {/*                Save*/}
      {/*              </CButton>*/}
      {/*            </CCol>*/}
      {/*          </CForm>*/}
      {/*        </CTabPane>*/}

      {/*        /!* Enquiry Tab *!/*/}
      {/*        <CTabPane visible={activeTab === 'enquiry'}>*/}
      {/*          <CForm className="row g-3">*/}
      {/*            <CCol md={6}>*/}
      {/*              <CFormLabel htmlFor="registrationStatus">Registration Status</CFormLabel>*/}
      {/*              <CFormSelect id="registrationStatus">*/}
      {/*                <option>Yes</option>*/}
      {/*                <option>No</option>*/}
      {/*                <option>Deferred</option>*/}
      {/*              </CFormSelect>*/}
      {/*            </CCol>*/}
      {/*            <CCol md={12}>*/}
      {/*              <CFormLabel htmlFor="remarks">Remarks</CFormLabel>*/}
      {/*              <CFormTextarea type="text" id="remarks" placeholder="Enter Remarks" />*/}
      {/*            </CCol>*/}
      {/*            <CCol xs={12}>*/}
      {/*              <CButton color="primary" type="submit">*/}
      {/*                Save*/}
      {/*              </CButton>*/}
      {/*            </CCol>*/}
      {/*          </CForm>*/}
      {/*        </CTabPane>*/}
      {/*      </CTabContent>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
    </CRow>
  )
}

export default EditStudent
