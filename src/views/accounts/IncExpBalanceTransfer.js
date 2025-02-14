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

// 6 sample data for account transfers
const initialTransfers = [
  {
    id: 1,
    date: '2023-01-10',
    fromAccount: 'Cash',
    toAccount: 'Bank',
    balance: 1000,
  },
  {
    id: 2,
    date: '2023-01-15',
    fromAccount: 'Revenue',
    toAccount: 'Cash',
    balance: 2000,
  },
  {
    id: 3,
    date: '2023-02-10',
    fromAccount: 'Assets',
    toAccount: 'Expenses',
    balance: 500,
  },
  {
    id: 4,
    date: '2023-02-15',
    fromAccount: 'Bank',
    toAccount: 'Equity',
    balance: 700,
  },
  {
    id: 5,
    date: '2023-03-01',
    fromAccount: 'Liabilities',
    toAccount: 'Revenue',
    balance: 1200,
  },
  {
    id: 6,
    date: '2023-03-05',
    fromAccount: 'Cash',
    toAccount: 'Expenses',
    balance: 600,
  },
]

const IncExpBalanceTransfer = () => {
  // Separate states for the form fields
  const [date, setDate] = useState('')
  const [fromAccount, setFromAccount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [balance, setBalance] = useState('')

  // Data list
  const [transfers, setTransfers] = useState(initialTransfers)

  // Track editing ID
  const [editingId, setEditingId] = useState(null)

  // Filter/search states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!date || !fromAccount || !toAccount || !balance) {
      return
    }

    if (editingId !== null) {
      // Update existing record
      setTransfers((prev) =>
        prev.map((txn) =>
          txn.id === editingId
            ? {
                ...txn,
                date,
                fromAccount,
                toAccount,
                balance: parseFloat(balance) || 0,
              }
            : txn,
        ),
      )
      setEditingId(null)
    } else {
      // Create new record
      const newTransfer = {
        id: transfers.length + 1,
        date,
        fromAccount,
        toAccount,
        balance: parseFloat(balance) || 0,
      }
      setTransfers([...transfers, newTransfer])
    }

    clearForm()
  }

  // Clear form fields
  const clearForm = () => {
    setDate('')
    setFromAccount('')
    setToAccount('')
    setBalance('')
  }

  // Edit functionality
  const handleEdit = (id) => {
    const transferToEdit = transfers.find((t) => t.id === id)
    if (transferToEdit) {
      setEditingId(id)
      setDate(transferToEdit.date)
      setFromAccount(transferToEdit.fromAccount)
      setToAccount(transferToEdit.toAccount)
      setBalance(transferToEdit.balance.toString())
    }
  }

  // Clear edit form
  const handleClearEdit = () => {
    setEditingId(null)
    clearForm()
  }

  // Filter transactions
  const filteredTransfers = transfers.filter((txn) => {
    // 1) Filter by date if provided
    if (filterDate && txn.date !== filterDate) {
      return false
    }
    // 2) Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      if (
        !(
          txn.fromAccount.toLowerCase().includes(lowerSearch) ||
          txn.toAccount.toLowerCase().includes(lowerSearch) ||
          txn.date.toLowerCase().includes(lowerSearch)
        )
      ) {
        return false
      }
    }
    return true
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Balance Transfer' : 'Add Balance Transfer'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </CCol>
              <CCol md={6}>
                <CFormLabel>From Account</CFormLabel>
                <CFormSelect value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                  <option value="">Select Account</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Equity">Equity</option>
                  <option value="Liabilities">Liabilities</option>
                  <option value="Assets">Assets</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>To Account</CFormLabel>
                <CFormSelect value={toAccount} onChange={(e) => setToAccount(e.target.value)}>
                  <option value="">Select Account</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Equity">Equity</option>
                  <option value="Liabilities">Liabilities</option>
                  <option value="Assets">Assets</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Balance</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Balance Amount"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </CCol>
              <CCol xs={12}>
                <CButton color={editingId ? 'warning' : 'success'} type="submit">
                  {editingId ? 'Update Transfer' : 'Add Transfer'}
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
            <div className="row g-3">
              <CCol md={6}>
                <CFormInput
                  type="text"
                  placeholder="Search Transfers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="date"
                  placeholder="Filter by Date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </CCol>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>From Account</CTableHeaderCell>
                  <CTableHeaderCell>To Account</CTableHeaderCell>
                  <CTableHeaderCell>Balance</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredTransfers.map((txn) => (
                  <CTableRow key={txn.id}>
                    <CTableDataCell>{txn.date}</CTableDataCell>
                    <CTableDataCell>{txn.fromAccount}</CTableDataCell>
                    <CTableDataCell>{txn.toAccount}</CTableDataCell>
                    <CTableDataCell>{txn.balance}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEdit(txn.id)}>
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

export default IncExpBalanceTransfer
