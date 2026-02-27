import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBank } from '@coreui/icons'

const Initialise = () => {
  const [schoolCode, setSchoolCode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!schoolCode.trim()) {
      setError('Please enter a school code.')
      return
    }
    navigate('/login', { state: { schoolCode: schoolCode.trim() } })
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>School Code</h1>
                    <p className="text-body-secondary">Enter School Code to Proceed</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilBank} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="School Code"
                        autoComplete="school"
                        value={schoolCode}
                        onChange={(e) => setSchoolCode(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Proceed
                        </CButton>
                      </CCol>
                    </CRow>
                    {error && <p className="error-message mt-2 text-danger">{error}</p>}
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>String Automation LTD.</h2>
                    <p>
                      Before you proceed, please make sure you are using the correct school code and
                      keep your User ID and password handy. Do not share them with anyone.
                    </p>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Initialise
