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
import getSchoolDetailsFromCode from '../../../api/auth/getSchoolDetailFromCode'
import { eventListeners } from '@popperjs/core'

const Initialise = () => {
  const [schoolCode, setSchoolCode] = useState('')
  const navigate = useNavigate()

  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')

    console.log('auth code ' + schoolCode)

    if (!schoolCode.trim()) return

    const details = await getSchoolDetailsFromCode(schoolCode)

    if (schoolCode === details.schoolcode) {
      console.log('auth code ' + schoolCode)
      navigate('/login', { state: { schoolDetails: details } })
    } else {
      setError('Enter a valid auth Code')
      setSchoolCode(null)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
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
                        <CButton
                          color="primary"
                          className="px-4"
                          onClick={(event) => handleSubmit(event)}
                        >
                          Proceed
                        </CButton>
                      </CCol>
                    </CRow>
                    {error && <p className="error-message mt-2">{error}</p>}
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>String Automation LTD.</h2>
                    <p>
                      Before you proceed, Please make sure you are using right school code and keep your UserId and Password handly.
                      Do not share it with anyone.
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
