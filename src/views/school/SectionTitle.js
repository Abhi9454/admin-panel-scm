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
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const initialSection = [
  { id: 1, className: 'Class 1', sectionName: 'A', stream: 'Maths' },
  { id: 2, className: 'Class 2', sectionName: 'B', stream: 'Science' },
  { id: 3, className: 'Class 3', sectionName: 'C', stream: 'Commerce' },
  { id: 4, className: 'Class 4', sectionName: 'D', stream: 'General' },
]

const streamDetail = [
  { id: 1, stream: 'Maths' },
  { id: 2, stream: 'Science' },
  { id: 3, stream: 'Commerce' },
  { id: 4, stream: 'General' },
]

const classNameDetail = [
  { id: 1, className: 'Class 1' },
  { id: 2, className: 'Class 2' },
  { id: 3, className: 'Class 3' },
  { id: 4, className: 'Class 4' },
]

const SectionTitle = () => {
  const [sectionName, setSectionName] = useState('')
  const [className, setClassName] = useState('')
  const [stream, setStream] = useState('')
  const [sections, setSections] = useState(initialSection)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!sectionName || !className || !stream) return

    if (editingId !== null) {
      setSections(
        sections.map((sec) =>
          sec.id === editingId ? { id: editingId, className, sectionName, stream } : sec
        )
      )
      setEditingId(null)
    } else {
      const newSection = {
        id: sections.length + 1,
        className,
        sectionName,
        stream,
      }
      setSections([...sections, newSection])
    }

    setSectionName('')
    setClassName('')
    setStream('')
  }

  const handleEdit = (id) => {
    const sectionToEdit = sections.find((sec) => sec.id === id)
    if (sectionToEdit) {
      setSectionName(sectionToEdit.sectionName)
      setClassName(sectionToEdit.className)
      setStream(sectionToEdit.stream)
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setSectionName('')
    setClassName('')
    setStream('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Section' : 'Add New Section'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>Class Name</CFormLabel>
                <CFormSelect value={className} onChange={(e) => setClassName(e.target.value)}>
                  <option value="">Select Class</option>
                  {classNameDetail.map((cls) => (
                    <option key={cls.id} value={cls.className}>{cls.className}</option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Section Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Section Name"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Stream Name</CFormLabel>
                <CFormSelect value={stream} onChange={(e) => setStream(e.target.value)}>
                  <option value="">Select Stream</option>
                  {streamDetail.map((strm) => (
                    <option key={strm.id} value={strm.stream}>{strm.stream}</option>
                  ))}
                </CFormSelect>
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Section' : 'Add Section'}
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
              <strong>All Sections</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Section Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Stream</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {sections.map((sec) => (
                    <CTableRow key={sec.id}>
                      <CTableDataCell>{sec.sectionName}</CTableDataCell>
                      <CTableDataCell>{sec.className}</CTableDataCell>
                      <CTableDataCell>{sec.stream}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(sec.id)}>
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

export default SectionTitle
