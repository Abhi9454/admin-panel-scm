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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'

const JobDepartment = () => {
  const [jobDepartmentName, setJobDepartmentName] = useState('')
  const [sequence, setSequence] = useState('')
  const [jobDepartments, setJobDepartments] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchJobDepartments()
  }, [])

  const fetchJobDepartments = async () => {
    try {
      const data = await apiService.getAll('department/all')
      setJobDepartments(data)
    } catch (error) {
      console.error('Error fetching job departments:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDepartmentName || !sequence) return

    const newDepartment = { name: jobDepartmentName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('department/update', editingId, newDepartment)
        setEditingId(null)
      } else {
        await apiService.create('department/add', newDepartment)
      }
      await fetchJobDepartments()
      handleClear()
    } catch (error) {
      console.error('Error saving job department:', error)
    }
  }

  const handleEdit = (id) => {
    const departmentToEdit = jobDepartments.find((dept) => dept.id === id)
    if (departmentToEdit) {
      setJobDepartmentName(departmentToEdit.name)
      setSequence(departmentToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`department/delete/${id}`)
      fetchJobDepartments()
    } catch (error) {
      console.error('Error deleting job department:', error)
    }
  }

  const handleClear = () => {
    setJobDepartmentName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Job Department' : 'Add New Job Department'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="jobDepartmentName">Job Department Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="jobDepartmentName"
                  placeholder="Enter Job Department Name"
                  value={jobDepartmentName}
                  onChange={(e) => setJobDepartmentName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="sequence">Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  id="sequence"
                  placeholder="Enter Sequence Number"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                />
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Job Department' : 'Add Job Department'}
              </CButton>
              {editingId && (
                <CButton color="secondary" className="ms-2" onClick={handleClear}>
                  Clear
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Job Departments</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Job Department Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {jobDepartments.map((dept) => (
                    <CTableRow key={dept.id}>
                      <CTableDataCell>{dept.name}</CTableDataCell>
                      <CTableDataCell>{dept.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(dept.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(dept.id)}>
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CRow>
  )
}

export default JobDepartment
