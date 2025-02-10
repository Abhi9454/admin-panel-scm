import React, { useState } from 'react'
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
} from '@coreui/react'

const cityOptions = ['Amritsar']
const stateOptions = ['Punjab']

const SchoolDetail = () => {
  const [schoolName, setSchoolName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pinCode, setPinCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [principalName, setPrincipalName] = useState('')
  const [establishmentYear, setEstablishmentYear] = useState('')
  const [editing, setEditing] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const schoolData = {
      schoolName,
      address,
      city,
      state,
      pinCode,
      phoneNumber,
      email,
      website,
      principalName,
      establishmentYear,
    }
    console.log(schoolData)
    setEditing(false)
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleClear = () => {
    setSchoolName('')
    setAddress('')
    setCity('')
    setState('')
    setPinCode('')
    setPhoneNumber('')
    setEmail('')
    setWebsite('')
    setPrincipalName('')
    setEstablishmentYear('')
    setEditing(false)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editing ? 'Edit School Details' : 'Add School Details'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3" onSubmit={handleSubmit}>
              <CCol md={6}>
                <CFormLabel>School Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Address</CFormLabel>
                <CFormInput
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>City</CFormLabel>
                <CFormSelect value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Select City</option>
                  {cityOptions.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>State</CFormLabel>
                <CFormSelect value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select State</option>
                  {stateOptions.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Pin Code</CFormLabel>
                <CFormInput
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Phone Number</CFormLabel>
                <CFormInput
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Website</CFormLabel>
                <CFormInput
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Principal Name</CFormLabel>
                <CFormInput
                  type="text"
                  value={principalName}
                  onChange={(e) => setPrincipalName(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Establishment Year</CFormLabel>
                <CFormInput
                  type="text"
                  value={establishmentYear}
                  onChange={(e) => setEstablishmentYear(e.target.value)}
                />
              </CCol>
              <CCol md={12}>
                <CButton color={editing ? 'warning' : 'success'} type="submit">
                  {editing ? 'Update School Details' : 'Add School Details'}
                </CButton>
                {editing && (
                  <CButton color="secondary" className="ms-2" onClick={handleClear}>
                    Clear
                  </CButton>
                )}
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SchoolDetail
