import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import apiService from 'src/api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'

const GeneralReceipt = () => {
  const [payModeList, setPayModeList] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [student, setStudent] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generalReceipts, setGeneralReceipts] = useState([])

  const [formData, setFormData] = useState({
    receiptHead: '',
    sessionId: '',
    studentId: '',
    issueDate: '',
    payModeId: '',
    receiptNumber: '',
    narration: '',
    fees: '',
    fine: '',
    posCharges: '',
    concession: '',
    received: '',
    receiptDate: '',
    referenceNumber: '',
    remarks: '',
  })

  useEffect(() => {
    fetchReceiptHeads()
    fetchPayModes()
    fetchGeneralReceipts()
  }, [])

  const fetchReceiptHeads = async () => {
    try {
      const data = await apiService.getAll('receipt-head/all')
      setReceiptHeads(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const fetchPayModes = async () => {
    try {
      const [sessionData, payModeData] = await Promise.all([
        schoolManagementApi.getAll('session/all'),
        schoolManagementApi.getAll('paymode/all'),
      ])
      setSessions(sessionData)
      setPayModeList(payModeData)
    } catch (error) {
      console.error('Error fetching pay modes:', error)
    }
  }

  const fetchGeneralReceipts = async () => {
    try {
      const data = await apiService.getAll('general-receipt/all')
      console.log(data)
      setGeneralReceipts(data)
    } catch (error) {
      console.error('Error fetching general receipts:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFetchStudent = async () => {
    if (!formData.studentId) {
      alert('Please enter a valid student ID!')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const studentData = await studentManagementApi.getById(`registration/${formData.studentId}`)
      if (!studentData) {
        alert('Student not found!')
        setStudent(null)
        return
      }
      console.log(studentData)
      setStudent(studentData)
    } catch (error) {
      setError('Error fetching student details.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.create('general-receipt/add', formData)
      alert('Receipt added successfully!')
      setFormData({
        receiptHead: '',
        sessionId: '',
        studentId: '',
        issueDate: '',
        payModeId: '',
        receiptNumber: '',
        narration: '',
        fees: '',
        fine: '',
        posCharges: '',
        concession: '',
        received: '',
        receiptDate: '',
        referenceNumber: '',
        remarks: '',
      })
      setStudent(null)
      fetchGeneralReceipts()
    } catch (error) {
      setError('Error adding receipt!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = (receiptId) => {
    console.log('Print Receipt ID:', receiptId)
    // Add print functionality here
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>General Receipt</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Receipt Head</CFormLabel>
                  <CFormSelect
                    name="receiptHead"
                    value={formData.receiptHead}
                    onChange={handleChange}
                  >
                    <option value="">Select Receipt Head</option>
                    {receiptHeads.map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.headName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Issue Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Pay Mode</CFormLabel>
                  <CFormSelect name="payModeId" value={formData.payModeId} onChange={handleChange}>
                    <option value="">Select Pay Mode</option>
                    {payModeList.map((mode) => (
                      <option key={mode.id} value={mode.id}>
                        {mode.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Search Student</CFormLabel>
                  <div className="d-flex">
                    <CFormInput
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                    />
                    <CButton color="primary" onClick={handleFetchStudent} disabled={loading}>
                      {loading ? 'Searching...' : 'Search'}
                    </CButton>
                  </div>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Receipt No.</CFormLabel>
                  <CFormInput
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Session</CFormLabel>
                  <CFormSelect name="sessionId" value={formData.sessionId} onChange={handleChange}>
                    <option value="">Select Session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              {student && (
                <>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Name</CFormLabel>
                      <CFormInput value={student.name || ''} readOnly />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel>Father Name</CFormLabel>
                      <CFormInput value={student.studentDetails?.fatherName || ''} readOnly />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Mother Name</CFormLabel>
                      <CFormInput value={student.studentDetails?.motherName || ''} readOnly />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Class</CFormLabel>
                      <CFormInput value={student.className?.name || ''} readOnly />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Group</CFormLabel>
                      <CFormInput value={student.group || ''} readOnly />
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Section</CFormLabel>
                      <CFormInput value={student.section?.name || ''} readOnly />
                    </CCol>
                  </CRow>
                </>
              )}

              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Narration</CFormLabel>
                  <CFormInput name="narration" value={formData.narration} onChange={handleChange} />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={2}>
                  <CFormLabel>Fees</CFormLabel>
                  <CFormInput name="fees" value={formData.fees} onChange={handleChange} />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Fine</CFormLabel>
                  <CFormInput name="fine" value={formData.fine} onChange={handleChange} />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>POS Charges</CFormLabel>
                  <CFormInput
                    name="posCharges"
                    value={formData.posCharges}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Concession</CFormLabel>
                  <CFormInput
                    name="concession"
                    value={formData.concession}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Received</CFormLabel>
                  <CFormInput name="received" value={formData.received} onChange={handleChange} />
                </CCol>
              </CRow>
              <CRow>
                <CCol md={4}>
                  <CFormLabel>Receipt Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="receiptDate"
                    value={formData.receiptDate}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={8}>
                  <CFormLabel>Remarks</CFormLabel>
                  <CFormInput
                    type="input"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>

              {error && <p className="text-danger">{error}</p>}

              <CButton color="success" className="mt-3" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Add Receipt'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All General Receipts</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Receipt No.</CTableHeaderCell>
                  <CTableHeaderCell>Student Name</CTableHeaderCell>
                  <CTableHeaderCell>Pay Mode</CTableHeaderCell>
                  <CTableHeaderCell>Fees</CTableHeaderCell>
                  <CTableHeaderCell>Fine</CTableHeaderCell>
                  <CTableHeaderCell>Concession</CTableHeaderCell>
                  <CTableHeaderCell>Received</CTableHeaderCell>
                  <CTableHeaderCell>Active</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {generalReceipts.length > 0 ? (
                  generalReceipts.map((receipt, index) => (
                    <CTableRow key={receipt.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{receipt.receiptNumber}</CTableDataCell>
                      <CTableDataCell>{receipt.studentName || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{receipt.payModeName || 'N/A'}</CTableDataCell>
                      <CTableDataCell>{receipt.fees}</CTableDataCell>
                      <CTableDataCell>{receipt.fine}</CTableDataCell>
                      <CTableDataCell>{receipt.concession}</CTableDataCell>
                      <CTableDataCell>{receipt.received}</CTableDataCell>
                      <CTableDataCell>{receipt.active ? 'Yes' : 'Cancelled'}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(receipt.id)}
                        >
                          Edit
                        </CButton>
                        <CButton color="primary" size="sm" onClick={() => handlePrint(receipt.id)}>
                          Print
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="10" className="text-center">
                      No receipts found.
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GeneralReceipt
