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
  const [sequence, setSequence] = useState('')

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [sequenceTerm, setSequenceFilter] = useState('All')

  const [sections, setSections] = useState(initialSection)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!sectionName || !sequence) return

    const newClass = {
      id: sections.length + 1,
      name: sectionName,
      sequence: parseInt(sequence),
    }

    setSections([...sections, newClass])
    setSectionName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
  }

  const filteredClasses = sections.filter((cls) => {
    const matchesSearch = cls.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSequence = sequenceTerm === 'All' || cls.className.toString() === sequenceTerm
    return matchesSearch && matchesSequence
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Section Title</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Class Name</CFormLabel>
                <CFormSelect aria-label="Select Class">
                  <option>Select Class</option>
                  {classNameDetail.map((cls) => (
                    <option value={cls.id}>{cls.className}</option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Section Name</CFormLabel>
                <CFormInput type="text" id="exampleFormControlInput1" placeholder="Section Name" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Stream Name</CFormLabel>
                <CFormSelect aria-label="Select Stream">
                  <option>Select Stream</option>
                  {streamDetail.map((cls) => (
                    <option value={cls.id}>{cls.stream}</option>
                  ))}
                </CFormSelect>
              </div>
              <div>
                <CButton color="success">Add Section</CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Sections</strong>
              <CFormInput
                className="mt-2 mb-2"
                type="text"
                placeholder="Search by section name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  {filteredClasses.map((cls) => (
                    <CTableRow>
                      <CTableDataCell>{cls.sectionName}</CTableDataCell>
                      <CTableDataCell>{cls.className}</CTableDataCell>
                      <CTableDataCell>{cls.stream}</CTableDataCell>
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

export default SectionTitle
