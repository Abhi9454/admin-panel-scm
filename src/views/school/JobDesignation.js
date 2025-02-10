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

const initialJobDesignation = [
  { id: 1, name: 'Level 1', sequence: 3 },
  { id: 2, name: 'Level 2', sequence: 2 },
]

const JobDesignation = () => {
  const [jobDesignationName, setJobDesignationName] = useState('')
  const [sequence, setSequence] = useState('')
  const [jobDesignations, setJobDesignations] = useState(initialJobDesignation)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!jobDesignationName || !sequence) return

    if (editingId !== null) {
      setJobDesignations(
        jobDesignations.map((desig) =>
          desig.id === editingId
            ? { id: editingId, name: jobDesignationName, sequence: parseInt(sequence) }
            : desig,
        ),
      )
      setEditingId(null)
    } else {
      const newDesignation = {
        id: jobDesignations.length + 1,
        name: jobDesignationName,
        sequence: parseInt(sequence),
      }
      setJobDesignations([...jobDesignations, newDesignation])
    }

    setJobDesignationName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const designationToEdit = jobDesignations.find((desig) => desig.id === id)
    if (designationToEdit) {
      setJobDesignationName(designationToEdit.name)
      setSequence(designationToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setJobDesignationName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Job Designation' : 'Add New Job Designation'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="jobDesignationName">Job Designation Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="jobDesignationName"
                  placeholder="Enter Job Designation Name"
                  value={jobDesignationName}
                  onChange={(e) => setJobDesignationName(e.target.value)}
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
                {editingId ? 'Update Job Designation' : 'Add Job Designation'}
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
              <strong>All Job Designations</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Job Designation Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {jobDesignations.map((desig) => (
                    <CTableRow key={desig.id}>
                      <CTableDataCell>{desig.name}</CTableDataCell>
                      <CTableDataCell>{desig.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(desig.id)}>
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

export default JobDesignation
