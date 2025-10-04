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
import receiptManagementApi from '../../../api/receiptManagementApi'

const FeesCollectionReports = () => {
  const [selectedSubReport, setSelectedSubReport] = useState('')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedReceiptHead, setSelectedReceiptHead] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [receivedBy, setReceivedBy] = useState('ALL')
  const [payMode, setPayMode] = useState('ALL')

  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [error, setError] = useState('')

  const subReports = [
    { value: 'fees-collection-combine-detail', label: 'Fees Collection Combine Detail' },
    { value: 'fees-collection-head-wise-detail', label: 'Fees Collection Head Wise Detail' },
    { value: 'general-receipt-head-wise-detail', label: 'General Receipt Head Wise Detail' },
    { value: 'fees-collection-head-wise-summary', label: 'Fees Collection Head Wise Summary' },
    { value: 'fees-collection-detail', label: 'Fees Collection Detail' },
    { value: 'fees-collection-user-wise-detail', label: 'Fees Collection User Wise Detail' },
    { value: 'fees-collection-date-wise-summary', label: 'Fees Collection Date Wise Summary' },
    { value: 'fees-collection-horizontal-detail', label: 'Fees Collection Horizontal Detail' },
    {
      value: 'fees-collection-horizontal-daily-summary',
      label: 'Fees Collection Horizontal Daily Summary',
    },
    { value: 'fees-collection-register', label: 'Fees Collection Register' },
    { value: 'fees-collection-register-summary', label: 'Fees Collection Register Summary' },
    { value: 'print-all-receipts', label: 'Print All Receipts' },
    { value: 'print-all-general-receipts', label: 'Print All General Receipts' },
    { value: 'class-wise-summary', label: 'Class Wise Summary' },
    { value: 'general-receipt-user-wise-detail', label: 'General Receipt User Wise Detail' },
    { value: 'general-receipt-daily-summary', label: 'General Receipt Daily Summary' },
    { value: 'concessional-student-detail', label: 'Concessional Student Detail' },
    { value: 'concessional-student-list', label: 'Concessional Student List' },
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
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0]
      setDateFrom(firstDayOfMonth)
      setDateTo(today)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load initial data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReceiptHeads = async () => {
    try {
      const response = await receiptManagementApi.getAll('receipt-head/all')
      const formattedHeads = response.map((head) => ({
        value: head.id.toString(),
        label: head.headName,
      }))
      setReceiptHeads(formattedHeads)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const resetFormFields = () => {
    setSelectedSubReport('')
    setSelectedClass('')
    setSelectedSection('')
    setSelectedReceiptHead('')
    setReceivedBy('ALL')
    setPayMode('ALL')
    const today = new Date().toISOString().split('T')[0]
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
    setDateFrom(firstDayOfMonth)
    setDateTo(today)
    setError('')
  }

  const handleSubReportChange = (event) => {
    const value = event.target.value
    setSelectedSubReport(value)
    setError('')

    if (value.includes('receipt-head-wise')) {
      fetchReceiptHeads()
    }
  }

  const validateForm = () => {
    if (!selectedSession) {
      return 'Please select a session'
    }

    if (!selectedSubReport) {
      return 'Please select a report type'
    }

    if (!dateFrom || !dateTo) {
      return 'Please select date range'
    }

    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      return 'From date cannot be greater than to date'
    }

    return null
  }

  const requiresReceiptHead = () => {
    return selectedSubReport.includes('receipt-head-wise')
  }

  const buildRequestBody = () => {
    return {
      sessionId: parseInt(selectedSession),
      schoolId: 1,
      reportType: selectedSubReport,
      classId: selectedClass ? parseInt(selectedClass) : null,
      sectionId: selectedSection ? parseInt(selectedSection) : null,
      receiptHeadId: selectedReceiptHead ? parseInt(selectedReceiptHead) : null,
      receiptHeadName: selectedReceiptHead
        ? receiptHeads.find((h) => h.value === selectedReceiptHead)?.label
        : null,
      fromDate: dateFrom || null,
      toDate: dateTo || null,
      receivedBy: receivedBy !== 'ALL' ? receivedBy : null,
      payMode: payMode !== 'ALL' ? payMode : null,
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
              <h6 className="mb-0 fw-bold text-primary">Fees Collection Reports</h6>
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
                <CFormInput
                  size="sm"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <label className="small text-muted">From Date *</label>
              </CCol>

              <CCol md={3}>
                <CFormInput
                  size="sm"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom}
                  max={new Date().toISOString().split('T')[0]}
                />
                <label className="small text-muted">To Date *</label>
              </CCol>

              <CCol md={3}>
                <CFormSelect
                  size="sm"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                >
                  <option value="ALL">ALL</option>
                  <option value="School">School</option>
                  <option value="Bank">Bank</option>
                </CFormSelect>
                <label className="small text-muted">Received By</label>
              </CCol>
            </CRow>

            <CRow className="g-2 mb-2">
              <CCol md={3}>
                <CFormSelect size="sm" value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                  <option value="ALL">ALL</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DD">DD</option>
                  <option value="NEFT">NEFT/RTGS</option>
                  <option value="UPI">UPI</option>
                  <option value="SWIPE">Swipe</option>
                </CFormSelect>
                <label className="small text-muted">Pay Mode</label>
              </CCol>

              {requiresReceiptHead() && (
                <CCol md={4}>
                  <CFormSelect
                    size="sm"
                    value={selectedReceiptHead}
                    onChange={(e) => setSelectedReceiptHead(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Receipt Head</option>
                    {receiptHeads.map((head) => (
                      <option key={head.value} value={head.value}>
                        {head.label}
                      </option>
                    ))}
                  </CFormSelect>
                  <label className="small text-muted">Receipt Head *</label>
                </CCol>
              )}
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="mb-2 shadow-sm">
        <CCardHeader className="py-1">
          <h6 className="mb-0 fw-bold">Select Report Type *</h6>
        </CCardHeader>
        <CCardBody className="py-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <CRow>
            {subReports.map((subReport) => (
              <CCol md={6} lg={4} key={subReport.value} className="mb-1">
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

export default FeesCollectionReports
