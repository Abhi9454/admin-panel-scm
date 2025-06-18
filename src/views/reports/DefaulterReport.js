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

const DefaulterReport = () => {
  const [selectedReport, setSelectedReport] = useState('locality-registration')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [localities, setLocalities] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classData, localityData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('locality/all'),
      ])
      console.log(classData)

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

      setClasses(formattedClasses)
      setLocalities(formattedLocalities)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value)
  }

  // Updated handlePrint method for POST request
  const handlePrint = async () => {
    console.log('Print report:', selectedReport)

    // Validations
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
      localityId: null,
      classId: null,
    }

    if (selectedReport.includes('locality')) {
      requestBody.localityId = selectedLocality
    } else if (selectedReport.includes('class')) {
      requestBody.classId = selectedClass
    } else if (selectedReport.includes('date')) {
      requestBody.fromDate = dateFrom
      requestBody.toDate = dateTo
    }

    setLoading(true)
    try {
      console.log(requestBody)
      const response = await reportManagementApi.downloadExcel('reports/allStudent', requestBody)
      console.log(response)
      // Important: response.data is already a Blob when responseType is set to 'blob'
      if (response.data instanceof Blob) {
        // Set filename based on report type
        let filename = 'student_report.xlsx'
        if (selectedReport.includes('enquiry')) {
          filename = 'student_enquiry_report.xlsx'
        } else if (selectedReport.includes('registration')) {
          filename = 'student_registration_report.xlsx'
        } else if (selectedReport.includes('admission')) {
          filename = 'student_admission_report.xlsx'
        }

        // Create a download link for the blob
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Clean up
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      } else {
        throw new Error('Response data is not a valid Blob')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
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
        <strong>Student Information</strong>
      </CCardHeader>
      <CCardBody>
        <CForm>
          <CCard className="mb-3">
            <CCardBody>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="enquiryStatusWise"
                    value="enquiry-status"
                    label="Enquiry Status Wise Report"
                    checked={selectedReport === 'enquiry-status'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="registrationStatusWise"
                    value="registration-status"
                    label="Registration Status Wise Report"
                    checked={selectedReport === 'registration-status'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
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
              <CButton color="primary" onClick={handlePrint} disabled={loading}>
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Generating...
                  </>
                ) : (
                  'Print'
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

export default DefaulterReport
