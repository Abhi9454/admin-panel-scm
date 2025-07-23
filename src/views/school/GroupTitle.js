import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'

const GroupTitle = () => {
  const [groupName, setGroupName] = useState('')
  const [sequence, setSequence] = useState('')
  const [groups, setGroups] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('group/all')
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!groupName.trim() || !sequence.trim()) {
      alert('Please fill all fields')
      return
    }

    setSubmitting(true)
    const newGroup = { name: groupName.trim(), sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('group/update', editingId, newGroup)
        setEditingId(null)
      } else {
        await apiService.create('group/add', newGroup)
      }
      await fetchGroups()
      handleClear()
    } catch (error) {
      console.error('Error saving group:', error)
      alert('Error saving group. Please try again.')
    } finally {
      setSubmitting(false)
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
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      await apiService.delete(`group/delete/${id}`)
      await fetchGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('Error deleting group. Please try again.')
    }
  }

  const handleClear = () => {
    setGroupName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Group Management</h6>
                <small className="text-muted">Add, edit, and manage student groups</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{groups.length} Groups</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading groups...</span>
              </div>
            ) : (
              <CRow className="g-2">
                {/* Form Section */}
                <CCol lg={4} md={12} className="border-end">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingId ? '✏️ Edit Group' : '➕ Add New Group'}
                  </h6>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Group Name"
                          type="text"
                          id="groupName"
                          placeholder="Enter group name (e.g., Science, Arts, Commerce)"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-3"
                          floatingLabel="Sequence Number"
                          type="number"
                          id="sequence"
                          placeholder="Enter sequence number for ordering"
                          value={sequence}
                          onChange={(e) => setSequence(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <div className="d-flex gap-2">
                          <CButton
                            color={editingId ? 'warning' : 'success'}
                            type="submit"
                            size="sm"
                            disabled={submitting}
                            className="flex-grow-1"
                          >
                            {submitting ? (
                              <>
                                <CSpinner size="sm" className="me-1" />
                                {editingId ? 'Updating...' : 'Adding...'}
                              </>
                            ) : editingId ? (
                              'Update Group'
                            ) : (
                              'Add Group'
                            )}
                          </CButton>
                          {editingId && (
                            <CButton
                              color="outline-secondary"
                              size="sm"
                              onClick={handleClear}
                              disabled={submitting}
                            >
                              Cancel
                            </CButton>
                          )}
                        </div>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCol>

                {/* Table Section */}
                <CCol lg={8} md={12}>
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">👥 All Groups</h6>

                  {groups.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>👥</div>
                      <p className="mb-0">No groups added yet</p>
                      <small>Add your first group using the form</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Group Name
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Sequence
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                              Actions
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {groups
                            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                            .map((grp) => (
                              <CTableRow
                                key={grp.id}
                                className={`align-middle ${editingId === grp.id ? 'table-warning' : ''}`}
                              >
                                <CTableDataCell className="py-2 px-3">
                                  <div className="fw-semibold text-muted">{grp.name}</div>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge color="secondary" className="text-white">
                                    #{grp.sequenceNumber}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3 text-center">
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="outline-warning"
                                      onClick={() => handleEdit(grp.id)}
                                      disabled={submitting}
                                      title="Edit group"
                                    >
                                      ✏️
                                    </CButton>
                                    <CButton
                                      color="outline-danger"
                                      onClick={() => handleDelete(grp.id)}
                                      disabled={submitting}
                                      title="Delete group"
                                    >
                                      🗑️
                                    </CButton>
                                  </CButtonGroup>
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  )}
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GroupTitle
