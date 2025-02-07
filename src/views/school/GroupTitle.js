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

const initialGroup = [
  { id: 1, name: 'Group 1', sections: 3 },
  { id: 2, name: 'Group 2', sections: 2 },
]

const GroupTitle = () => {
  const [groupName, setGroupName] = useState('')
  const [sequence, setSequence] = useState('')

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [sequenceTerm, setSequenceFilter] = useState('All')

  const [groups, setGroups] = useState(initialGroup)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupName || !sequence) return

    const newClass = {
      id: groups.length + 1,
      name: groupName,
      sequence: parseInt(sequence),
    }

    setGroups([...groups, newClass])
    setGroupName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
  }

  const filteredClasses = groups.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSequence = sequenceTerm === 'All' || cls.sequence.toString() === sequenceTerm
    return matchesSearch && matchesSequence
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Group Title</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Group Name</CFormLabel>
                <CFormInput type="text" id="exampleFormControlInput1" placeholder="Group Name" />
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
                <CButton color="success">Add Group</CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Groups</strong>
              <CFormInput
                className="mt-2 mb-2"
                type="text"
                placeholder="Search by class name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Group Name</CTableHeaderCell>
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

export default GroupTitle
