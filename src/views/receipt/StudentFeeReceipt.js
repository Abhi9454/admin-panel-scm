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
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'

const StudentFeeReceipt = () => {
  const [sessions, setSessions] = useState([])
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState(null)
  const [feeData, setFeeData] = useState(null)
  const [filteredFeeData, setFilteredFeeData] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    receivedBy: 'School',
    paymentMode: '',
    sessionId: '',
    registrationNumber: '',
    termId: '',
    receiptNumber: '',
    totalAdvance: '',
    advanceDeduct: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (!feeData || !formData.termId || !terms.length) {
      setFilteredFeeData(null)
      return
    }

    const selectedTermId = parseInt(formData.termId)
    const termFeeDetails = {}

    Object.entries(feeData[0]?.feeTerms || {}).forEach(([receiptHead, termMap]) => {
      if (termMap[selectedTermId] > 0) {
        termFeeDetails[receiptHead] = termMap[selectedTermId]
      }
    })

    setFilteredFeeData(termFeeDetails)
  }, [formData.termId, feeData, terms])

  const fetchInitialData = async () => {
    try {
      const [sessionData, termData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('term/all'),
      ])
      setSessions(sessionData)
      setTerms(termData)
    } catch (error) {
      console.error('Error fetching initial data:', error)
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
    setLoading(true)
    try {
      const studentData = await studentManagementApi.getById(
        `registration/${formData.registrationNumber}`,
      )
      if (!studentData) {
        console.error('Student not found!')
        setStudent(null)
        setFeeData(null)
        return
      }

      setStudent(studentData)

      await fetchStudentFeeData(studentData)
    } catch (error) {
      console.error('Error fetching student:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentFeeData = async (studentData) => {
    try {
      const payload = {
        registrationNumber: studentData.registrationNumber,
        classId: null,
        groupId: null,
      }

      const feeResponse = await studentManagementApi.fetch('fee-mapping', payload)
      setFeeData(feeResponse)
    } catch (error) {
      console.error('Error fetching fee records:', error)
      setFeeData(null)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Student Fee Receipt</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Received By</CFormLabel>
                  <CFormSelect
                    name="receivedBy"
                    value={formData.receivedBy}
                    onChange={handleChange}
                  >
                    <option value="0">School</option>
                    <option value="1">Bank</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
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
                <CCol md={3}>
                  <CFormLabel>Search Student</CFormLabel>
                  <div className="d-flex">
                    <CFormInput
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                    />
                    <CButton color="primary" onClick={handleFetchStudent}>
                      Search
                    </CButton>
                  </div>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Term</CFormLabel>
                  <CFormSelect name="termId" value={formData.termId} onChange={handleChange}>
                    <option value="">Select Term</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Pay Mode</CFormLabel>
                  <CFormSelect
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                  >
                    <option value="0">Cash</option>
                    <option value="1">Cheque</option>
                    <option value="2">DD</option>
                    <option value="3">NEFT/RTGS</option>
                    <option value="4">UPI</option>
                    <option value="5">Swipe</option>
                    <option value="6">Application</option>
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Total Advance</CFormLabel>
                  <CFormInput
                    type="text"
                    name="totalAdvance"
                    value={formData.totalAdvance}
                    readOnly
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Advance Deduct</CFormLabel>
                  <CFormInput
                    type="text"
                    name="advanceDeduct"
                    value={formData.advanceDeduct}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {loading && <CSpinner color="primary" />}

      {student && (
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h5>
                {student.name} - {student.registrationNumber}
              </h5>
            </CCardHeader>
            <CCardBody>
              <CTable bordered>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell>
                      <strong>Class:</strong> {student.className?.name || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>Section:</strong> {student.section?.name || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>Group:</strong> {student.group || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>Hostel:</strong> {student.hostel || 'N/A'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>Father's Name:</strong> {student.studentDetails?.fatherName || 'N/A'}
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>

              {filteredFeeData && Object.keys(filteredFeeData).length > 0 ? (
                <CCol xs={12}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <h5>Fee Details for Selected Term</h5>
                    </CCardHeader>
                    <CCardBody>
                      <CTable bordered>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Fee Component</CTableHeaderCell>
                            <CTableHeaderCell>Amount</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {Object.entries(filteredFeeData).map(([receiptHead, amount]) => (
                            <CTableRow key={receiptHead}>
                              <CTableDataCell>
                                <strong>{receiptHead}</strong>
                              </CTableDataCell>
                              <CTableDataCell>₹{amount}</CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </CCardBody>
                  </CCard>
                </CCol>
              ) : (
                <p className="text-center">No fee records found for the selected term.</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  )
}

export default StudentFeeReceipt
