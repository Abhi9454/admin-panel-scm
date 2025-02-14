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

// Sample ledger data
const sampleLedgerData = [
  {
    id: 1,
    date: '2023-05-01',
    narration: 'Opening Balance',
    debit: 1000,
    credit: 0,
  },
  {
    id: 2,
    date: '2023-05-03',
    narration: 'Fees Collection',
    debit: 0,
    credit: 500,
  },
  {
    id: 3,
    date: '2023-05-08',
    narration: 'Office Supplies Purchase',
    debit: 200,
    credit: 0,
  },
  {
    id: 4,
    date: '2023-05-10',
    narration: 'Misc. Income',
    debit: 0,
    credit: 300,
  },
  {
    id: 5,
    date: '2023-05-15',
    narration: 'Utility Bills',
    debit: 100,
    credit: 0,
  },
  {
    id: 6,
    date: '2023-05-20',
    narration: 'Transport Income',
    debit: 0,
    credit: 200,
  },
]

const LedgerTDS = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredData, setFilteredData] = useState([])

  const handleView = (e) => {
    e.preventDefault()

    // Basic validation
    if (!startDate || !endDate) return

    // Filter the sampleLedgerData by the user-provided date range
    const results = sampleLedgerData.filter((item) => {
      return item.date >= startDate && item.date <= endDate
    })

    setFilteredData(results)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Ledger TDS Transactions</strong>
          </CCardHeader>
          <CCardBody>
            {/* Filter Form */}
            <CForm onSubmit={handleView} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </CCol>
              <CCol xs={12}>
                <CButton type="submit" color="primary">
                  View
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Filtered TDS Ledger Entries</strong>
          </CCardHeader>
          <CCardBody>
            {filteredData.length === 0 ? (
              <p>No transactions found in this date range.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Narration</CTableHeaderCell>
                    <CTableHeaderCell>Debit</CTableHeaderCell>
                    <CTableHeaderCell>Credit</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredData.map((entry) => (
                    <CTableRow key={entry.id}>
                      <CTableDataCell>{entry.date}</CTableDataCell>
                      <CTableDataCell>{entry.narration}</CTableDataCell>
                      <CTableDataCell>{entry.debit}</CTableDataCell>
                      <CTableDataCell>{entry.credit}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default LedgerTDS
