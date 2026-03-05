import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormSelect,
  CRow,
  CSpinner,
} from '@coreui/react'
import schoolManagementApi from '../../../api/schoolManagementApi'

const Initialise = () => {
  const [schools, setSchools] = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await schoolManagementApi.getSchoolDetailSession()
        const activeSchools = (data.schools || []).filter((s) => s.is_active)
        setSchools(activeSchools)
        setSessions(data.sessions || [])

        // Pre-select active session
        const active = (data.sessions || []).find((s) => s.is_active)
        if (active) setSelectedSession(String(active.rec_id))
      } catch (err) {
        console.error('Failed to load school/session data:', err)
        setError('Unable to reach the server. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selectedSchool) {
      setFormError('Please select a school.')
      return
    }
    if (!selectedSession) {
      setFormError('Please select a session.')
      return
    }

    const school = schools.find((s) => s.school_code === selectedSchool)
    const session = sessions.find((s) => String(s.rec_id) === selectedSession)

    navigate('/login', {
      state: {
        schoolCode: selectedSchool,
        schoolName: school?.school_name || '',
        sessionId: Number(selectedSession),
        sessionName: session?.session || '',
      },
    })
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <h1>Select School &amp; Session</h1>
                  <p className="text-body-secondary">Choose your school and academic session to proceed</p>

                  {loading ? (
                    <div className="text-center py-4">
                      <CSpinner color="primary" size="sm" className="me-2" />
                      <span className="text-muted">Loading school data...</span>
                    </div>
                  ) : error ? (
                    <p className="text-danger">{error}</p>
                  ) : (
                    <CForm onSubmit={handleSubmit}>
                      {/* School Dropdown */}
                      <CFormSelect
                        className="mb-3"
                        value={selectedSchool}
                        onChange={(e) => {
                          setSelectedSchool(e.target.value)
                          setFormError('')
                        }}
                        aria-label="Select School"
                      >
                        <option value="">— Select School —</option>
                        {schools.map((s) => (
                          <option key={s.school_code} value={s.school_code}>
                            {s.school_name} ({s.school_code})
                          </option>
                        ))}
                      </CFormSelect>

                      {/* Session Dropdown */}
                      <CFormSelect
                        className="mb-3"
                        value={selectedSession}
                        onChange={(e) => {
                          setSelectedSession(e.target.value)
                          setFormError('')
                        }}
                        aria-label="Select Session"
                      >
                        <option value="">— Select Session —</option>
                        {sessions.map((s) => (
                          <option key={s.rec_id} value={String(s.rec_id)}>
                            {s.session}{s.is_active ? ' (Active)' : ''}
                          </option>
                        ))}
                      </CFormSelect>

                      {formError && <p className="text-danger mb-3">{formError}</p>}

                      <CRow>
                        <CCol xs={6}>
                          <CButton type="submit" color="primary" className="px-4">
                            Proceed
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  )}
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>String Automation LTD.</h2>
                    <p>
                      Before you proceed, please make sure you are selecting the correct school and
                      session. Keep your User ID and password handy. Do not share them with anyone.
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
