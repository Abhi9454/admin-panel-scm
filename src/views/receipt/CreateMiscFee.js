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
  const [receiptHead, setReceiptHead] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    classId: null,
    groupId: null,
    registrationNumber: null,
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
    } catch (error) {
      console.error('Error fetching data:', error)
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

  const handleSubmit = async (event, type) => {
    event.preventDefault()
    setLoading(true)
    let updatedFormData = { ...formData }

    if (type === 'fetch') {
      updatedFormData.registrationNumber = null // Set registrationNumber to null when fetching students
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
                  <CFormLabel>Class</CFormLabel>
                  <CFormSelect
                    name="classId"
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
                  <CFormLabel>Group</CFormLabel>
                  <CFormSelect
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
            <strong>Search Student by Registration Number</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={(e) => handleSubmit(e, 'search')}>
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Registration Number</CFormLabel>
                  <CFormInput
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber || ''}
                    onChange={handleChange}
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
          const termIds = student.feeTerms[feeTypes[0]].map((term) => Object.keys(term)[0])

          const existingTotal = feeTypes.reduce((sum, feeType) => {
            return (
              sum +
              (student.feeTerms[feeType] || []).reduce(
                (subSum, term) => subSum + Object.values(term)[0],
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
                        {student.studentName} - {student.registrationNumber}
                      </strong>
                    </CCol>
                    <CCol className="text-end">
                      <CButton
                        onClick={() =>
                          navigate(`${location.pathname}/add-misc-fee-student`, {
                            state: { registrationNumber: student.registrationNumber },
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
                          <CTableHeaderCell key={i}>{termId}</CTableHeaderCell>
                        ))}
                        <CTableHeaderCell>Total</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {feeTypes.map((feeType, i) => {
                        const totalAmount = (student.feeTerms[feeType] || []).reduce(
                          (sum, term) => sum + Object.values(term)[0],
                          0,
                        )
                        return (
                          <CTableRow key={i}>
                            <CTableDataCell>{feeType}</CTableDataCell>
                            {(student.feeTerms[feeType] || []).map((term, j) => (
                              <CTableDataCell key={j}>₹{Object.values(term)[0]}</CTableDataCell>
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
    </CRow>
  )
}

export default CreateMiscFee
