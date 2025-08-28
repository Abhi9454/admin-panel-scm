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
  CInputGroup,
  CInputGroupText,
  CSpinner,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import reportManagementApi from '../../api/reportManagementApi'

const AllStudentReport = () => {
  const [selectedReport, setSelectedReport] = useState('locality-registration')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [localities, setLocalities] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classData, localityData, sessionData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('locality/all'),
        apiService.getAll('session/all'),
      ])
      console.log('Fetched data:', { classData, localityData, sessionData })

      // Transform API data to format needed for CFormSelect
      const formattedClasses = [
        { value: '', label: 'Select Class' },
        ...classData.map((cls) => ({
          value: cls.id.toString(),
          label: cls.name,
        })),
      ]

      const formattedLocalities = [
        { value: '', label: 'Select Locality' },
        ...localityData.map((locality) => ({
          value: locality.id.toString(),
          label: locality.name,
        })),
      ]

      const formattedSessions = [
        { value: '', label: 'Select Session' },
        ...sessionData.map((session) => ({
          value: session.id.toString(),
          label: session.name || `${session.startYear}-${session.endYear}`,
        })),
      ]

      setClasses(formattedClasses)
      setLocalities(formattedLocalities)
      setSessions(formattedSessions)

      // Set default session to current/latest if available
      if (sessionData.length > 0) {
        const currentSession = sessionData.find((s) => s.current) || sessionData[0]
        setSelectedSession(currentSession.id.toString())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value)
    // Clear selections when report type changes
    setSelectedLocality('')
    setSelectedClass('')
    setDateFrom('')
    setDateTo('')
  }

  const handleGenerateReport = async () => {
    console.log('Generate PDF report:', selectedReport)

    // Validations
    if (!selectedSession) {
      alert('Please select a session')
      return
    }

    if (selectedReport.includes('locality') && !selectedLocality) {
      alert('Please select a locality')
      return
    }

    if (selectedReport.includes('class') && !selectedClass) {
      alert('Please select a class')
      return
    }

    if (selectedReport.includes('date') && (!dateFrom || !dateTo)) {
      alert('Please select both from and to dates')
      return
    }

    // Prepare request body for POST request
    let requestBody = {
      sessionId: parseInt(selectedSession),
      schoolId: 1, // You might want to get this from context/props
      localityId: null,
      classId: null,
      fromDate: null,
      toDate: null,
      reportType: selectedReport,
    }

    if (selectedReport.includes('locality')) {
      requestBody.localityId = parseInt(selectedLocality)
    } else if (selectedReport.includes('class')) {
      requestBody.classId = parseInt(selectedClass)
    } else if (selectedReport.includes('date')) {
      requestBody.fromDate = dateFrom
      requestBody.toDate = dateTo
    }

    setLoading(true)
    try {
      console.log('Request body:', requestBody)

      const response = await reportManagementApi.downloadPdf('student/allStudent', requestBody)
      console.log('Response:', response)

      if (response.data instanceof Blob) {
        // UPDATED: Open PDF in new window instead of downloading
        const pdfBlob = response.data
        const pdfUrl = window.URL.createObjectURL(pdfBlob)

        // Option 1: Open in new window/tab
        const newWindow = window.open(pdfUrl, '_blank', 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800')

        // Handle popup blocker case
        if (!newWindow) {
          alert('Pop-up blocked! Please allow pop-ups for this site and try again.')
          // Fallback: Create download link
          createDownloadFallback(pdfBlob, getReportFilename(selectedReport))
        } else {
          // Set window title
          newWindow.document.title = getReportFilename(selectedReport)

          // Clean up URL after window is loaded
          newWindow.addEventListener('load', () => {
            // Keep the URL active until user closes the window
            // We'll clean it up when the component unmounts or after some time
            setTimeout(() => {
              window.URL.revokeObjectURL(pdfUrl)
            }, 10000) // Clean up after 10 seconds
          })
        }
      } else {
        throw new Error('Response data is not a valid Blob')
      }
    } catch (error) {
      console.error('Error generating PDF report:', error)
      alert(`Failed to generate PDF report: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  // Fallback function for download when popup is blocked
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
    switch (reportType) {
      case 'enquiry-status':
        return `enquiry_status_report_${timestamp}.pdf`
      case 'registration-status':
        return `registration_status_report_${timestamp}.pdf`
      case 'date-enquiry':
        return `date_wise_enquiry_${timestamp}.pdf`
      case 'date-registration':
        return `date_wise_registration_${timestamp}.pdf`
      case 'class-enquiry':
        return `class_wise_enquiry_${timestamp}.pdf`
      case 'class-registration':
        return `class_wise_registration_${timestamp}.pdf`
      case 'locality-enquiry':
        return `locality_wise_enquiry_${timestamp}.pdf`
      case 'locality-registration':
        return `locality_wise_registration_${timestamp}.pdf`
      case 'locality-admission':
        return `locality_wise_admission_${timestamp}.pdf`
      default:
        return `student_report_${timestamp}.pdf`
    }
  }

  const renderSelectionPanel = () => {
    if (selectedReport.includes('locality')) {
      return (
        <CCard className="mt-3 mb-3">
          <CCardHeader>
            <strong>Select Locality</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner color="primary" />
            ) : (
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Locality</CInputGroupText>
                    <CFormSelect
                      value={selectedLocality}
                      onChange={(e) => setSelectedLocality(e.target.value)}
                      options={localities}
                      disabled={loading}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      )
    } else if (selectedReport.includes('class')) {
      return (
        <CCard className="mt-3 mb-3">
          <CCardHeader>
            <strong>Select Class</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner color="primary" />
            ) : (
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Class</CInputGroupText>
                    <CFormSelect
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      options={classes}
                      disabled={loading}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      )
    } else if (selectedReport.includes('date')) {
      return (
        <CCard className="mt-3 mb-3">
          <CCardHeader>
            <strong>Select Date Range</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>From Date</CInputGroupText>
                  <CFormInput
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>To Date</CInputGroupText>
                  <CFormInput
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    } else {
      return null
    }
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Student Information PDF Report</strong>
      </CCardHeader>
      <CCardBody>
        <CForm>
          {/* Session Selection */}
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Select Session</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CInputGroup>
                    <CInputGroupText>Session</CInputGroupText>
                    <CFormSelect
                      value={selectedSession}
                      onChange={(e) => setSelectedSession(e.target.value)}
                      options={sessions}
                      disabled={loading}
                    />
                  </CInputGroup>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {/* Report Type Selection */}
          <CCard className="mb-3">
            <CCardHeader>
              <strong>Select Report Type</strong>
            </CCardHeader>
            <CCardBody>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="dateWiseEnquiry"
                    value="date-enquiry"
                    label="Date Wise Enquiry Detail"
                    checked={selectedReport === 'date-enquiry'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="dateWiseRegistration"
                    value="date-registration"
                    label="Date Wise Registration Detail"
                    checked={selectedReport === 'date-registration'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="classWiseEnquiry"
                    value="class-enquiry"
                    label="Class Wise Enquiry Detail"
                    checked={selectedReport === 'class-enquiry'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="classWiseRegistration"
                    value="class-registration"
                    label="Class Wise Registration Detail"
                    checked={selectedReport === 'class-registration'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="localityWiseEnquiry"
                    value="locality-enquiry"
                    label="Locality Wise Student Enquiry"
                    checked={selectedReport === 'locality-enquiry'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="localityWiseRegistration"
                    value="locality-registration"
                    label="Locality Wise Student Registration"
                    checked={selectedReport === 'locality-registration'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="localityWiseAdmission"
                    value="locality-admission"
                    label="Locality Wise Student Admission"
                    checked={selectedReport === 'locality-admission'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>

          {renderSelectionPanel()}

          <CRow className="mt-4 justify-content-center">
            <CCol xs="auto">
              <CButton
                color="primary"
                onClick={handleGenerateReport}
                disabled={loading || !selectedSession}
              >
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Generating PDF...
                  </>
                ) : (
                  'View PDF Report'
                )}
              </CButton>
            </CCol>
            <CCol xs="auto">
              <CButton color="secondary">Cancel</CButton>
            </CCol>
          </CRow>
        </CForm>
      </CCardBody>
    </CCard>
  )
}

export default AllStudentReport
