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

const initialBuses = [
  { id: 1, name: 'Bus T1', sequence: 3 },
  { id: 2, name: 'Bus T2', sequence: 2 },
]

const BusTitle = () => {
  const [busName, setBusName] = useState('')
  const [sequence, setSequence] = useState('')
  const [buses, setBuses] = useState(initialBuses)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!busName || !sequence) return

    if (editingId !== null) {
      setBuses(
        buses.map((bus) =>
          bus.id === editingId ? { id: editingId, name: busName, sequence: parseInt(sequence) } : bus
        )
      )
      setEditingId(null)
    } else {
      const newBus = {
        id: buses.length + 1,
        name: busName,
        sequence: parseInt(sequence),
      }
      setBuses([...buses, newBus])
    }

    setBusName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const busToEdit = buses.find((bus) => bus.id === id)
    if (busToEdit) {
      setBusName(busToEdit.name)
      setSequence(busToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setBusName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Bus' : 'Add New Bus'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="busName">Bus Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="busName"
                  placeholder="Enter Bus Name"
                  value={busName}
                  onChange={(e) => setBusName(e.target.value)}
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
                {editingId ? 'Update Bus' : 'Add Bus'}
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
              <strong>All Buses</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Bus Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {buses.map((bus) => (
                    <CTableRow key={bus.id}>
                      <CTableDataCell>{bus.name}</CTableDataCell>
                      <CTableDataCell>{bus.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(bus.id)}>
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

export default BusTitle
