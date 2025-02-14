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
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

// Sample transaction data
const initialTransactions = [
  {
    id: 1,
    date: '2023-05-01',
    time: '10:00',
    accountHead: 'Tuition Fees',
    transactionType: 'Fees Payment',
    narration: 'Semester fees collected',
    amount: 1500,
  },
  {
    id: 2,
    date: '2023-05-02',
    time: '14:45',
    accountHead: 'Library Fees',
    transactionType: 'Late Fee Payment',
    narration: 'Overdue book returns',
    amount: 100,
  },
  {
    id: 3,
    date: '2023-05-05',
    time: '09:30',
    accountHead: 'Sports Fees',
    transactionType: 'Activity Fee',
    narration: 'Cricket tournament registration',
    amount: 300,
  },
  {
    id: 4,
    date: '2023-05-10',
    time: '11:00',
    accountHead: 'Bus Fees',
    transactionType: 'Transportation Fee',
    narration: 'Monthly bus pass renewal',
    amount: 400,
  },
  {
    id: 5,
    date: '2023-05-11',
    time: '16:15',
    accountHead: 'Hostel Fees',
    transactionType: 'Accommodation Fee',
    narration: 'Monthly hostel rent',
    amount: 2000,
  },
]

const CashBook = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [transactions] = useState(initialTransactions)
  const [filteredList, setFilteredList] = useState([])

  // For the details modal
  const [viewingTransaction, setViewingTransaction] = useState(null)

  // Triggered when user clicks the 'View' button
  const handleView = (e) => {
    e.preventDefault()

    // Simple validation: both dates must be provided
    if (!startDate || !endDate) {
      return
    }

    // Filter transactions within date range [startDate, endDate]
    const filtered = transactions.filter((txn) => {
      // Compare as strings or convert to Date objects
      // E.g. "2023-05-01" < "2023-05-10"
      return txn.date >= startDate && txn.date <= endDate
    })

    setFilteredList(filtered)
  }

  const handleDetails = (txn) => {
    setViewingTransaction(txn)
  }

  const closeModal = () => {
    setViewingTransaction(null)
  }

  return (
    <CRow>
      {/* Date Range Section */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Filter Cash Transactions</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleView} className="row g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="startDate">Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="endDate">End Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  View
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Filtered Transactions Table */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Cash Transactions</strong>
          </CCardHeader>
          <CCardBody>
            {filteredList.length === 0 ? (
              <p>No transactions found in this date range.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell>Account Head</CTableHeaderCell>
                    <CTableHeaderCell>Type of Transaction</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredList.map((txn) => (
                    <CTableRow key={txn.id}>
                      <CTableDataCell>{txn.date}</CTableDataCell>
                      <CTableDataCell>{txn.time}</CTableDataCell>
                      <CTableDataCell>{txn.accountHead}</CTableDataCell>
                      <CTableDataCell>{txn.transactionType}</CTableDataCell>
                      <CTableDataCell>{txn.amount}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="info" onClick={() => handleDetails(txn)}>
                          Details
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Details Modal */}
      {viewingTransaction && (
        <CModal visible={true} onClose={closeModal}>
          <CModalHeader>Transaction Details</CModalHeader>
          <CModalBody>
            <p>
              <strong>Date:</strong> {viewingTransaction.date}
            </p>
            <p>
              <strong>Time:</strong> {viewingTransaction.time}
            </p>
            <p>
              <strong>Account Head:</strong> {viewingTransaction.accountHead}
            </p>
            <p>
              <strong>Type of Transaction:</strong> {viewingTransaction.transactionType}
            </p>
            <p>
              <strong>Narration:</strong> {viewingTransaction.narration}
            </p>
            <p>
              <strong>Amount:</strong> {viewingTransaction.amount}
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={closeModal}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </CRow>
  )
}

export default CashBook
