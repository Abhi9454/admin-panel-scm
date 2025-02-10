import React, { useState } from 'react'
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

const initialJobDepartment = [
  { id: 1, name: 'IT', sequence: 3 },
  { id: 2, name: 'Civil', sequence: 2 },
  { id: 3, name: 'Bank', sequence: 4 },
  { id: 4, name: 'Transport', sequence: 3 },
  { id: 5, name: 'Health', sequence: 2 },
  { id: 6, name: 'Finance', sequence: 4 },
  { id: 7, name: 'Marketing', sequence: 3 },
  { id: 8, name: 'Fashion', sequence: 2 },
]

const JobDepartment = () => {
  const [jobDepartmentName, setJobDepartmentName] = useState('')
  const [sequence, setSequence] = useState('')
  const [jobDepartments, setJobDepartments] = useState(initialJobDepartment)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!jobDepartmentName || !sequence) return

    if (editingId !== null) {
      setJobDepartments(
        jobDepartments.map((dept) =>
          dept.id === editingId ? { id: editingId, name: jobDepartmentName, sequence: parseInt(sequence) } : dept
        )
      )
      setEditingId(null)
    } else {
      const newDepartment = {
        id: jobDepartments.length + 1,
        name: jobDepartmentName,
        sequence: parseInt(sequence),
      }
      setJobDepartments([...jobDepartments, newDepartment])
    }

    setJobDepartmentName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const departmentToEdit = jobDepartments.find((dept) => dept.id === id)
    if (departmentToEdit) {
      setJobDepartmentName(departmentToEdit.name)
      setSequence(departmentToEdit.sequence.toString())
      setEditingId(id)
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
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {jobDepartments.map((dept) => (
                    <CTableRow key={dept.id}>
                      <CTableDataCell>{dept.name}</CTableDataCell>
                      <CTableDataCell>{dept.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(dept.id)}>
                          Edit
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
