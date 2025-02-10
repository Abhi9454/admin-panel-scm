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

const initialGroup = [
  { id: 1, name: 'Group 1', sequence: 3 },
  { id: 2, name: 'Group 2', sequence: 2 },
]

const GroupTitle = () => {
  const [groupName, setGroupName] = useState('')
  const [sequence, setSequence] = useState('')
  const [groups, setGroups] = useState(initialGroup)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!groupName || !sequence) return

    if (editingId !== null) {
      setGroups(
        groups.map((grp) =>
          grp.id === editingId ? { id: editingId, name: groupName, sequence: parseInt(sequence) } : grp
        )
      )
      setEditingId(null)
    } else {
      const newGroup = {
        id: groups.length + 1,
        name: groupName,
        sequence: parseInt(sequence),
      }
      setGroups([...groups, newGroup])
    }

    setGroupName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const groupToEdit = groups.find((grp) => grp.id === id)
    if (groupToEdit) {
      setGroupName(groupToEdit.name)
      setSequence(groupToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setGroupName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Group' : 'Add New Group'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="groupName">Group Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="groupName"
                  placeholder="Enter Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
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
              <CButton color={editingId ? "warning" : "success"} type="submit">
                {editingId ? 'Update Group' : 'Add Group'}
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
              <strong>All Groups</strong>
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
                  {groups.map((grp) => (
                    <CTableRow key={grp.id}>
                      <CTableDataCell>{grp.name}</CTableDataCell>
                      <CTableDataCell>{grp.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(grp.id)}>
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

export default GroupTitle
