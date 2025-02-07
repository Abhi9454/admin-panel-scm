import React, { useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom"
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

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setUserPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();  // Hook to access passed state
  const schoolDetails = location.state?.schoolDetails;
  const navigate = useNavigate();

  const handleEnter = async () => {
    if (!userId.trim() || !password.trim()) {
      setError("Please enter a valid school code.");
      return;
    }

    setError(""); // Clear previous errors

    if(userId === "admin" && password == "123"){
        navigate("/dashboard", { state: { schoolDetails: schoolDetails } });
    }
    else{
        setError("Invalid username or password. Please try again")
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>{schoolDetails.schoolname}</h1>
                    <p className="text-body-secondary">Welcome, Enter details to proceed...</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="UserId" autoComplete="userid"
                      value={userId} 
                      onChange={(e) => setUserId(e.target.value)}/>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        value={password} onChange={(e) => setUserPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="success" className="px-4" onClick={(event) => handleEnter(event)}>
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
