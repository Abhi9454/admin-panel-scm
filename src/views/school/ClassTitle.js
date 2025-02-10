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

const initialClasses = [
  { id: 1, name: 'Class 1', sequence: 3 },
  { id: 2, name: 'Class 2', sequence: 2 },
  { id: 3, name: 'Class 3', sequence: 4 },
  { id: 4, name: 'Class 4', sequence: 3 },
  { id: 5, name: 'Class 5', sequence: 2 },
  { id: 6, name: 'Class 6', sequence: 4 },
  { id: 7, name: 'Class 7', sequence: 3 },
  { id: 8, name: 'Class 8', sequence: 2 },
  { id: 9, name: 'Class 9', sequence: 4 },
  { id: 10, name: 'Class 10', sequence: 3 },
]

const ClassTitle = () => {
  const [className, setClassName] = useState('')
  const [sequence, setSequence] = useState('')
  const [classes, setClasses] = useState(initialClasses)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!className || !sequence) return

    if (editingId !== null) {
      setClasses(
        classes.map((cls) =>
          cls.id === editingId ? { id: editingId, name: className, sequence: parseInt(sequence) } : cls
        )
      )
      setEditingId(null)
    } else {
      const newClass = {
        id: classes.length + 1,
        name: className,
        sequence: parseInt(sequence),
      }
      setClasses([...classes, newClass])
    }

    setClassName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const classToEdit = classes.find((cls) => cls.id === id)
    if (classToEdit) {
      setClassName(classToEdit.name)
      setSequence(classToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setClassName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Class' : 'Add New Class'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="className">Class Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="className"
                  placeholder="Enter Class Name"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
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
                {editingId ? 'Update Class' : 'Add Class'}
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
              <strong>All Classes</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Class Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {classes.map((cls) => (
                    <CTableRow key={cls.id}>
                      <CTableDataCell>{cls.name}</CTableDataCell>
                      <CTableDataCell>{cls.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(cls.id)}>
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

export default ClassTitle
