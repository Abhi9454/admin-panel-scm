import React, { useState, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { cilLockLocked, cilUser } from '@coreui/icons'
import apiService from '../../../api/auth/loginApi' // Ensure this handles API calls
import { AuthContext } from 'src/context/AuthContext' // AuthContext to manage token

const Login = () => {
  const [userId, setUserId] = useState('')
  const [password, setUserPassword] = useState('')
  const [error, setError] = useState('')
  const location = useLocation()
  const schoolDetails = location.state?.schoolDetails
  const navigate = useNavigate()
  const { setAuthToken } = useContext(AuthContext) // Context for auth state

  const handleLogin = async () => {
    if (!userId.trim() || !password.trim()) {
      setError('Please enter a valid User ID and Password.')
      return
    }

    setError('')

    try {
      const response = await apiService.login({
        username: userId,
        password: password,
        schoolCode: schoolDetails.schoolCode, // Ensure this is passed
      })

      if (typeof response === 'string') {
        setError('Invalid username or password. Please try again.')
      } else {
        const { token } = response
        localStorage.setItem('authToken', token)
        setAuthToken(token) // Save in Context API
        navigate('/dashboard', { state: { schoolDetails } })
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.')
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
                    <h1>{schoolDetails?.name}</h1>
                    <p className="text-body-secondary">Welcome, enter details to proceed...</p>
                    {error && <p className="text-danger">{error}</p>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="User ID"
                        autoComplete="userid"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setUserPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="success" className="px-4" onClick={handleLogin}>
                          Login
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
