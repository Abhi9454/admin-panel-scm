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

// Sample data for day-wise transactions
const sampleDayData = [
  {
    id: 1,
    date: '2025-02-01', // 'YYYY-MM-DD' format
    time: '08:30',
    transactionType: 'Fees Collection',
    narration: 'Morning shift fees',
    amount: 500,
  },
  {
    id: 2,
    date: '2025-02-01',
    time: '10:15',
    transactionType: 'Expenses',
    narration: 'Purchased office supplies',
    amount: 150,
  },
  {
    id: 3,
    date: '2025-02-02',
    time: '09:00',
    transactionType: 'Revenue',
    narration: 'Sports event registration fees',
    amount: 300,
  },
  {
    id: 4,
    date: '2025-02-02',
    time: '11:45',
    transactionType: 'Expenses',
    narration: 'Snacks for staff meeting',
    amount: 80,
  },
  {
    id: 5,
    date: '2025-02-03',
    time: '14:00',
    transactionType: 'Fees Collection',
    narration: 'Library fees payment',
    amount: 100,
  },
]

const DepreciationDetails = () => {
  const [filterDate, setFilterDate] = useState('')
  const [filteredList, setFilteredList] = useState([])

  // For viewing full details of a transaction
  const [viewingTransaction, setViewingTransaction] = useState(null)

  // Called when user clicks the 'View' button
  const handleView = (e) => {
    e.preventDefault()
    if (!filterDate) return

    // Normalize & compare as YYYY-MM-DD
    const results = sampleDayData.filter((item) => {
      // Convert data’s date to a standard string (already 'YYYY-MM-DD' in sample)
      const recordDate = new Date(item.date).toISOString().split('T')[0]
      // Convert user filterDate similarly (some browsers handle date differently)
      const userDate = new Date(filterDate).toISOString().split('T')[0]

      return recordDate === userDate
    })
    setFilteredList(results)
  }

  // Called when user clicks on 'Details' button
  const handleDetails = (txn) => {
    setViewingTransaction(txn)
  }

  // Close modal
  const closeModal = () => {
    setViewingTransaction(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Depreciation Details</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleView} className="row g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="dayFilter">Select Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="dayFilter"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
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

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Transactions for {filterDate || 'Selected Date'}</strong>
          </CCardHeader>
          <CCardBody>
            {filteredList.length === 0 ? (
              <p>No transactions found for this date.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell>Transaction Type</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredList.map((txn) => (
                    <CTableRow key={txn.id}>
                      <CTableDataCell>{txn.date}</CTableDataCell>
                      <CTableDataCell>{txn.time}</CTableDataCell>
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
              <strong>Transaction Type:</strong> {viewingTransaction.transactionType}
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

export default DepreciationDetails
