import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'
import apiService from '../../api/school/schoolManagementApi'

const SchoolDetail = () => {
  const [school, setSchool] = useState({})
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchSchoolDetails()
  }, [])

  const fetchSchoolDetails = async () => {
    try {
      const data = await apiService.getOne('school/details')
      setSchool(data || {})
      setEditing(!!data)
    } catch (error) {
      console.error('Error fetching school details:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSchool((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await apiService.update('school/update', school.id, school)
      } else {
        await apiService.create('school/add', school)
      }
      fetchSchoolDetails()
    } catch (error) {
      console.error('Error saving school details:', error)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editing ? 'Edit School Details' : 'Add School Details'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CFormLabel>School Name</CFormLabel>
              <CFormInput type="text" name="schoolName" value={school.schoolName || ''} onChange={handleChange} />

              <CFormLabel>Address</CFormLabel>
              <CFormInput type="text" name="address" value={school.address || ''} onChange={handleChange} />

              <CFormLabel>Pin Code</CFormLabel>
              <CFormInput type="text" name="pinCode" value={school.pinCode || ''} onChange={handleChange} />

              <CFormLabel>Phone Number</CFormLabel>
              <CFormInput type="text" name="phoneNumber" value={school.phoneNumber || ''} onChange={handleChange} />

              <CButton color={editing ? 'warning' : 'success'} type="submit">
                {editing ? 'Update School Details' : 'Add School Details'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SchoolDetail
