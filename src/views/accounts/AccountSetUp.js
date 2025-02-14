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

// Updated initial data with renamed fields
const initialAccounts = [
  { id: 1, cashInHand: 'Cash In Hand', sequenceNumber: 3 },
  { id: 2, cashInHand: 'Bank Balance', sequenceNumber: 2 },
  { id: 3, cashInHand: 'Bank Transfer', sequenceNumber: 4 },
]

const AccountSetUp = () => {
  const [cashInHand, setCashInHand] = useState('')
  const [sequenceNumber, setSequenceNumber] = useState('')
  const [accounts, setAccounts] = useState(initialAccounts)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cashInHand || !sequenceNumber) return

    if (editingId !== null) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingId
            ? {
                id: editingId,
                cashInHand,
                sequenceNumber: parseInt(sequenceNumber),
              }
            : acc,
        ),
      )
      setEditingId(null)
    } else {
      const newAccount = {
        id: accounts.length + 1,
        cashInHand,
        sequenceNumber: parseInt(sequenceNumber),
      }
      setAccounts([...accounts, newAccount])
    }

    setCashInHand('')
    setSequenceNumber('')
  }

  const handleEdit = (id) => {
    const accToEdit = accounts.find((acc) => acc.id === id)
    if (accToEdit) {
      setCashInHand(accToEdit.cashInHand)
      setSequenceNumber(accToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setCashInHand('')
    setSequenceNumber('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Account' : 'Add New Account'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="cashInHand">Cash In Hand</CFormLabel>
                <CFormInput
                  type="text"
                  id="cashInHand"
                  placeholder="Enter Cash In Hand"
                  value={cashInHand}
                  onChange={(e) => setCashInHand(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="sequenceNumber">Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  id="sequenceNumber"
                  placeholder="Enter Sequence Number"
                  value={sequenceNumber}
                  onChange={(e) => setSequenceNumber(e.target.value)}
                />
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Account' : 'Add Account'}
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
              <strong>All Accounts</strong>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Cash In Hand</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence Number</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {accounts.map((acc) => (
                    <CTableRow key={acc.id}>
                      <CTableDataCell>{acc.cashInHand}</CTableDataCell>
                      <CTableDataCell>{acc.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(acc.id)}>
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

export default AccountSetUp
