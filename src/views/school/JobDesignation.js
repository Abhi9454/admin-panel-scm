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
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import masterApi from '../../api/masterApi'

const RESOURCE = 'parent-designations'

const JobDesignation = () => {
  const [jobDesignationName, setJobDesignationName] = useState('')
  const [sequence, setSequence] = useState('')
  const [jobDesignations, setJobDesignations] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchJobDesignations()
  }, [])

  const fetchJobDesignations = async () => {
    try {
      setLoading(true)
      const data = await masterApi.getAll(RESOURCE)
      setJobDesignations(data.results || [])
    } catch (error) {
      console.error('Error fetching job designations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDesignationName || !sequence) return
    setLoading(true)
    const payload = { title: jobDesignationName, seq_order: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await masterApi.update(RESOURCE, editingId, payload)
        setEditingId(null)
      } else {
        await masterApi.create(RESOURCE, payload)
      }
      await fetchJobDesignations()
      handleClear()
    } catch (error) {
      console.error('Error saving job designation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const designationToEdit = jobDesignations.find((desig) => desig.id === id)
    if (designationToEdit) {
      setJobDesignationName(designationToEdit.title)
      setSequence(designationToEdit.seq_order.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await masterApi.delete(RESOURCE, id)
      fetchJobDesignations()
    } catch (error) {
      console.error('Error deleting job designation:', error)
    }
  }

  const handleClear = () => {
    setJobDesignationName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Job Designation' : 'Add New Job Designation'}</strong>
          </CCardHeader>
          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <div className="mb-3">
                  <CFormLabel htmlFor="jobDesignationName">Job Designation Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="jobDesignationName"
                    placeholder="Enter Job Designation Name"
                    value={jobDesignationName}
                    onChange={(e) => setJobDesignationName(e.target.value)}
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
                  {editingId ? 'Update Job Designation' : 'Add Job Designation'}
                </CButton>
                {editingId && (
                  <CButton color="secondary" className="ms-2" onClick={handleClear}>
                    Clear
                  </CButton>
                )}
              </CForm>
            </CCardBody>
          )}
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Job Designations</strong>
            </CCardHeader>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading data...</p>
              </div>
            ) : (
              <CCardBody>
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Job Designation Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {jobDesignations.map((desig) => (
                      <CTableRow key={desig.id}>
                        <CTableDataCell>{desig.title}</CTableDataCell>
                        <CTableDataCell>{desig.seq_order}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            className="me-2"
                            onClick={() => handleEdit(desig.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" onClick={() => handleDelete(desig.id)}>
                            Delete
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            )}
          </CCard>
        </CCol>
      </CRow>
    </CRow>
  )
}

export default JobDesignation
