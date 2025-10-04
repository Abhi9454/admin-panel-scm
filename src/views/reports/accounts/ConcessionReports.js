import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormCheck,
  CRow,
  CCol,
  CFormSelect,
  CButton,
  CFormInput,
  CSpinner,
  CAlert,
  CContainer,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../../api/schoolManagementApi'
import reportManagementApi from '../../../api/reportManagementApi'

const ConcessionReports = () => {
  const [selectedSubReport, setSelectedSubReport] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [concessionAsOn, setConcessionAsOn] = useState('')

  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [error, setError] = useState('')

  const subReports = [
    { value: 'concessional-student-register', label: 'Concessional Student Register' },
    {
      value: 'concessional-student-register-summary',
      label: 'Concessional Student Register Summary',
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [sessionData, classData, sectionData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('class/all'),
        apiService.getAll('section/all'),
      ])

      const formattedSessions = sessionData.map((session) => ({
        value: session.id.toString(),
        label: session.name,
      }))

      const formattedClasses = classData.map((cls) => ({
        value: cls.id.toString(),
        label: cls.name,
      }))

      const formattedSections = sectionData.map((section) => ({
        value: section.id.toString(),
        label: section.name,
      }))

      setSessions(formattedSessions)
      setClasses(formattedClasses)
      setSections(formattedSections)

      if (sessionData.length > 0) {
        const currentSession = sessionData.find((s) => s.current) || sessionData[0]
        setSelectedSession(currentSession.id.toString())
      }

      const today = new Date().toISOString().split('T')[0]
      setConcessionAsOn(today)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load initial data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const resetFormFields = () => {
    setSelectedSubReport('')
    setSelectedClass('')
    setSelectedSection('')
    const today = new Date().toISOString().split('T')[0]
    setConcessionAsOn(today)
    setError('')
  }

  const handleSubReportChange = (event) => {
    const value = event.target.value
    setSelectedSubReport(value)
    setError('')
  }

  const validateForm = () => {
    if (!selectedSession) {
      return 'Please select a session'
    }

    if (!selectedSubReport) {
      return 'Please select a report type'
    }

    if (['concessional-student-register'].includes(selectedSubReport) && !selectedClass) {
      return 'Please select a class'
    }

    return null
  }

  const buildRequestBody = () => {
    return {
      sessionId: parseInt(selectedSession),
      schoolId: 1,
      reportType: selectedSubReport,
      classId: selectedClass ? parseInt(selectedClass) : null,
      sectionId: selectedSection ? parseInt(selectedSection) : null,
      concessionAsOn: concessionAsOn || null,
      status: 'ACTIVE',
    }
  }

  const handleGenerateReport = async () => {
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const requestBody = buildRequestBody()

    setLoading(true)
    try {
      console.log('Report generation request:', requestBody)

      const response = await reportManagementApi.downloadPdf('reports/fees/generate', requestBody)

      if (response.data instanceof Blob) {
        const pdfBlob = response.data
        const pdfUrl = window.URL.createObjectURL(pdfBlob)

        const newWindow = window.open(
          pdfUrl,
          '_blank',
          'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800',
        )

        if (!newWindow) {
          setError('Pop-up blocked! Please allow pop-ups for this site.')
          createDownloadFallback(pdfBlob, getReportFilename(selectedSubReport))
        } else {
          newWindow.document.title = getReportFilename(selectedSubReport)
          setTimeout(() => {
            window.URL.revokeObjectURL(pdfUrl)
          }, 10000)
        }
      } else {
        throw new Error('Invalid response format: Expected PDF blob')
      }
    } catch (error) {
      console.error('Error generating PDF report:', error)

      let errorMessage = 'Failed to generate PDF report'

      if (error.response?.status === 400) {
        const errorData = error.response.data
        if (typeof errorData === 'string') {
          errorMessage = `Validation Error: ${errorData}`
        } else {
          errorMessage = 'Invalid request parameters. Please check your inputs.'
        }
      } else if (error.response?.status === 404) {
        errorMessage = 'No data found for the selected criteria'
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while generating the report'
      } else if (error.message) {
        errorMessage = `${errorMessage}: ${error.message}`
      }

      setError(`${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const createDownloadFallback = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)
  }

  const getReportFilename = (reportType) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
    return `${reportType.replace(/-/g, '_')}_${timestamp}.pdf`
  }

  return (
    <CContainer fluid className="px-2">
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError('')} className="mb-2">
          {error}
        </CAlert>
      )}

      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <CRow className="align-items-center">
            <CCol md={10}>
              <h6 className="mb-0 fw-bold text-primary">Concession Reports</h6>
            </CCol>
            <CCol md={2} className="text-end">
              <CButtonGroup size="sm">
                <CButton color="outline-secondary" onClick={resetFormFields}>
                  Reset
                </CButton>
              </CButtonGroup>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="py-2">
          <CForm>
            <CRow className="g-2 mb-2">
              <CCol md={3}>
                <CFormSelect
                  size="sm"
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  disabled={loading}
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map((session) => (
                    <option key={session.value} value={session.value}>
                      {session.label}
                    </option>
                  ))}
                </CFormSelect>
                <label className="small text-muted">Session *</label>
              </CCol>

              <CCol md={3}>
                <CFormSelect
                  size="sm"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </CFormSelect>
                <label className="small text-muted">Class</label>
              </CCol>

              <CCol md={3}>
                <CFormSelect
                  size="sm"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Section</option>
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </CFormSelect>
                <label className="small text-muted">Section</label>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  size="sm"
                  type="date"
                  value={concessionAsOn}
                  onChange={(e) => setConcessionAsOn(e.target.value)}
                />
                <label className="small text-muted">Concession As On</label>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <h6 className="mb-0 fw-bold">Select Report Type *</h6>
        </CCardHeader>
        <CCardBody className="py-2">
          <CRow>
            {subReports.map((subReport) => (
              <CCol md={6} key={subReport.value} className="mb-1">
                <CFormCheck
                  type="radio"
                  name="subReport"
                  id={subReport.value}
                  value={subReport.value}
                  label={<span className="small">{subReport.label}</span>}
                  checked={selectedSubReport === subReport.value}
                  onChange={handleSubReportChange}
                />
              </CCol>
            ))}
          </CRow>
        </CCardBody>
      </CCard>

      <div className="text-center mb-2">
        <CButton
          color="primary"
          onClick={handleGenerateReport}
          disabled={loading || !selectedSession || !selectedSubReport}
          size="sm"
        >
          {loading ? (
            <>
              <CSpinner size="sm" className="me-1" /> Generating...
            </>
          ) : (
            'Generate PDF Report'
          )}
        </CButton>
      </div>
    </CContainer>
  )
}

export default ConcessionReports
