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

const initialProfession = [
  { id: 1, name: 'Doctor', sequence: 3 },
  { id: 2, name: 'Software Engineer', sequence: 2 },
  { id: 3, name: 'Politician', sequence: 4 },
  { id: 4, name: 'Contractor', sequence: 3 },
  { id: 5, name: 'Business Man', sequence: 2 },
  { id: 6, name: 'Government Service', sequence: 4 },
  { id: 7, name: 'Engineer', sequence: 3 },
]

const ParentProfession = () => {
  const [professionName, setProfessionName] = useState('')
  const [sequence, setSequence] = useState('')

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [sequenceTerm, setSequenceFilter] = useState('All')

  const [professions, setProfessions] = useState(initialProfession)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!professionName || !sequence) return

    const newClass = {
      id: professions.length + 1,
      name: professionName,
      sequence: parseInt(sequence),
    }

    setProfessions([...professions, newClass])
    setProfessionName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
  }

  const filteredClasses = professions.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSequence = sequenceTerm === 'All' || cls.sequence.toString() === sequenceTerm
    return matchesSearch && matchesSequence
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Profession Title</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Profession Name</CFormLabel>
                <CFormInput type="text" id="exampleFormControlInput1" placeholder="Profession Name" />
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
                <CButton color="success">Add Profession</CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Professions</strong>
              <CFormInput
                className="mt-2 mb-2"
                type="text"
                placeholder="Search by Profession name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Profession Name</CTableHeaderCell>
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

export default ParentProfession
