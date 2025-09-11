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
import apiService from '../../../api/schoolManagementApi'
import reportManagementApi from '../../../api/reportManagementApi'
import accountManagementApi from '../../../api/accountManagementApi'

const AllAccountReport = () => {
  const [selectedReport, setSelectedReport] = useState('balance-head-l1')
  const [selectedSession, setSelectedSession] = useState('')
  const [selectedAccountType, setSelectedAccountType] = useState('')
  const [selectedPaymentType, setSelectedPaymentType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState([])
  const [accountTypes, setAccountTypes] = useState([])
  const [paymentTypes, setPaymentTypes] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sessionData] = await Promise.all([apiService.getAll('session/all')])

      // Format sessions
      const formattedSessions = [
        { value: '', label: 'Select Session' },
        ...sessionData.map((session) => ({
          value: session.id.toString(),
          label: session.name,
        })),
      ]

      // Account types (from BalanceSheetHeadMasterEntity.accountType)
      const formattedAccountTypes = [
        { value: '', label: 'Select Account Type' },
        { value: 'ASSET', label: 'Asset' },
        { value: 'LIABILITY', label: 'Liability' },
        { value: 'INCOME', label: 'Income' },
        { value: 'EXPENSE', label: 'Expense' },
        { value: 'EQUITY', label: 'Equity' },
      ]

      // Payment types (for TransactionEntity.paymentType)
      const formattedPaymentTypes = [
        { value: '', label: 'Select Payment Type' },
        { value: '1', label: 'Cash' },
        { value: '2', label: 'Bank' },
        { value: '3', label: 'Online' },
        { value: '4', label: 'Cheque' },
      ]

      setSessions(formattedSessions)
      setAccountTypes(formattedAccountTypes)
      setPaymentTypes(formattedPaymentTypes)

      // Set default session
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
    setSelectedAccountType('')
    setSelectedPaymentType('')
    setDateFrom('')
    setDateTo('')
  }

  const handleGenerateReport = async () => {
    console.log('Generate PDF account report:', selectedReport)

    // Validations
    if (!selectedSession) {
      alert('Please select a session')
      return
    }

    if (selectedReport.includes('account-type') && !selectedAccountType) {
      alert('Please select an account type')
      return
    }

    if (selectedReport.includes('payment-type') && !selectedPaymentType) {
      alert('Please select a payment type')
      return
    }

    if (selectedReport.includes('date') && (!dateFrom || !dateTo)) {
      alert('Please select both from and to dates')
      return
    }

    // Prepare request body
    let requestBody = {
      sessionId: parseInt(selectedSession),
      schoolId: 1, // You might want to get this from context/props
      accountType: null,
      balanceHeadId: null,
      paymentType: null,
      fromDate: null,
      toDate: null,
      reportType: selectedReport,
    }

    if (selectedReport.includes('account-type')) {
      requestBody.accountType = selectedAccountType
    }
    if (selectedReport.includes('payment-type')) {
      requestBody.paymentType = parseInt(selectedPaymentType)
    }
    if (selectedReport.includes('date')) {
      requestBody.fromDate = dateFrom
      requestBody.toDate = dateTo
    }

    setLoading(true)
    try {
      console.log('Request body:', requestBody)

      const response = await reportManagementApi.downloadPdf('account/allAccount', requestBody)
      console.log('Response:', response)

      if (response.data instanceof Blob) {
        const pdfBlob = response.data
        const pdfUrl = window.URL.createObjectURL(pdfBlob)

        const newWindow = window.open(
          pdfUrl,
          '_blank',
          'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=800',
        )

        if (!newWindow) {
          alert('Pop-up blocked! Please allow pop-ups for this site and try again.')
          createDownloadFallback(pdfBlob, getReportFilename(selectedReport))
        } else {
          newWindow.document.title = getReportFilename(selectedReport)
          setTimeout(() => {
            window.URL.revokeObjectURL(pdfUrl)
          }, 10000)
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
      case 'balance-head-l1':
        return `balance_head_l1_report_${timestamp}.pdf`
      case 'ledger-head-l2':
        return `ledger_head_l2_report_${timestamp}.pdf`
      case 'opening-balance':
        return `opening_balance_report_${timestamp}.pdf`
      case 'journal-entry':
        return `journal_entry_report_${timestamp}.pdf`
      case 'bank-transaction':
        return `bank_transaction_report_${timestamp}.pdf`
      case 'cash-transaction':
        return `cash_transaction_report_${timestamp}.pdf`
      case 'date-transaction':
        return `date_wise_transaction_${timestamp}.pdf`
      case 'account-type-balance':
        return `account_type_balance_${timestamp}.pdf`
      default:
        return `account_report_${timestamp}.pdf`
    }
  }

  const renderSelectionPanel = () => {
    if (selectedReport.includes('account-type')) {
      return (
        <CCard className="mt-3 mb-3">
          <CCardHeader>
            <strong>Select Account Type</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>Account Type</CInputGroupText>
                  <CFormSelect
                    value={selectedAccountType}
                    onChange={(e) => setSelectedAccountType(e.target.value)}
                    options={accountTypes}
                    disabled={loading}
                  />
                </CInputGroup>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )
    } else if (selectedReport.includes('payment-type')) {
      return (
        <CCard className="mt-3 mb-3">
          <CCardHeader>
            <strong>Select Payment Type</strong>
          </CCardHeader>
          <CCardBody>
            <CRow className="mb-3">
              <CCol md={4}>
                <CInputGroup>
                  <CInputGroupText>Payment Type</CInputGroupText>
                  <CFormSelect
                    value={selectedPaymentType}
                    onChange={(e) => setSelectedPaymentType(e.target.value)}
                    options={paymentTypes}
                    disabled={loading}
                  />
                </CInputGroup>
              </CCol>
            </CRow>
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
    }
    return null
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Account Information PDF Report</strong>
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
                    id="balanceHeadL1"
                    value="balance-head-l1"
                    label="Balance Head L1 Report"
                    checked={selectedReport === 'balance-head-l1'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="ledgerHeadL2"
                    value="ledger-head-l2"
                    label="Ledger Head L2 Report"
                    checked={selectedReport === 'ledger-head-l2'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="openingBalance"
                    value="opening-balance"
                    label="Opening Balance Report"
                    checked={selectedReport === 'opening-balance'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="journalEntry"
                    value="journal-entry"
                    label="Journal Entry Report"
                    checked={selectedReport === 'journal-entry'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="bankTransaction"
                    value="bank-transaction"
                    label="Bank Transaction Report"
                    checked={selectedReport === 'bank-transaction'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="cashTransaction"
                    value="cash-transaction"
                    label="Cash Transaction Report"
                    checked={selectedReport === 'cash-transaction'}
                    onChange={handleReportChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-2">
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="dateTransaction"
                    value="date-transaction"
                    label="Date Wise Transaction Report"
                    checked={selectedReport === 'date-transaction'}
                    onChange={handleReportChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    type="radio"
                    name="reportType"
                    id="accountTypeBalance"
                    value="account-type-balance"
                    label="Account Type Balance Report"
                    checked={selectedReport === 'account-type-balance'}
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

export default AllAccountReport
