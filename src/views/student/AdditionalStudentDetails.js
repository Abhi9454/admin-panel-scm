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
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CBadge,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from 'src/api/studentManagementApi'

const AdditionalStudentInfo = ({ studentId, admissionNumber }) => {
  const [department, setDepartment] = useState([])
  const [designation, setDesignation] = useState([])
  const [profession, setProfession] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    studentId: studentId,
    admissionNumber: admissionNumber,
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
          ? Number(value) || null
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

  if (loading) {
    return (
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardBody className="text-center py-4">
            <CSpinner color="primary" size="sm" className="me-2" />
            <span className="text-muted">Loading additional information...</span>
          </CCardBody>
        </CCard>
      </CCol>
    )
  }

  return (
    <CCol xs={12}>
      <CCard className="shadow-sm">
        <CCardHeader className="py-2 px-3">
          <CRow className="align-items-center">
            <CCol md={8}>
              <h6 className="mb-0 fw-bold text-primary">Additional Student Information</h6>
              <small className="text-muted">
                Student ID: {studentId} | Admission: {admissionNumber}
              </small>
            </CCol>
            <CCol md={4} className="text-end">
              <CBadge color="success">Ready for Completion</CBadge>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody className="p-2">
          <CAccordion className="accordion-compact">
            {/* Parents Information */}
            <CAccordionItem itemKey="parents">
              <CAccordionHeader className="py-2">👨‍👩‍👧‍👦 Parents Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    {/* Parent Photos - Compact horizontal layout */}
                    <CCol xs={12} className="mb-3">
                      <CRow className="g-2">
                        <CCol md={2} sm={6} className="text-center">
                          <label htmlFor="father-photo-upload" style={{ cursor: 'pointer' }}>
                            <div
                              style={{
                                width: '80px',
                                height: '80px',
                                border: '2px dashed #ccc',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                margin: '0 auto',
                              }}
                            >
                              {formData.fatherPhotoPreview ? (
                                <img
                                  src={formData.fatherPhotoPreview}
                                  alt="Father"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="text-center">
                                  <div style={{ fontSize: '16px', color: '#6c757d' }}>👨</div>
                                </div>
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
                          <small className="text-muted d-block">Father Photo</small>
                        </CCol>

                        <CCol md={2} sm={6} className="text-center">
                          <label htmlFor="mother-photo-upload" style={{ cursor: 'pointer' }}>
                            <div
                              style={{
                                width: '80px',
                                height: '80px',
                                border: '2px dashed #ccc',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                margin: '0 auto',
                              }}
                            >
                              {formData.motherPhotoPreview ? (
                                <img
                                  src={formData.motherPhotoPreview}
                                  alt="Mother"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="text-center">
                                  <div style={{ fontSize: '16px', color: '#6c757d' }}>👩</div>
                                </div>
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
                          <small className="text-muted d-block">Mother Photo</small>
                        </CCol>
                      </CRow>
                    </CCol>

                    {/* Contact Information */}
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="fatherContact"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Contact"
                        value={formData.fatherContact}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="motherContact"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Contact"
                        value={formData.motherContact}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="email"
                        id="fatherEmail"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Email"
                        value={formData.fatherEmail}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="email"
                        id="motherEmail"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Email"
                        value={formData.motherEmail}
                        onChange={handleChange}
                      />
                    </CCol>

                    {/* Income & Qualification */}
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="fatherAnnualIncome"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Annual Income"
                        value={formData.fatherAnnualIncome}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="motherAnnualIncome"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Annual Income"
                        value={formData.motherAnnualIncome}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="fatherQualification"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Qualification"
                        value={formData.fatherQualification}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="motherQualification"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Qualification"
                        value={formData.motherQualification}
                        onChange={handleChange}
                      />
                    </CCol>

                    {/* Professional Information */}
                    <CCol lg={3} md={6}>
                      <CFormSelect
                        size="sm"
                        id="fatherProfessionId"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Profession"
                        value={formData.fatherProfessionId}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {profession.map((prof) => (
                          <option key={prof.id} value={prof.id}>
                            {prof.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect
                        size="sm"
                        id="motherProfessionId"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Profession"
                        value={formData.motherProfessionId}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {profession.map((prof) => (
                          <option key={prof.id} value={prof.id}>
                            {prof.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect
                        size="sm"
                        id="fatherDepartmentId"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Department"
                        value={formData.fatherDepartmentId}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {department.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect
                        size="sm"
                        id="motherDepartmentId"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Department"
                        value={formData.motherDepartmentId}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {department.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>

                    {/* Designation & Organization */}
                    <CCol lg={3} md={6}>
                      <CFormSelect
                        size="sm"
                        id="fatherDesignationId"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Designation"
                        value={formData.fatherDesignationId}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {designation.map((design) => (
                          <option key={design.id} value={design.id}>
                            {design.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect
                        size="sm"
                        id="motherDesignationId"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Designation"
                        value={formData.motherDesignationId}
                        onChange={handleChange}
                      >
                        <option value="">Choose</option>
                        {designation.map((design) => (
                          <option key={design.id} value={design.id}>
                            {design.name}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="fatherOrgName"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Organization"
                        value={formData.fatherOrgName}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="motherOrgName"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Organization"
                        value={formData.motherOrgName}
                        onChange={handleChange}
                      />
                    </CCol>

                    {/* Office Addresses */}
                    <CCol lg={6} md={12}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="fatherOfficeAddress"
                        floatingClassName="mb-2"
                        floatingLabel="Father's Office Address"
                        value={formData.fatherOfficeAddress}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={6} md={12}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="motherOfficeAddress"
                        floatingClassName="mb-2"
                        floatingLabel="Mother's Office Address"
                        value={formData.motherOfficeAddress}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>

            {/* Contact & Address Information */}
            <CAccordionItem itemKey="contact">
              <CAccordionHeader className="py-2">📍 Contact & Address Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    <CCol lg={6} md={12}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="address"
                        floatingClassName="mb-2"
                        floatingLabel="Home Address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="zip"
                        floatingClassName="mb-2"
                        floatingLabel="Pin Code"
                        value={formData.zip}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="phoneNumber"
                        floatingClassName="mb-2"
                        floatingLabel="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="nationality"
                        floatingClassName="mb-2"
                        floatingLabel="Nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="busRoute"
                        floatingClassName="mb-2"
                        floatingLabel="Bus Route"
                        value={formData.busRoute}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="busStop"
                        floatingClassName="mb-2"
                        floatingLabel="Bus Stop"
                        value={formData.busStop}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>

            {/* Academic & Other Information */}
            <CAccordionItem itemKey="academic">
              <CAccordionHeader className="py-2">🎓 Academic & Other Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="game"
                        floatingClassName="mb-2"
                        floatingLabel="Favorite Game/Sport"
                        value={formData.game}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="personalIdMark"
                        floatingClassName="mb-2"
                        floatingLabel="Personal ID Mark"
                        value={formData.personalIdMark}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="previousSchool"
                        floatingClassName="mb-2"
                        floatingLabel="Previous School"
                        value={formData.previousSchool}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="classAdmitted"
                        floatingClassName="mb-2"
                        floatingLabel="Class Admitted"
                        value={formData.classAdmitted}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="boardAdmNoIX_X"
                        floatingClassName="mb-2"
                        floatingLabel="Board Adm No (IX-X)"
                        value={formData.boardAdmNoIX_X}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="boardAdmNoXI_XII"
                        floatingClassName="mb-2"
                        floatingLabel="Board Adm No (XI-XII)"
                        value={formData.boardAdmNoXI_XII}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="boardRollNoIX_X"
                        floatingClassName="mb-2"
                        floatingLabel="Board Roll No (IX-X)"
                        value={formData.boardRollNoIX_X}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="boardRollNoXI_XII"
                        floatingClassName="mb-2"
                        floatingLabel="Board Roll No (XI-XII)"
                        value={formData.boardRollNoXI_XII}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol xs={12}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="remarks"
                        floatingClassName="mb-2"
                        floatingLabel="Remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>

            {/* Medical Information */}
            <CAccordionItem itemKey="medical">
              <CAccordionHeader className="py-2">🏥 Medical Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="number"
                        id="height"
                        floatingClassName="mb-2"
                        floatingLabel="Height (cm)"
                        value={formData.height}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="number"
                        id="weight"
                        floatingClassName="mb-2"
                        floatingLabel="Weight (kg)"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="visionLeft"
                        floatingClassName="mb-2"
                        floatingLabel="Vision Left Eye"
                        value={formData.visionLeft}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="visionRight"
                        floatingClassName="mb-2"
                        floatingLabel="Vision Right Eye"
                        value={formData.visionRight}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="teeth"
                        floatingClassName="mb-2"
                        floatingLabel="Teeth Condition"
                        value={formData.teeth}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="oralHygiene"
                        floatingClassName="mb-2"
                        floatingLabel="Oral Hygiene"
                        value={formData.oralHygiene}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="doctorName"
                        floatingClassName="mb-2"
                        floatingLabel="Family Doctor"
                        value={formData.doctorName}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="clinicMobileNumber"
                        floatingClassName="mb-2"
                        floatingLabel="Clinic Mobile"
                        value={formData.clinicMobileNumber}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol xs={12}>
                      <CFormInput
                        size="sm"
                        type="text"
                        id="medicalHistory"
                        floatingClassName="mb-2"
                        floatingLabel="Medical History"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>

          {/* Save Button */}
          <div className="border-top pt-3 mt-3">
            <CRow className="align-items-center">
              <CCol md={6}>
                <small className="text-muted">Complete all sections and save the information</small>
              </CCol>
              <CCol md={6} className="text-end">
                <CButton color="primary" onClick={handleSubmit} disabled={loading} className="px-4">
                  {loading ? <CSpinner size="sm" className="me-2" /> : null}
                  Save All Information
                </CButton>
              </CCol>
            </CRow>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  )
}

export default AdditionalStudentInfo
