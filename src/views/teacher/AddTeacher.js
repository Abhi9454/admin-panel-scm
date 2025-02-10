import React, { useState } from 'react'
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
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

const AddTeacher = () => {
  const [activeTab, setActiveTab] = useState('parents')
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Teacher</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Teacher Details</p>
            <CForm className="row g-3">
              <CCol md={10}>
                <CFormLabel htmlFor="name">Name</CFormLabel>
                <CFormInput type="text" id="name" />
              </CCol>
              <CCol md={2}>
                <img
                  src="https://online.maryville.edu/wp-content/uploads/sites/97/2023/10/nutrition.jpg"
                  alt="..."
                  className="img-thumbnail rounded float-right"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="dob">Date of Birth</CFormLabel>
                <CFormInput type="date" id="dob" />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="caste">Caste</CFormLabel>
                <CFormSelect id="caste">
                  <option>Choose...</option>
                  <option>...</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="religion">Religion</CFormLabel>
                <CFormSelect id="religion">
                  <option>Choose...</option>
                  <option>...</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="locality">Locality</CFormLabel>
                <CFormSelect id="locality">
                  <option>Choose...</option>
                  <option>...</option>
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel htmlFor="gender">Gender</CFormLabel>
                <CFormSelect id="gender">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel htmlFor="bloodGroup">Blood Group</CFormLabel>
                <CFormSelect id="bloodGroup">
                  <option>Choose...</option>
                  <option>...</option>
                </CFormSelect>
              </CCol>
              <div className="mb-3">
                <CFormLabel htmlFor="formFile">Teacher Photo</CFormLabel>
                <CFormInput type="file" id="formFile" />
              </div>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Add Teacher
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Additional Information</strong>
          </CCardHeader>
          <CCardBody>
            {/* Tab Navigation */}
            <CNav variant="tabs" role="tablist">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'parents'}
                  onClick={() => setActiveTab('parents')}
                  style={{ cursor: 'pointer' }}
                >
                  Parents Information
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'contact'}
                  onClick={() => setActiveTab('contact')}
                  style={{ cursor: 'pointer' }}
                >
                  Contact and Certificate
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'other'}
                  onClick={() => setActiveTab('other')}
                  style={{ cursor: 'pointer' }}
                >
                  Other Details
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'medical'}
                  onClick={() => setActiveTab('medical')}
                  style={{ cursor: 'pointer' }}
                >
                  Medical
                </CNavLink>
              </CNavItem>
            </CNav>

            {/* Tab Content */}
            <CTabContent className="mt-3">
              {/* Parents Tab */}
              <CTabPane visible={activeTab === 'parents'}>
                <CForm className="row g-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherName">Father's Name</CFormLabel>
                    <CFormInput type="text" id="fatherName" placeholder="Enter Father's Name" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherName">Mother's Name</CFormLabel>
                    <CFormInput type="text" id="motherName" placeholder="Enter Mother's Name" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherContact">Father's Contact</CFormLabel>
                    <CFormInput
                      type="text"
                      id="fatherContact"
                      placeholder="Enter Father's Contact"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherContact">Mother's Contact</CFormLabel>
                    <CFormInput
                      type="text"
                      id="motherContact"
                      placeholder="Enter Mother's Contact"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherContact">Father's Annual Income</CFormLabel>
                    <CFormInput
                      type="text"
                      id="fatherContact"
                      placeholder="Enter Father's Annual Income"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherContact">Mother's Annual Income</CFormLabel>
                    <CFormInput
                      type="text"
                      id="motherContact"
                      placeholder="Enter Mother's Annual Income"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherContact">Mother's Email Id</CFormLabel>
                    <CFormInput
                      type="text"
                      id="motherContact"
                      placeholder="Enter Mother's Email Id"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fqualification">Father's Qualification</CFormLabel>
                    <CFormSelect id="fqualification">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="mqualification">Mother's Qualification</CFormLabel>
                    <CFormSelect id="mqualification">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fprofession">Father's Profession</CFormLabel>
                    <CFormSelect id="fprofession">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="mprofession">Mother's Profession</CFormLabel>
                    <CFormSelect id="mprofession">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fdepartment">Father's Department</CFormLabel>
                    <CFormSelect id="fdepartment">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="mdepartment">Mother's Department</CFormLabel>
                    <CFormSelect id="mdepartment">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fdesignation">Father's Designation</CFormLabel>
                    <CFormSelect id="fdesignation">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="mdesignation">Mother's Designation</CFormLabel>
                    <CFormSelect id="mdesignation">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="forgname">Father's Org Name</CFormLabel>
                    <CFormInput type="text" id="forgname" placeholder="Enter Father's Org Name" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherContact">Mother's Org Name</CFormLabel>
                    <CFormInput type="text" id="morgname" placeholder="Enter Mother's Org Name" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherContact">Father's Office Address</CFormLabel>
                    <CFormInput
                      type="text"
                      id="fofficeaddress"
                      placeholder="Enter Father's Office Address"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="motherContact">Mother's Office Address</CFormLabel>
                    <CFormInput
                      type="text"
                      id="mofficeaddress"
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
                    <CButton color="primary" type="submit">
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>

              {/* Contact and Certificate Tab */}
              <CTabPane visible={activeTab === 'contact'}>
                <CForm className="row g-3">
                  <CCol xs={8}>
                    <CFormLabel htmlFor="address">Address</CFormLabel>
                    <CFormInput id="address" placeholder="Enter Address" />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="zip">Pin code</CFormLabel>
                    <CFormInput id="zip" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="nationality">Nationality</CFormLabel>
                    <CFormSelect id="nationality">
                      <option>Indian</option>
                      <option>Nepalese</option>
                      <option>Bhutanese</option>
                      <option>Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="city">City</CFormLabel>
                    <CFormSelect id="city">
                      <option>Choose...</option>
                      <option>...</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="state">State</CFormLabel>
                    <CFormSelect id="state">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="phone">Phone Number</CFormLabel>
                    <CFormInput type="phone" id="phone" />
                  </CCol>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">CV/Resume Form</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Experience Certificate</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">DOB Certificate</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Medical Certificate</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Sports Certificate</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Father Proof Id</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Mother Proof Id</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="formFile">Address Proof</CFormLabel>
                    <CFormInput type="file" id="formFile" />
                  </div>
                  <CCol xs={12}>
                    <CButton color="primary" type="submit">
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>

              {/* Other Tab */}
              <CTabPane visible={activeTab === 'other'}>
                <CForm className="row g-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="city">Bus Route</CFormLabel>
                    <CFormSelect id="city">
                      <option>Choose...</option>
                      <option>...</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="state">Bus Stop</CFormLabel>
                    <CFormSelect id="state">
                      <option>Punjab</option>
                      <option>Uttar Pradesh</option>
                      <option>Delhi</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="fatherName">Personal ID Mark</CFormLabel>
                    <CFormInput type="text" id="fatherName" placeholder="Enter Personal ID Mark" />
                  </CCol>
                  <CCol xs={12}>
                    <CButton color="primary" type="submit">
                      Save
                    </CButton>
                  </CCol>
                </CForm>
              </CTabPane>

              {/* Medical Tab */}
              <CTabPane visible={activeTab === 'medical'}>
                <CForm className="row g-3">
                  <CCol md={2}>
                    <CFormLabel htmlFor="height">Height(CM)</CFormLabel>
                    <CFormInput type="text" id="height" placeholder="Enter Height(CM)" />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel htmlFor="weight">Weight(KG)</CFormLabel>
                    <CFormInput type="text" id="weight" placeholder="Enter Weight(KG)" />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel htmlFor="visionl">Vision(L)</CFormLabel>
                    <CFormInput type="text" id="visionl" placeholder="Enter Vision(L)" />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel htmlFor="visionr">Vision(R)</CFormLabel>
                    <CFormInput type="text" id="visionr" placeholder="Enter Vision(R)" />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel htmlFor="teeth">Teeth</CFormLabel>
                    <CFormInput type="text" id="teeth" placeholder="Enter Teeth" />
                  </CCol>
                  <CCol md={2}>
                    <CFormLabel htmlFor="fatherName">Oral Hygiene</CFormLabel>
                    <CFormInput type="text" id="fatherName" placeholder="Enter Oral Hygiene" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="medicalHistory">Medical History</CFormLabel>
                    <CFormInput
                      type="text"
                      id="medicalHistory"
                      placeholder="Enter Medical History"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="medicalHistory">Doctor Name</CFormLabel>
                    <CFormInput type="text" id="doctorName" placeholder="Enter Doctor name" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="clinicAddress">Clinic Address</CFormLabel>
                    <CFormInput type="text" id="clinicAddress" placeholder="Enter Clinic Address" />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="clinicPhoneNumber">Clinic Phone Number</CFormLabel>
                    <CFormInput
                      type="text"
                      id="clinicPhoneNumber"
                      placeholder="Enter Clinic Phone Number"
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel htmlFor="clinicMobileNumber">Clinic Mobile Number</CFormLabel>
                    <CFormInput
                      type="text"
                      id="clinicMobileNumber"
                      placeholder="Enter Clinic Mobile Number"
                    />
                  </CCol>
                  <CCol xs={12}>
                    <CButton color="primary" type="submit">
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

export default AddTeacher
