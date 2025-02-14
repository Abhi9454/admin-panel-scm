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

const initialCashTransactions = [
  {
    id: 1,
    date: '22-12-2024',
    accountHead: 'Cash Fees',
    narration: 'Assets',
    amount: 12000,
    status: 'Accepted',
  },
]

const CashTransaction = () => {
  // Separate states for the form fields
  const [date, setDate] = useState('')
  const [accountHead, setAccountHead] = useState('')
  const [narration, setNarration] = useState('')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('')

  // Data list
  const [cashTransactions, setCashTransactions] = useState(initialCashTransactions)

  // Track editing ID
  const [editingTransactionId, setEditingTransactionId] = useState(null)

  // Search/filter
  const [searchTerm, setSearchTerm] = useState('')

  // For additional filters
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!date || !accountHead || !narration || !amount || !status) {
      return
    }

    if (editingTransactionId !== null) {
      // Update existing record
      setCashTransactions((prev) =>
        prev.map((txn) =>
          txn.id === editingTransactionId
            ? {
                ...txn,
                date,
                accountHead,
                narration,
                amount: parseFloat(amount) || 0,
                status,
              }
            : txn,
        ),
      )
      setEditingTransactionId(null)
    } else {
      // Create new record
      const newTxn = {
        id: cashTransactions.length + 1,
        date,
        accountHead,
        narration,
        amount: parseFloat(amount) || 0,
        status,
      }
      setCashTransactions([...cashTransactions, newTxn])
    }

    clearForm()
  }

  // Clear form fields
  const clearForm = () => {
    setDate('')
    setAccountHead('')
    setNarration('')
    setAmount('')
    setStatus('')
  }

  // Edit functionality
  const handleEdit = (id) => {
    const txnToEdit = cashTransactions.find((txn) => txn.id === id)
    if (txnToEdit) {
      setEditingTransactionId(id)
      setDate(txnToEdit.date || '')
      setAccountHead(txnToEdit.accountHead || '')
      setNarration(txnToEdit.narration || '')
      setAmount(txnToEdit.amount?.toString() || '')
      setStatus(txnToEdit.status || '')
    }
  }

  // Clear edit form
  const handleClearEdit = () => {
    setEditingTransactionId(null)
    clearForm()
  }

  // Filter transactions
  const filteredTransactions = cashTransactions.filter((txn) => {
    // 1) Filter by date if provided
    if (filterDate && txn.date !== filterDate) {
      return false
    }

    // 2) Filter by status if provided
    if (filterStatus && txn.status !== filterStatus) {
      return false
    }

    // 3) Filter by search term if provided
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      if (
        !(
          txn.accountHead.toLowerCase().includes(lowerSearch) ||
          txn.narration.toLowerCase().includes(lowerSearch) ||
          txn.status.toLowerCase().includes(lowerSearch) ||
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
            <strong>
              {editingTransactionId ? 'Edit Cash Transaction' : 'Add Cash Transaction'}
            </strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Account Head</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Account Head"
                  value={accountHead}
                  onChange={(e) => setAccountHead(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Narration</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Narration"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Amount</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <CFormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Select Status</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12}>
                <CButton color={editingTransactionId ? 'warning' : 'success'} type="submit">
                  {editingTransactionId ? 'Update Transaction' : 'Add Transaction'}
                </CButton>
                {editingTransactionId && (
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
              <CCol md={4}>
                <CFormInput
                  type="text"
                  placeholder="Search Transactions"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormInput
                  type="date"
                  placeholder="Filter by Date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </CFormSelect>
              </CCol>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Account Head</CTableHeaderCell>
                  <CTableHeaderCell>Narration</CTableHeaderCell>
                  <CTableHeaderCell>Amount</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredTransactions.map((txn) => (
                  <CTableRow key={txn.id}>
                    <CTableDataCell>{txn.date}</CTableDataCell>
                    <CTableDataCell>{txn.accountHead}</CTableDataCell>
                    <CTableDataCell>{txn.narration}</CTableDataCell>
                    <CTableDataCell>{txn.amount}</CTableDataCell>
                    <CTableDataCell>{txn.status}</CTableDataCell>
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

export default CashTransaction
