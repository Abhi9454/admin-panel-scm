import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
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
import receiptManagementApi from '../../api/receiptManagementApi'

const CreateMiscFee = () => {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [term, setTerm] = useState([])
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [receiptHead, setReceiptHead] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    classId: null,
    groupId: null,
    admissionNumber: null,
  })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [classData, groupData, termData, receiptHeadData] = await Promise.all([
        apiService.getAll('class/all'),
        apiService.getAll('group/all'),
        apiService.getAll('term/all'),
        receiptManagementApi.getAll('receipt-head/all'),
      ])
      setClasses(classData)
      setGroups(groupData)
      setReceiptHead(receiptHeadData)
      setTerm(termData)
      console.log(termData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    if (!studentId.trim()) return
    try {
      const response = await studentManagementApi.getById('search', studentId)
      setSearchResults(response)
      setShowModal(true)
    } catch (error) {
      console.error('Search failed', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value !== '' ? value : null,
    }))
  }

  const handleSelect = (admissionNumber) => {
    setStudentId(admissionNumber)
    setShowModal(false)
    searchStudentFeeByAdmissionNumber()
  }

  const searchStudentFeeByAdmissionNumber = async (event, type) => {
    setLoading(true)
    let updatedFormData = { ...formData }

    updatedFormData.admissionNumber = studentId
    updatedFormData.classId = null
    updatedFormData.groupId = null
    console.log(updatedFormData)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', updatedFormData)
      console.log(students)
      setStudents(students)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event, type) => {
    event.preventDefault()
    setLoading(true)
    let updatedFormData = { ...formData }

    if (type === 'fetch') {
      updatedFormData.admissionNumber = null // Set registrationNumber to null when fetching students
    } else if (type === 'search') {
      updatedFormData.classId = null
      updatedFormData.groupId = null // Set classId and groupId to null when searching by registration number
    }

    console.log(updatedFormData)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', updatedFormData)
      console.log(students)
      setStudents(students)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTermName = (termId) => {
    const termObj = term.find((t) => t.id === parseInt(termId))
    return termObj ? termObj.name : termId
  }

  return (
    <CRow>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Filter Students by Criteria</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={(e) => handleSubmit(e, 'fetch')}>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormSelect
                    name="classId"
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Class<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    value={formData.classId || ''}
                    onChange={handleChange}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormSelect
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Group<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    name="groupId"
                    value={formData.groupId || ''}
                    onChange={handleChange}
                  >
                    <option value="">Select Group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CButton color="primary" type="submit">
                Fetch Students
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Search Student by Admission Number</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSearch}>
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Enter or Search Admission Number<span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="text"
                    id="studentId"
                    placeholder="Enter or Search Admission Number"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </CCol>
              </CRow>
              <CButton color="primary" type="submit">
                Search
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      {loading ? (
        <div className="text-center">
          <CSpinner color="primary" />
          <p>Loading data...</p>
        </div>
      ) : (
        students.length > 0 &&
        students.map((student, index) => {
          const feeTypes = Object.keys(student.feeTerms || {})

          // Extract unique term IDs
          const termIds = [
            ...new Set(feeTypes.flatMap((feeType) => Object.keys(student.feeTerms[feeType] || {}))),
          ]

          // Calculate overall total
          const existingTotal = feeTypes.reduce((sum, feeType) => {
            return (
              sum +
              Object.values(student.feeTerms[feeType] || {}).reduce(
                (subSum, amount) => subSum + amount,
                0,
              )
            )
          }, 0)

          return (
            <CCol xs={12} key={index}>
              <CCard className="mb-4">
                <CCardHeader>
                  <CRow className="align-items-center">
                    <CCol xs="auto">
                      <strong>
                        {student.studentName} - {student.admissionNumber}
                      </strong>
                    </CCol>
                    <CCol className="text-end">
                      <CButton
                        onClick={() =>
                          navigate(`${location.pathname}/add-misc-fee-student`, {
                            state: { admissionNumber: student.admissionNumber },
                          })
                        }
                        color="warning"
                      >
                        All Fee Component
                      </CButton>
                    </CCol>
                  </CRow>
                </CCardHeader>
                <CCardBody>
                  <CTable striped bordered>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Component</CTableHeaderCell>
                        {termIds.map((termId, i) => (
                          <CTableHeaderCell key={i}>{getTermName(termId)}</CTableHeaderCell>
                        ))}
                        <CTableHeaderCell>Total</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {feeTypes.map((feeType, i) => {
                        const totalAmount = Object.values(student.feeTerms[feeType] || {}).reduce(
                          (sum, amount) => sum + amount,
                          0,
                        )

                        return (
                          <CTableRow key={i}>
                            <CTableDataCell>{feeType}</CTableDataCell>
                            {termIds.map((termId, j) => (
                              <CTableDataCell key={j}>
                                ₹{student.feeTerms[feeType]?.[termId] || 0}
                              </CTableDataCell>
                            ))}
                            <CTableDataCell>
                              <strong>₹{totalAmount}</strong>
                            </CTableDataCell>
                          </CTableRow>
                        )
                      })}
                    </CTableBody>
                  </CTable>
                  <hr className="mt-3" />
                  <div className="text-end">
                    <strong>Overall Total: ₹{existingTotal}</strong>
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          )
        })
      )}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Select Student</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable bordered hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Student Name</CTableHeaderCell>
                <CTableHeaderCell>Admission Number</CTableHeaderCell>
                <CTableHeaderCell>Class Name</CTableHeaderCell>
                <CTableHeaderCell>Father's Name</CTableHeaderCell>
                <CTableHeaderCell>Action</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {searchResults.map((student, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{student.name}</CTableDataCell>
                  <CTableDataCell>{student.admissionNumber}</CTableDataCell>
                  <CTableDataCell>{student.className}</CTableDataCell>
                  <CTableDataCell>{student.fatherName}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="primary"
                      size="sm"
                      onClick={() => handleSelect(student.admissionNumber)}
                    >
                      Select
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default CreateMiscFee
