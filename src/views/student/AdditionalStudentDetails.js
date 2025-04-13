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
  CTabContent,
  CTabPane,
  CNav,
  CNavItem,
  CNavLink,
  CFormTextarea,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from 'src/api/studentManagementApi'

const AdditionalStudentInfo = ({ studentId }) => {
  const [department, setDepartment] = useState([])
  const [designation, setDesignation] = useState([])
  const [profession, setProfession] = useState([])
  const [activeTab, setActiveTab] = useState('parents')
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    studentId: studentId, // Store Student ID
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
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [designation, department, profession] = await Promise.all([
        apiService.getAll('designation/all'),
        apiService.getAll('department/all'),
        apiService.getAll('profession/all'),
      ])

      setProfession(profession)
      setDepartment(department)
      setDesignation(designation)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]:
        id === 'department' || id === 'designation' || id === 'profession'
          ? Number(value) || null // Convert to number, handle empty selection as null
          : value,
    }))
  }

  const handleUpdate = async () => {
    console.log(formData)
    try {
      const response = await studentManagementApi.update(`update/details/${studentId}`, formData)
      alert('Student details updated successfully!')
    } catch (error) {
      console.error('Error updating student details:', error)
      alert('Failed to update student details!')
    }
  }

  return (
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
                    id="fatherContact"
                    value={formData.fatherContact}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherContact">Mother's Contact</CFormLabel>
                  <CFormInput
                    type="text"
                    id="motherContact"
                    value={formData.motherContact}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fatherAnnualIncome">Father's Annual Income</CFormLabel>
                  <CFormInput
                    type="text"
                    id="fatherAnnualIncome"
                    value={formData.fatherAnnualIncome}
                    placeholder="Enter Father's Annual Income"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherAnnualIncome">Mother's Annual Income</CFormLabel>
                  <CFormInput
                    type="text"
                    id="motherAnnualIncome"
                    value={formData.motherAnnualIncome}
                    placeholder="Enter Mother's Annual Income"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherEmail">Mother's Email Id</CFormLabel>
                  <CFormInput
                    type="text"
                    id="motherEmail"
                    value={formData.motherEmail}
                    placeholder="Enter Mother's Email Id"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fatherQualification">Father's Qualification</CFormLabel>
                  <CFormInput
                    type="text"
                    id="fatherQualification"
                    value={formData.fatherQualification}
                    placeholder="Father's Qualification"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherQualification">Mother's Qualification</CFormLabel>
                  <CFormInput
                    type="text"
                    id="motherQualification"
                    value={formData.motherQualification}
                    placeholder="Mother's Qualification"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fatherProfession">Father's Profession</CFormLabel>
                  <CFormSelect id="fatherProfession">
                    <option value="">Choose...</option>
                    {profession.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherProfession">Mother's Profession</CFormLabel>
                  <CFormSelect id="motherProfession">
                    <option value="">Choose...</option>
                    {profession.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fdepartment">Father's Department</CFormLabel>
                  <CFormSelect id="fatherDepartment">
                    <option value="">Choose...</option>
                    {department.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="mdepartment">Mother's Department</CFormLabel>
                  <CFormSelect id="motherDepartment">
                    <option value="">Choose...</option>
                    {department.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fatherDesignation">Father's Designation</CFormLabel>
                  <CFormSelect id="fatherDesignation">
                    <option value="">Choose...</option>
                    {designation.map((design) => (
                      <option key={design.id} value={design.id}>
                        {design.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherDesignation">Mother's Designation</CFormLabel>
                  <CFormSelect id="motherDesignation">
                    <option value="">Choose...</option>
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
                    value={formData.fatherOrgName}
                    placeholder="Enter Father's Org Name"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherOrgName">Mother's Org Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="fatherOrgName"
                    value={formData.fatherOrgName}
                    placeholder="Enter Mother's Org Name"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="fatherOfficeAddress">Father's Office Address</CFormLabel>
                  <CFormInput
                    type="text"
                    id="fatherOfficeAddress"
                    value={formData.fatherOfficeAddress}
                    placeholder="Enter Father's Office Address"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="motherOfficeAddress">Mother's Office Address</CFormLabel>
                  <CFormInput
                    type="text"
                    id="motherOfficeAddress"
                    value={formData.motherOfficeAddress}
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
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="zip">Zip Code</CFormLabel>
                  <CFormInput
                    type="text"
                    id="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
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
                    id="height"
                    value={formData.height}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel htmlFor="weight">Weight</CFormLabel>
                  <CFormInput
                    type="number"
                    id="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
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
                    id="game"
                    value={formData.game}
                    onChange={handleInputChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="personalIdMark">Personal ID Mark</CFormLabel>
                  <CFormInput
                    type="text"
                    id="personalIdMark"
                    value={formData.personalIdMark}
                    onChange={handleInputChange}
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
  )
}

export default AdditionalStudentInfo
