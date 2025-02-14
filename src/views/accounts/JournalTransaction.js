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

// 6 sample data entries
const initialAccounts = [
  {
    id: 1,
    date: '2023-12-01',
    accountTitle: 'Cash Fees',
    narration: 'Assets',
    debit: 2000,
    credit: 5000,
  },
  {
    id: 2,
    date: '2023-12-02',
    accountTitle: 'Bank Deposit',
    narration: 'Deposit from client payments',
    debit: 3000,
    credit: 0,
  },
  {
    id: 3,
    date: '2023-12-03',
    accountTitle: 'Rent Expense',
    narration: 'Office rent payment',
    debit: 1500,
    credit: 0,
  },
  {
    id: 4,
    date: '2023-12-04',
    accountTitle: 'Salary Expense',
    narration: 'Salary for employees',
    debit: 4000,
    credit: 0,
  },
  {
    id: 5,
    date: '2023-12-05',
    accountTitle: 'Consulting Revenue',
    narration: 'Earned from consulting project',
    debit: 0,
    credit: 2500,
  },
  {
    id: 6,
    date: '2023-12-06',
    accountTitle: 'Utilities Expense',
    narration: 'Electricity, Water, etc.',
    debit: 800,
    credit: 0,
  },
]

const JournalTransaction = () => {
  // Separate states for form fields
  const [date, setDate] = useState('')
  const [accountTitle, setAccountTitle] = useState('')
  const [narration, setNarration] = useState('')
  const [debit, setDebit] = useState('')
  const [credit, setCredit] = useState('')

  // Data list
  const [accounts, setAccounts] = useState(initialAccounts)

  // Track editing ID
  const [editingId, setEditingId] = useState(null)

  // Search field
  const [searchTerm, setSearchTerm] = useState('')

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!date || !accountTitle || !narration) {
      return
    }

    if (editingId !== null) {
      // Update existing record
      setAccounts(
        accounts.map((acc) =>
          acc.id === editingId
            ? {
                ...acc,
                date,
                accountTitle,
                narration,
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
        date,
        accountTitle,
        narration,
        debit: parseFloat(debit) || 0,
        credit: parseFloat(credit) || 0,
      }
      setAccounts([...accounts, newAccount])
    }

    clearForm()
  }

  const clearForm = () => {
    setDate('')
    setAccountTitle('')
    setNarration('')
    setDebit('')
    setCredit('')
  }

  const handleEdit = (id) => {
    const accToEdit = accounts.find((acc) => acc.id === id)
    if (accToEdit) {
      setEditingId(accToEdit.id)
      setDate(accToEdit.date || '')
      setAccountTitle(accToEdit.accountTitle || '')
      setNarration(accToEdit.narration || '')
      setDebit(accToEdit.debit?.toString() || '')
      setCredit(accToEdit.credit?.toString() || '')
    }
  }

  const handleClearEdit = () => {
    setEditingId(null)
    clearForm()
  }

  // Filter accounts based on search term in accountTitle or narration
  const filteredAccounts = accounts.filter((acc) => {
    if (!searchTerm) return true
    const lowerSearch = searchTerm.toLowerCase()
    return (
      acc.accountTitle.toLowerCase().includes(lowerSearch) ||
      acc.narration.toLowerCase().includes(lowerSearch)
    )
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Journal Transaction' : 'Add Journal Transaction'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Account Title</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Account Title"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                />
              </CCol>
              <CCol md={12}>
                <CFormLabel>Narration</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Narration"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
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
                  {editingId ? 'Update Transaction' : 'Add Transaction'}
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
              placeholder="Search by Account Title or Narration"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Account Title</CTableHeaderCell>
                  <CTableHeaderCell>Narration</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredAccounts.map((acc) => (
                  <CTableRow key={acc.id}>
                    <CTableDataCell>{acc.date}</CTableDataCell>
                    <CTableDataCell>{acc.accountTitle}</CTableDataCell>
                    <CTableDataCell>{acc.narration}</CTableDataCell>
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

export default JournalTransaction
