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
  CSpinner,
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
    studentId: studentId,
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
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    console.log(id)
    console.log(value)
    setFormData((prev) => ({
      ...prev,
      [id]:
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
                    <CCol md={12} className="d-flex justify-content-center align-items-start mb-3">
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
              {/* Medical Details Tab */}
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
  )
}

export default AdditionalStudentInfo
