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

const initialHostel = [
  { id: 1, name: 'Hostel 1', sequence: 3, students: 45 },
  { id: 2, name: 'Hostel 2', sequence: 2, students: 40 },
]

const HostelTitle = () => {
  const [hostelName, setHostelName] = useState('')
  const [sequence, setSequence] = useState('')
  const [hostels, setHostels] = useState(initialHostel)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!hostelName || !sequence) return

    if (editingId !== null) {
      setHostels(
        hostels.map((hst) =>
          hst.id === editingId
            ? { id: editingId, name: hostelName, sequence: parseInt(sequence) }
            : hst,
        ),
      )
      setEditingId(null)
    } else {
      const newHostel = {
        id: hostels.length + 1,
        name: hostelName,
        sequence: parseInt(sequence),
      }
      setHostels([...hostels, newHostel])
    }

    setHostelName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const hostelToEdit = hostels.find((hst) => hst.id === id)
    if (hostelToEdit) {
      setHostelName(hostelToEdit.name)
      setSequence(hostelToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setHostelName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Hostel' : 'Add New Hostel'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="hostelName">Hostel Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="hostelName"
                  placeholder="Enter Hostel Name"
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
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
                {editingId ? 'Update Hostel' : 'Add Hostel'}
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
              <strong>All Hostels</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Hostel Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {hostels.map((hst) => (
                    <CTableRow key={hst.id}>
                      <CTableDataCell>{hst.name}</CTableDataCell>
                      <CTableDataCell>{hst.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(hst.id)}>
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

export default HostelTitle
