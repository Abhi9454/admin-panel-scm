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
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

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

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [sequenceTerm, setSequenceFilter] = useState('All')

  const [jobDepartments, setJobDepartments] = useState(initialJobDepartment)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!className || !sequence) return

    const newClass = {
      id: jobDepartments.length + 1,
      name: jobDepartmentName,
      sequence: parseInt(sequence),
    }

    setJobDepartments([...jobDepartments, newClass])
    setJobDepartmentName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
  }

  const filteredClasses = jobDepartments.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSequence = sequenceTerm === 'All' || cls.sequence.toString() === sequenceTerm
    return matchesSearch && matchesSequence
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Job Department Title</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Job Department Name</CFormLabel>
                <CFormInput type="text" id="exampleFormControlInput1" placeholder="Job Department Name" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput2">Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  id="exampleFormControlInput2"
                  placeholder="Sequence Number"
                />
              </div>
              <div>
                <CButton color="success">Add Job Department</CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Job Departments</strong>
              <CFormInput
                className="mt-2 mb-2"
                type="text"
                placeholder="Search by job department name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  {filteredClasses.map((cls) => (
                    <CTableRow>
                      <CTableDataCell>{cls.name}</CTableDataCell>
                      <CTableDataCell>{cls.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(cls.id)}>
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {filteredClasses.length === 0 && (
                    <CTableRow>
                      <CTableDataCell>No records found.</CTableDataCell>
                    </CTableRow>
                  )}
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
