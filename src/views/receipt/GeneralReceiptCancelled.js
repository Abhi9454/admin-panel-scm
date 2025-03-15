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

const GeneralReceiptCancelled = () => {
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
    </CRow>
  )
}

export default GeneralReceiptCancelled
