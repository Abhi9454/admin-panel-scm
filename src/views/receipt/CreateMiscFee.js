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
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const CreateMiscFee = () => {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [term, setTerm] = useState([])
  const [className, setClassName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
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
      setTerm(termData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLiveSearch = async (value) => {
    console.log(value)
    setStudentId(value)

    // Early exit if the input is empty
    if (!value.trim()) {
      setSearchResults([])
      return
    }

    // Clear previous debounce timeout if it exists
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Set a new debounce timeout to trigger search after 300ms
    const timeout = setTimeout(async () => {
      try {
        setLoading(true) // Show loading spinner
        const response = await studentManagementApi.getById('search', value)
        setSearchResults(Array.isArray(response) ? response : []) // Handle the response
      } catch (error) {
        console.error('Search failed', error)
        setSearchResults([]) // Clear results on error
      } finally {
        setLoading(false) // Hide loading spinner
      }
    }, 300) // Wait for 300ms before calling the API

    // Save the timeout ID for future cleanup
    setDebounceTimeout(timeout)
  }

  const handleSelect = (admissionNumber, className) => {
    setStudentId(admissionNumber)
    setClassName(className)
    setSearchResults([])

    const updatedFormData = {
      ...formData,
      admissionNumber,
      classId: null,
      groupId: null,
    }
    searchStudentFeeByAdmissionNumber(updatedFormData)
  }

  const searchStudentFeeByAdmissionNumber = async (updatedFormData) => {
    setLoading(true)
    try {
      const students = await studentManagementApi.fetch('fee-mapping', updatedFormData)
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

  // Updated navigation function to pass more data
  const handleAddFeeComponent = (student) => {
    const feeTypes = Object.keys(student.feeTerms || {})
    const termIds = [
      ...new Set(feeTypes.flatMap((feeType) => Object.keys(student.feeTerms[feeType] || {}))),
    ]
    const existingTotal = feeTypes.reduce((sum, feeType) => {
      return (
        sum +
        Object.values(student.feeTerms[feeType] || {}).reduce(
          (subSum, amount) => subSum + amount,
          0,
        )
      )
    }, 0)

    // Prepare fee table data
    const feeTableData = {
      feeTypes,
      termIds,
      feeTerms: student.feeTerms,
      existingTotal,
      termList: term, // Pass term data for display
    }

    navigate(`${location.pathname}/add-misc-fee-student`, {
      state: {
        admissionNumber: student.admissionNumber,
        studentName: student.studentName, // Fixed: using studentName instead of name
        className: className,
        feeTableData, // Pass the fee table data
      },
    })
  }

  return (
    <CRow>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Search Student</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3 position-relative">
                <CCol md={12}>
                  <CFormInput
                    floatingClassName="mb-3"
                    floatingLabel={
                      <>
                        Enter or Search Admission Number
                        <span style={{ color: 'red' }}> *</span>
                      </>
                    }
                    type="text"
                    id="studentId"
                    placeholder="Enter or Search Admission Number"
                    value={studentId}
                    onChange={(e) => handleLiveSearch(e.target.value)}
                    autoComplete="off"
                  />
                  {searchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        zIndex: 999,
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '0 0 4px 4px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                    >
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #444',
                            backgroundColor: '#777',
                            color: 'white',
                          }}
                          onClick={() => handleSelect(result.admissionNumber, result.className)}
                        >
                          {result.admissionNumber} - {result.name} - {result.className} -{' '}
                          {result.sectionName}
                        </div>
                      ))}
                    </div>
                  )}
                </CCol>
              </CRow>
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
          const termIds = [
            ...new Set(feeTypes.flatMap((feeType) => Object.keys(student.feeTerms[feeType] || {}))),
          ]
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
                      <CButton onClick={() => handleAddFeeComponent(student)} color="warning">
                        Add Fee Component
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
                        <CTableHeaderCell style={{ textAlign: 'right' }}>Total</CTableHeaderCell>
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
                              <CTableDataCell key={j} style={{ textAlign: 'right' }}>
                                ₹{student.feeTerms[feeType]?.[termId] || 0}
                              </CTableDataCell>
                            ))}
                            <CTableDataCell style={{ textAlign: 'right' }}>
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
