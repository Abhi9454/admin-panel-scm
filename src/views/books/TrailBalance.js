import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormSelect,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter
} from '@coreui/react'

// Sample records for Jan 2025
const sampleRecords = [
  {
    id: 1,
    date: '2025-01-01',
    accountHead: 'Assets',
    narration: 'Opening Balance',
    debit: 1500,
    credit: 0
  },
  {
    id: 2,
    date: '2025-01-05',
    accountHead: 'Liabilities',
    narration: 'Loan Repayment',
    debit: 0,
    credit: 300
  },
  {
    id: 3,
    date: '2025-01-10',
    accountHead: 'Revenue',
    narration: 'Fees Collection',
    debit: 0,
    credit: 600
  },
  {
    id: 4,
    date: '2025-01-12',
    accountHead: 'Expenses',
    narration: 'Stationery Purchase',
    debit: 80,
    credit: 0
  }
]

const TrailBalance = () => {
  const [tbType, setTbType] = useState('') // 'Trail Balance' or 'Trail Balance Detail'
  const [accountHeadLevel, setAccountHeadLevel] = useState('') // 'Account Head L1' or 'Account Head L2'
  const [transactionType, setTransactionType] = useState('') // 'cash', 'journal', 'total'
  const [selectedDate, setSelectedDate] = useState('')
  const [filteredRecords, setFilteredRecords] = useState(sampleRecords)

  const [viewingRecord, setViewingRecord] = useState(null)

  const handleViewDetails = (record) => {
    setViewingRecord(record)
  }

  const handleCloseModal = () => {
    setViewingRecord(null)
  }

  const handlePrint = (record) => {
    // Logic to print or open print preview
    console.log('Printing record:', record)
  }

  // Handle the View button to filter results
  const handleFilter = (e) => {
    e.preventDefault()

    // Example filter logic: filter by date and transactionType
    // Expand or modify as needed to incorporate tbType, accountHeadLevel, etc.
    let results = sampleRecords

    // If user selected a date, filter by that date
    if (selectedDate) {
      results = results.filter((rec) => rec.date === selectedDate)
    }

    // If user chose a transaction type
    // This example code doesn't have transactionType in sampleRecords,
    // but if it did, you'd do something like:
    // if (transactionType) {
    //   results = results.filter((rec) => rec.txType === transactionType)
    // }

    // Similarly for tbType or accountHeadLevel if needed.

    setFilteredRecords(results)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Trail Balance</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3" onSubmit={handleFilter}>
              {/* 1. Trail Balance or Trail Balance Detail */}
              <CCol md={6}>
                <CFormLabel>Select Type</CFormLabel>
                <CFormSelect value={tbType} onChange={(e) => setTbType(e.target.value)}>
                  <option value="">-- Choose --</option>
                  <option value="Trail Balance">Trail Balance</option>
                  <option value="Trail Balance Detail">Trail Balance Detail</option>
                </CFormSelect>
              </CCol>

              {/* 2. Account Head Level */}
              <CCol md={6}>
                <CFormLabel>Account Head Level</CFormLabel>
                <CFormSelect
                  value={accountHeadLevel}
                  onChange={(e) => setAccountHeadLevel(e.target.value)}
                >
                  <option value="">-- Choose --</option>
                  <option value="Account Head L1">Account Head L1</option>
                  <option value="Account Head L2">Account Head L2</option>
                </CFormSelect>
              </CCol>

              {/* 3. Radio Buttons for Cash / Journal / Total */}
              <CCol md={6}>
                <CFormLabel>Transaction Type</CFormLabel>
                <div>
                  <CFormCheck
                    type="radio"
                    name="transactionType"
                    id="cash"
                    label="Cash"
                    value="cash"
                    checked={transactionType === 'cash'}
                    onChange={(e) => setTransactionType(e.target.value)}
                  />
                  <CFormCheck
                    type="radio"
                    name="transactionType"
                    id="journal"
                    label="Journal"
                    value="journal"
                    checked={transactionType === 'journal'}
                    onChange={(e) => setTransactionType(e.target.value)}
                  />
                  <CFormCheck
                    type="radio"
                    name="transactionType"
                    id="total"
                    label="Total Transaction"
                    value="total"
                    checked={transactionType === 'total'}
                    onChange={(e) => setTransactionType(e.target.value)}
                  />
                </div>
              </CCol>

              {/* 4. Date input */}
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </CCol>

              {/* View Button */}
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  View
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Table with filtered records */}
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Records for Jan 2025</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Account Head</CTableHeaderCell>
                  <CTableHeaderCell>Narration</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredRecords.map((rec) => (
                  <CTableRow key={rec.id}>
                    <CTableDataCell>{rec.date}</CTableDataCell>
                    <CTableDataCell>{rec.accountHead}</CTableDataCell>
                    <CTableDataCell>{rec.narration}</CTableDataCell>
                    <CTableDataCell>{rec.debit}</CTableDataCell>
                    <CTableDataCell>{rec.credit}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="info" className="me-2" onClick={() => handleViewDetails(rec)}>
                        View Details
                      </CButton>
                      <CButton color="secondary" onClick={() => handlePrint(rec)}>
                        Print
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal for record details */}
      {viewingRecord && (
        <CModal visible={true} onClose={handleCloseModal}>
          <CModalHeader>Record Details</CModalHeader>
          <CModalBody>
            <p>
              <strong>Date:</strong> {viewingRecord.date}
            </p>
            <p>
              <strong>Account Head:</strong> {viewingRecord.accountHead}
            </p>
            <p>
              <strong>Narration:</strong> {viewingRecord.narration}
            </p>
            <p>
              <strong>Debit:</strong> {viewingRecord.debit}
            </p>
            <p>
              <strong>Credit:</strong> {viewingRecord.credit}
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </CRow>
  )
}

export default TrailBalance
