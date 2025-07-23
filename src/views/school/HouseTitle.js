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

const HouseTitle = () => {
  const [houseName, setHouseName] = useState('')
  const [sequence, setSequence] = useState('')
  const [houses, setHouses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchHouses()
  }, [])

  const fetchHouses = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('house/all')
      setHouses(data)
    } catch (error) {
      console.error('Error fetching houses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!houseName.trim() || !sequence.trim()) {
      alert('Please fill all fields')
      return
    }

    setSubmitting(true)
    const newHouse = { name: houseName.trim(), sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('house/update', editingId, newHouse)
        setEditingId(null)
      } else {
        await apiService.create('house/add', newHouse)
      }
      await fetchHouses()
      handleClear()
    } catch (error) {
      console.error('Error saving house:', error)
      alert('Error saving house. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const houseToEdit = houses.find((hse) => hse.id === id)
    if (houseToEdit) {
      setHouseName(houseToEdit.name)
      setSequence(houseToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this house?')) return

    try {
      await apiService.delete(`house/delete/${id}`)
      await fetchHouses()
    } catch (error) {
      console.error('Error deleting house:', error)
      alert('Error deleting house. Please try again.')
    }
  }

  const handleClear = () => {
    setHouseName('')
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
                <h6 className="mb-0 fw-bold text-primary">House Management</h6>
                <small className="text-muted">Add, edit, and manage school houses</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{houses.length} Houses</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading houses...</span>
              </div>
            ) : (
              <CRow className="g-2">
                {/* Form Section */}
                <CCol lg={4} md={12} className="border-end">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingId ? '✏️ Edit House' : '➕ Add New House'}
                  </h6>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="House Name"
                          type="text"
                          id="houseName"
                          placeholder="Enter house name (e.g., Red, Blue, Green, Yellow)"
                          value={houseName}
                          onChange={(e) => setHouseName(e.target.value)}
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
                              'Update House'
                            ) : (
                              'Add House'
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
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">🏠 All Houses</h6>

                  {houses.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>🏠</div>
                      <p className="mb-0">No houses added yet</p>
                      <small>Add your first house using the form</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              House Name
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
                          {houses
                            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                            .map((hse) => (
                              <CTableRow
                                key={hse.id}
                                className={`align-middle ${editingId === hse.id ? 'table-warning' : ''}`}
                              >
                                <CTableDataCell className="py-2 px-3">
                                  <div className="fw-semibold text-muted">{hse.name}</div>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge color="secondary" className="text-white">
                                    #{hse.sequenceNumber}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3 text-center">
                                  <CButtonGroup size="sm">
                                    <CButton
                                      color="outline-warning"
                                      onClick={() => handleEdit(hse.id)}
                                      disabled={submitting}
                                      title="Edit house"
                                    >
                                      ✏️
                                    </CButton>
                                    <CButton
                                      color="outline-danger"
                                      onClick={() => handleDelete(hse.id)}
                                      disabled={submitting}
                                      title="Delete house"
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

export default HouseTitle
