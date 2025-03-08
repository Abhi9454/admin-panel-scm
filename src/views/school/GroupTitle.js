import React, { useState, useEffect } from 'react'
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
import apiService from '../../api/schoolManagementApi' // Import API service

const GroupTitle = () => {
  const [groupName, setGroupName] = useState('')
  const [sequence, setSequence] = useState('')
  const [groups, setGroups] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const data = await apiService.getAll('group/all') // Fetch all groups
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!groupName || !sequence) return

    const newGroup = { name: groupName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('group/update', editingId, newGroup) // Update group
        setEditingId(null)
      } else {
        await apiService.create('group/add', newGroup) // Create group
      }
      await fetchGroups() // Refresh list
      handleClear()
    } catch (error) {
      console.error('Error saving group:', error)
    }
  }

  const handleEdit = (id) => {
    const groupToEdit = groups.find((grp) => grp.id === id)
    if (groupToEdit) {
      setGroupName(groupToEdit.name)
      setSequence(groupToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`group/delete/${id}`) // Delete group
      fetchGroups() // Refresh list
    } catch (error) {
      console.error('Error deleting group:', error)
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
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
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
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {groups.map((grp) => (
                    <CTableRow key={grp.id}>
                      <CTableDataCell>{grp.name}</CTableDataCell>
                      <CTableDataCell>{grp.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(grp.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(grp.id)}>
                          Delete
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
