import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CBadge,
} from '@coreui/react'
import masterApi from '../../api/masterApi'
import studentManagementApi from 'src/api/studentManagementApi'

const AdditionalStudentDetails = ({ adm_no }) => {
  const [professions, setProfessions] = useState([])
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    // Parent contact
    father_cell_no: '',
    mother_cell_no: '',
    father_email: '',
    mother_email: '',
    father_annual_income: '',
    mother_annual_income: '',
    father_qualification: '',
    mother_qualification: '',
    // Parent professional
    father_profession_id: '',
    mother_profession_id: '',
    father_department_id: '',
    mother_department_id: '',
    father_designation_id: '',
    mother_designation_id: '',
    father_org_name: '',
    mother_org_name: '',
    father_office_address: '',
    mother_office_address: '',
    // Parent photos (UI-only preview)
    father_photo: null,
    father_photo_preview: null,
    mother_photo: null,
    mother_photo_preview: null,
    // Address
    address: '',
    pin_code: '',
    nationality: 'Indian',
    phone_no: '',
    bus_route: '',
    bus_stop: '',
    // Academic history
    personal_id_mark: '',
    previous_school: '',
    class_admitted: '',
    board_adm_no_ix_x: '',
    board_adm_no_xi_xii: '',
    board_roll_ix_x: '',
    board_roll_xi_xii: '',
    remarks: '',
    // Medical
    height: '',
    weight: '',
    vision_left: '',
    vision_right: '',
    teeth: '',
    oral_hygiene: '',
    medical_history: '',
    doctor_name: '',
    clinic_mobile: '',
    clinic_phone: '',
    clinic_address: '',
  })

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const fetchDropdowns = async () => {
    setLoading(true)
    try {
      const [profData, deptData, desigData] = await Promise.all([
        masterApi.getAll('parent-professions'),
        masterApi.getAll('parent-departments'),
        masterApi.getAll('parent-designations'),
      ])
      setProfessions(profData.results || [])
      setDepartments(deptData.results || [])
      setDesignations(desigData.results || [])
    } catch (error) {
      console.error('Error fetching dropdowns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    const numericFields = [
      'father_profession_id', 'mother_profession_id',
      'father_department_id', 'mother_department_id',
      'father_designation_id', 'mother_designation_id',
    ]
    setFormData((prev) => ({
      ...prev,
      [id]: numericFields.includes(id) ? (Number(value) || '') : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { father_photo, father_photo_preview, mother_photo, mother_photo_preview, ...rest } =
        formData

      const hasPhotos = father_photo || mother_photo
      let payload

      if (hasPhotos) {
        payload = new FormData()
        Object.entries(rest).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') payload.append(k, v)
        })
        if (father_photo) payload.append('father_photo', father_photo)
        if (mother_photo) payload.append('mother_photo', mother_photo)
      } else {
        payload = Object.fromEntries(
          Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== ''),
        )
      }

      await studentManagementApi.patch(adm_no, payload)
      alert('Student information updated successfully!')
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student information!')
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
              <small className="text-muted">Admission No: {adm_no}</small>
            </CCol>
            <CCol md={4} className="text-end">
              <CBadge color="success">Ready for Completion</CBadge>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody className="p-2">
          <CAccordion className="accordion-compact">

            {/* ── Parents Information ──────────────────────────────────── */}
            <CAccordionItem itemKey="parents">
              <CAccordionHeader className="py-2">👨‍👩‍👧‍👦 Parents Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    {/* Parent Photos */}
                    <CCol xs={12} className="mb-3">
                      <CRow className="g-2">
                        {[
                          { key: 'father', label: 'Father Photo', icon: '👨', idKey: 'father-photo-upload', previewKey: 'father_photo_preview', fileKey: 'father_photo' },
                          { key: 'mother', label: 'Mother Photo', icon: '👩', idKey: 'mother-photo-upload', previewKey: 'mother_photo_preview', fileKey: 'mother_photo' },
                        ].map(({ label, icon, idKey, previewKey, fileKey }) => (
                          <CCol md={2} sm={6} className="text-center" key={idKey}>
                            <label htmlFor={idKey} style={{ cursor: 'pointer' }}>
                              <div style={{ width: '80px', height: '80px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto' }}>
                                {formData[previewKey] ? (
                                  <img src={formData[previewKey]} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <div className="text-center">
                                    <div style={{ fontSize: '16px', color: '#6c757d' }}>{icon}</div>
                                  </div>
                                )}
                              </div>
                            </label>
                            <input
                              type="file"
                              id={idKey}
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onloadend = () =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      [previewKey]: reader.result,
                                      [fileKey]: file,
                                    }))
                                  reader.readAsDataURL(file)
                                }
                              }}
                            />
                            <small className="text-muted d-block">{label}</small>
                          </CCol>
                        ))}
                      </CRow>
                    </CCol>

                    {/* Contact */}
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_cell_no" floatingClassName="mb-2" floatingLabel="Father's Contact" value={formData.father_cell_no} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_cell_no" floatingClassName="mb-2" floatingLabel="Mother's Contact" value={formData.mother_cell_no} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="email" id="father_email" floatingClassName="mb-2" floatingLabel="Father's Email" value={formData.father_email} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="email" id="mother_email" floatingClassName="mb-2" floatingLabel="Mother's Email" value={formData.mother_email} onChange={handleChange} /></CCol>

                    {/* Income & Qualification */}
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_annual_income" floatingClassName="mb-2" floatingLabel="Father's Annual Income" value={formData.father_annual_income} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_annual_income" floatingClassName="mb-2" floatingLabel="Mother's Annual Income" value={formData.mother_annual_income} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_qualification" floatingClassName="mb-2" floatingLabel="Father's Qualification" value={formData.father_qualification} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_qualification" floatingClassName="mb-2" floatingLabel="Mother's Qualification" value={formData.mother_qualification} onChange={handleChange} /></CCol>

                    {/* Professional */}
                    <CCol lg={3} md={6}>
                      <CFormSelect size="sm" id="father_profession_id" floatingClassName="mb-2" floatingLabel="Father's Profession" value={formData.father_profession_id} onChange={handleChange}>
                        <option value="">Choose</option>
                        {professions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect size="sm" id="mother_profession_id" floatingClassName="mb-2" floatingLabel="Mother's Profession" value={formData.mother_profession_id} onChange={handleChange}>
                        <option value="">Choose</option>
                        {professions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect size="sm" id="father_department_id" floatingClassName="mb-2" floatingLabel="Father's Department" value={formData.father_department_id} onChange={handleChange}>
                        <option value="">Choose</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect size="sm" id="mother_department_id" floatingClassName="mb-2" floatingLabel="Mother's Department" value={formData.mother_department_id} onChange={handleChange}>
                        <option value="">Choose</option>
                        {departments.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                      </CFormSelect>
                    </CCol>

                    {/* Designation & Organization */}
                    <CCol lg={3} md={6}>
                      <CFormSelect size="sm" id="father_designation_id" floatingClassName="mb-2" floatingLabel="Father's Designation" value={formData.father_designation_id} onChange={handleChange}>
                        <option value="">Choose</option>
                        {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}>
                      <CFormSelect size="sm" id="mother_designation_id" floatingClassName="mb-2" floatingLabel="Mother's Designation" value={formData.mother_designation_id} onChange={handleChange}>
                        <option value="">Choose</option>
                        {designations.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                      </CFormSelect>
                    </CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="father_org_name" floatingClassName="mb-2" floatingLabel="Father's Organization" value={formData.father_org_name} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="mother_org_name" floatingClassName="mb-2" floatingLabel="Mother's Organization" value={formData.mother_org_name} onChange={handleChange} /></CCol>
                    <CCol lg={6} md={12}><CFormInput size="sm" type="text" id="father_office_address" floatingClassName="mb-2" floatingLabel="Father's Office Address" value={formData.father_office_address} onChange={handleChange} /></CCol>
                    <CCol lg={6} md={12}><CFormInput size="sm" type="text" id="mother_office_address" floatingClassName="mb-2" floatingLabel="Mother's Office Address" value={formData.mother_office_address} onChange={handleChange} /></CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>

            {/* ── Contact & Address ────────────────────────────────────── */}
            <CAccordionItem itemKey="contact">
              <CAccordionHeader className="py-2">📍 Contact & Address Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    <CCol lg={6} md={12}><CFormInput size="sm" type="text" id="address" floatingClassName="mb-2" floatingLabel="Home Address" value={formData.address} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="pin_code" floatingClassName="mb-2" floatingLabel="Pin Code" value={formData.pin_code} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="phone_no" floatingClassName="mb-2" floatingLabel="Phone Number" value={formData.phone_no} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="nationality" floatingClassName="mb-2" floatingLabel="Nationality" value={formData.nationality} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="bus_route" floatingClassName="mb-2" floatingLabel="Bus Route" value={formData.bus_route} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="bus_stop" floatingClassName="mb-2" floatingLabel="Bus Stop" value={formData.bus_stop} onChange={handleChange} /></CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>

            {/* ── Academic & Other ─────────────────────────────────────── */}
            <CAccordionItem itemKey="academic">
              <CAccordionHeader className="py-2">🎓 Academic & Other Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="personal_id_mark" floatingClassName="mb-2" floatingLabel="Personal ID Mark" value={formData.personal_id_mark} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="previous_school" floatingClassName="mb-2" floatingLabel="Previous School" value={formData.previous_school} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="class_admitted" floatingClassName="mb-2" floatingLabel="Class Admitted" value={formData.class_admitted} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_adm_no_ix_x" floatingClassName="mb-2" floatingLabel="Board Adm No (IX-X)" value={formData.board_adm_no_ix_x} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_adm_no_xi_xii" floatingClassName="mb-2" floatingLabel="Board Adm No (XI-XII)" value={formData.board_adm_no_xi_xii} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_roll_ix_x" floatingClassName="mb-2" floatingLabel="Board Roll No (IX-X)" value={formData.board_roll_ix_x} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="board_roll_xi_xii" floatingClassName="mb-2" floatingLabel="Board Roll No (XI-XII)" value={formData.board_roll_xi_xii} onChange={handleChange} /></CCol>
                    <CCol xs={12}><CFormInput size="sm" type="text" id="remarks" floatingClassName="mb-2" floatingLabel="Remarks" value={formData.remarks} onChange={handleChange} /></CCol>
                  </CRow>
                </CForm>
              </CAccordionBody>
            </CAccordionItem>

            {/* ── Medical Information ──────────────────────────────────── */}
            <CAccordionItem itemKey="medical">
              <CAccordionHeader className="py-2">🏥 Medical Information</CAccordionHeader>
              <CAccordionBody className="py-2">
                <CForm>
                  <CRow className="g-2">
                    <CCol lg={3} md={6}><CFormInput size="sm" type="number" id="height" floatingClassName="mb-2" floatingLabel="Height (cm)" value={formData.height} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="number" id="weight" floatingClassName="mb-2" floatingLabel="Weight (kg)" value={formData.weight} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="vision_left" floatingClassName="mb-2" floatingLabel="Vision Left Eye" value={formData.vision_left} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="vision_right" floatingClassName="mb-2" floatingLabel="Vision Right Eye" value={formData.vision_right} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="teeth" floatingClassName="mb-2" floatingLabel="Teeth Condition" value={formData.teeth} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="oral_hygiene" floatingClassName="mb-2" floatingLabel="Oral Hygiene" value={formData.oral_hygiene} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="doctor_name" floatingClassName="mb-2" floatingLabel="Family Doctor" value={formData.doctor_name} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="clinic_mobile" floatingClassName="mb-2" floatingLabel="Clinic Mobile" value={formData.clinic_mobile} onChange={handleChange} /></CCol>
                    <CCol lg={3} md={6}><CFormInput size="sm" type="text" id="clinic_phone" floatingClassName="mb-2" floatingLabel="Clinic Phone" value={formData.clinic_phone} onChange={handleChange} /></CCol>
                    <CCol xs={12}><CFormInput size="sm" type="text" id="medical_history" floatingClassName="mb-2" floatingLabel="Medical History" value={formData.medical_history} onChange={handleChange} /></CCol>
                    <CCol xs={12}><CFormInput size="sm" type="text" id="clinic_address" floatingClassName="mb-2" floatingLabel="Clinic Address" value={formData.clinic_address} onChange={handleChange} /></CCol>
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

export default AdditionalStudentDetails
