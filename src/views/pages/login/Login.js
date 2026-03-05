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
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import loginApi from '../../../api/auth/loginApi'
import { AuthContext } from 'src/context/AuthContext'

const Login = () => {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const location = useLocation()
  const schoolCode = location.state?.schoolCode || ''
  const schoolName = location.state?.schoolName || 'School Login'

  const navigate = useNavigate()
  const { saveSession } = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!userId.trim() || !password.trim()) {
      setError('Please enter a valid User ID and Password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await loginApi.login({
        school_code: schoolCode,
        user_id: userId.trim(),
        password: password,
      })

      saveSession(data)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail
      setError(msg || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
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
                  <CForm onSubmit={handleLogin}>
                    <h1>{schoolName}</h1>
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
                        disabled={loading}
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
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        disabled={loading}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="success"
                          type="submit"
                          className="px-4"
                          disabled={loading}
                        >
                          {loading ? <CSpinner size="sm" className="me-2" /> : null}
                          {loading ? 'Signing in...' : 'Login'}
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
