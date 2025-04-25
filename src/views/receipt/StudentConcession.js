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

const StudentConcession = () => {
  const [payModeList, setPayModeList] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [student, setStudent] = useState(null)
  const [concessionId, setConcessionId] = useState(null)
  const [concessions, setConcessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generalReceipts, setGeneralReceipts] = useState([])

  const [formData, setFormData] = useState({
    studentId: '',
    referenceNumber: '',
    concessionId: '',
    remarks: '',
  })

  useEffect(() => {
    fetchPayModes()
  }, [])

  const fetchPayModes = async () => {
    try {
      const [concessionData] = await Promise.all([schoolManagementApi.getAll('concession/all')])
      setConcessions(concessionData)
    } catch (error) {
      console.error('Error fetching pay modes:', error)
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
      const studentData = await studentManagementApi.getById(`admissionNumber`, formData.studentId)
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
        studentId: '',
        referenceNumber: '',
        concessionId: '',
        remarks: '',
      })
      setStudent(null)
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
            <strong>Student Concession</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Concession Head</CFormLabel>
                  <CFormSelect
                    name="concessionId"
                    value={formData.concessionId}
                    onChange={handleChange}
                  >
                    <option value="">Select Concession</option>
                    {concessions.map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.name}
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
                  <CFormLabel>Reference No.</CFormLabel>
                  <CFormInput
                    name="referenceNumber"
                    value={formData.referenceNumber}
                    onChange={handleChange}
                  />
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
                      <CFormInput value={student.fatherName || ''} readOnly />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Mother Name</CFormLabel>
                      <CFormInput value={student.motherName || ''} readOnly />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Class</CFormLabel>
                      <CFormInput value={student.className || ''} readOnly />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>Group</CFormLabel>
                      <CFormInput value={student.groupName || ''} readOnly />
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Section</CFormLabel>
                      <CFormInput value={student.sectionName || ''} readOnly />
                    </CCol>
                  </CRow>
                </>
              )}
              <CRow>
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
    </CRow>
  )
}

export default StudentConcession
