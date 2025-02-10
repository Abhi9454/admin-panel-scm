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

const initialSubjects = [
  { id: 1, name: 'Math', code: 'MTH101' },
  { id: 2, name: 'Science', code: 'SCI102' },
  { id: 3, name: 'History', code: 'HIS103' },
  { id: 4, name: 'English', code: 'ENG104' },
  { id: 5, name: 'Geography', code: 'GEO105' },
]

const CreateSubject = () => {
  const [subjectName, setSubjectName] = useState('')
  const [subjectCode, setSubjectCode] = useState('')
  const [subjects, setSubjects] = useState(initialSubjects)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!subjectName || !subjectCode) return

    if (editingId !== null) {
      setSubjects(subjects.map(subject => subject.id === editingId ? { id: editingId, name: subjectName, code: subjectCode } : subject))
      setEditingId(null)
    } else {
      const newSubject = {
        id: subjects.length + 1,
        name: subjectName,
        code: subjectCode,
      }
      setSubjects([...subjects, newSubject])
    }

    setSubjectName('')
    setSubjectCode('')
  }

  const handleEdit = (id) => {
    const subjectToEdit = subjects.find(subject => subject.id === id)
    if (subjectToEdit) {
      setSubjectName(subjectToEdit.name)
      setSubjectCode(subjectToEdit.code)
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setSubjectName('')
    setSubjectCode('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Subject' : 'Add New Subject'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="subjectName">Subject Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="subjectName"
                  placeholder="Enter Subject Name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="subjectCode">Subject Code</CFormLabel>
                <CFormInput
                  type="text"
                  id="subjectCode"
                  placeholder="Enter Subject Code"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                />
              </div>
              <CButton color={editingId ? "warning" : "success"} type="submit">
                {editingId ? 'Update Subject' : 'Add Subject'}
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
              <strong>All Subjects</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Subject Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Subject Code</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {subjects.map((subject) => (
                    <CTableRow key={subject.id}>
                      <CTableDataCell>{subject.name}</CTableDataCell>
                      <CTableDataCell>{subject.code}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(subject.id)}>
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {subjects.length === 0 && (
                    <CTableRow>
                      <CTableDataCell colSpan={3}>No records found.</CTableDataCell>
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

export default CreateSubject
