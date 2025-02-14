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
  CFormSelect,
} from '@coreui/react'

const initialAccounts = [
  {
    id: 1,
    accountTitle: 'Cash Fees',
    accountType: 'Assets',
    debit: 2000,
    credit: 5000,
  },
]

const OpeningBalance = () => {
  // Separate form states for accountTitle, accountType, debit, and credit.
  const [accountTitle, setAccountTitle] = useState('')
  const [accountType, setAccountType] = useState('')
  const [debit, setDebit] = useState('')
  const [credit, setCredit] = useState('')

  // Data list
  const [accounts, setAccounts] = useState(initialAccounts)

  // Track editing ID
  const [editingId, setEditingId] = useState(null)

  // Search filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!accountTitle || !accountType) {
      return
    }

    if (editingId !== null) {
      // Update existing record
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingId
            ? {
                ...acc,
                accountTitle,
                accountType,
                debit: parseFloat(debit) || 0,
                credit: parseFloat(credit) || 0,
              }
            : acc,
        ),
      )
      setEditingId(null)
    } else {
      // Create new record
      const newAccount = {
        id: accounts.length + 1,
        accountTitle,
        accountType,
        debit: parseFloat(debit) || 0,
        credit: parseFloat(credit) || 0,
      }
      setAccounts([...accounts, newAccount])
    }

    clearForm()
  }

  const clearForm = () => {
    setAccountTitle('')
    setAccountType('')
    setDebit('')
    setCredit('')
  }

  const handleEdit = (id) => {
    const accToEdit = accounts.find((acc) => acc.id === id)
    if (accToEdit) {
      setEditingId(accToEdit.id)
      setAccountTitle(accToEdit.accountTitle || '')
      setAccountType(accToEdit.accountType || '')
      setDebit(accToEdit.debit?.toString() || '')
      setCredit(accToEdit.credit?.toString() || '')
    }
  }

  const handleClearEdit = () => {
    setEditingId(null)
    clearForm()
  }

  const filteredAccounts = accounts.filter(
    (acc) =>
      (filterType ? acc.accountType === filterType : true) &&
      (searchTerm
        ? acc.accountTitle?.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Opening Balance' : 'Add Opening Balance'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Account Title</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Account Title"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Account Type</CFormLabel>
                <CFormSelect value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="Assets">Assets</option>
                  <option value="Liabilities">Liabilities</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Debit</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Debit Amount"
                  value={debit}
                  onChange={(e) => setDebit(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Credit</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Credit Amount"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                />
              </CCol>
              <CCol xs={12}>
                <CButton color={editingId ? 'warning' : 'success'} type="submit">
                  {editingId ? 'Update Account' : 'Add Account'}
                </CButton>
                {editingId && (
                  <CButton color="secondary" className="ms-2" onClick={handleClearEdit}>
                    Clear
                  </CButton>
                )}
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CFormInput
              type="text"
              placeholder="Search by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Account Title</CTableHeaderCell>
                  <CTableHeaderCell>Account Type</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredAccounts.map((acc) => (
                  <CTableRow key={acc.id}>
                    <CTableDataCell>{acc.accountTitle}</CTableDataCell>
                    <CTableDataCell>{acc.accountType}</CTableDataCell>
                    <CTableDataCell>{acc.debit}</CTableDataCell>
                    <CTableDataCell>{acc.credit}</CTableDataCell>
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
  )
}

export default OpeningBalance
