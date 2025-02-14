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
  { id: 1, accountType: 'Assets', accountName: 'Bank Account', sequence: 100 },
  { id: 2, accountType: 'Liabilities', accountName: 'Loan Payable', sequence: 200 },
  { id: 3, accountType: 'Equity', accountName: 'Owner’s Equity', sequence: 300 },
  { id: 4, accountType: 'Revenue', accountName: 'Service Revenue', sequence: 400 },
  { id: 5, accountType: 'Expenses', accountName: 'Office Supplies', sequence: 500 },
  { id: 6, accountType: 'Assets', accountName: 'Cash in Hand', sequence: 110 },
  { id: 7, accountType: 'Liabilities', accountName: 'Accounts Payable', sequence: 210 },
  { id: 8, accountType: 'Equity', accountName: 'Retained Earnings', sequence: 310 },
  { id: 9, accountType: 'Revenue', accountName: 'Sales Revenue', sequence: 410 },
  { id: 10, accountType: 'Expenses', accountName: 'Utility Bills', sequence: 510 },
  { id: 11, accountType: 'Assets', accountName: 'Investment Account', sequence: 120 },
  { id: 12, accountType: 'Liabilities', accountName: 'Mortgage Payable', sequence: 220 },
  { id: 13, accountType: 'Equity', accountName: 'Stock Capital', sequence: 320 },
  { id: 14, accountType: 'Revenue', accountName: 'Interest Revenue', sequence: 420 },
  { id: 15, accountType: 'Expenses', accountName: 'Travel Expenses', sequence: 520 },
  { id: 16, accountType: 'Assets', accountName: 'Inventory', sequence: 130 },
  { id: 17, accountType: 'Liabilities', accountName: 'Deferred Revenue', sequence: 230 },
  { id: 18, accountType: 'Equity', accountName: 'Dividends', sequence: 330 },
  { id: 19, accountType: 'Revenue', accountName: 'Rent Income', sequence: 430 },
  { id: 20, accountType: 'Expenses', accountName: 'Marketing Expenses', sequence: 530 },
]

const BalanceHeadL1 = () => {
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('')
  const [sequence, setSequence] = useState('')
  const [accounts, setAccounts] = useState(initialAccounts)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!accountName || !accountType || !sequence) return

    if (editingId !== null) {
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingId
            ? { id: editingId, accountType, accountName, sequence: parseInt(sequence) }
            : acc,
        ),
      )
      setEditingId(null)
    } else {
      const newAccount = {
        id: accounts.length + 1,
        accountType,
        accountName,
        sequence: parseInt(sequence),
      }
      setAccounts([...accounts, newAccount])
    }

    setAccountName('')
    setAccountType('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const accToEdit = accounts.find((acc) => acc.id === id)
    if (accToEdit) {
      setAccountName(accToEdit.accountName)
      setAccountType(accToEdit.accountType)
      setSequence(accToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setAccountName('')
    setAccountType('')
    setSequence('')
    setEditingId(null)
  }

  const filteredAccounts = accounts.filter(
    (acc) =>
      (filterType ? acc.accountType === filterType : true) &&
      (searchTerm ? acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) : true),
  )

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
                <CFormLabel>Account Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Account Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Account Type</CFormLabel>
                <CFormSelect value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="Assets">Assets</option>
                  <option value="Liabilities">Liabilities</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Sequence Number"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
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
                  <CTableHeaderCell>Account Name</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Sequence</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredAccounts.map((acc) => (
                  <CTableRow key={acc.id}>
                    <CTableDataCell>{acc.accountName}</CTableDataCell>
                    <CTableDataCell>{acc.accountType}</CTableDataCell>
                    <CTableDataCell>{acc.sequence}</CTableDataCell>
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

export default BalanceHeadL1
