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
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/academicsManagementApi' // Import API service

const RemarksMaster = () => {
  const [remarks, setRemarks] = useState('')
  const [gender, setGender] = useState('')
  const [sequence, setSequence] = useState('')
  const [remarksList, setRemarksList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRemarks()
  }, [])

  const fetchRemarks = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('remarks-master/all')
      setRemarksList(data)
    } catch (error) {
      console.error('Error fetching remarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!remarks || gender === '' || !sequence) return
    setLoading(true)
    const newRemark = {
      remarks: remarks,
      gender: parseInt(gender),
      sequenceNumber: parseInt(sequence),
    }

    try {
      if (editingId !== null) {
        await apiService.update('remarks-master/update', editingId, newRemark)
        setEditingId(null)
      } else {
        await apiService.create('remarks-master/add', newRemark)
      }
      await fetchRemarks()
      handleClear()
    } catch (error) {
      console.error('Error saving remark:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    const remarkToEdit = remarksList.find((remark) => remark.id === id)
    if (remarkToEdit) {
      setRemarks(remarkToEdit.remarks)
      setGender(remarkToEdit.gender.toString())
      setSequence(remarkToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`remarks-master/delete/${id}`)
      fetchRemarks()
    } catch (error) {
      console.error('Error deleting remark:', error)
    }
  }

  const handleClear = () => {
    setRemarks('')
    setGender('')
    setSequence('')
    setEditingId(null)
  }

  const getGenderText = (genderValue) => {
    return genderValue === 0 ? 'Male' : genderValue === 1 ? 'Female' : 'Unknown'
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Remarks' : 'Add New Remarks'}</strong>
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
                  <CRow>
                    <CCol md={12}>
                      <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                      <CFormInput
                        type="text"
                        id="remarks"
                        placeholder="Enter Remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </CCol>
                  </CRow>
                </div>
                <div className="mb-3">
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel htmlFor="gender">Gender</CFormLabel>
                      <CFormSelect
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="">Select Gender</option>
                        <option value="0">Male</option>
                        <option value="1">Female</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="sequence">Sequence Number</CFormLabel>
                      <CFormInput
                        type="number"
                        id="sequence"
                        placeholder="Enter Sequence Number"
                        value={sequence}
                        onChange={(e) => setSequence(e.target.value)}
                      />
                    </CCol>
                  </CRow>
                </div>
                <CButton color={editingId ? 'warning' : 'success'} type="submit">
                  {editingId ? 'Update Remarks' : 'Add Remarks'}
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
              <strong>All Remarks</strong>
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
                      <CTableHeaderCell scope="col">S.No</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Gender</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Remarks</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Sq No</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {remarksList.map((remark, index) => (
                      <CTableRow key={remark.id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{getGenderText(remark.gender)}</CTableDataCell>
                        <CTableDataCell>{remark.remarks}</CTableDataCell>
                        <CTableDataCell>{remark.sequenceNumber}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="warning"
                            className="me-2"
                            onClick={() => handleEdit(remark.id)}
                          >
                            Edit
                          </CButton>
                          <CButton color="danger" onClick={() => handleDelete(remark.id)}>
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

export default RemarksMaster
