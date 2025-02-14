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
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

// Sample data for year 2025
const samplePLData = [
  {
    id: 1,
    date: '2025-01-15',
    accountHead: 'Revenue',
    description: 'Fees Collection',
    amount: 2000,
    type: 'Income',
  },
  {
    id: 2,
    date: '2025-03-10',
    accountHead: 'Expenses',
    description: 'Office Supplies',
    amount: 300,
    type: 'Expense',
  },
  {
    id: 3,
    date: '2025-06-25',
    accountHead: 'Revenue',
    description: 'Donations',
    amount: 500,
    type: 'Income',
  },
  {
    id: 4,
    date: '2025-09-05',
    accountHead: 'Expenses',
    description: 'Maintenance Fees',
    amount: 400,
    type: 'Expense',
  },
  {
    id: 5,
    date: '2025-12-15',
    accountHead: 'Revenue',
    description: 'Consulting Services',
    amount: 1000,
    type: 'Income',
  },
]

const ProfitLossStatement = () => {
  const [statementType, setStatementType] = useState('') // 'Statement Before Balance Transfer' or 'Statement After Balance Transfer'
  const [selectedDate, setSelectedDate] = useState('')
  const [filteredData, setFilteredData] = useState([])

  // Handle View button click
  const handleView = (e) => {
    e.preventDefault()

    // Basic validation
    if (!statementType || !selectedDate) {
      return
    }

    // For simplicity, this example just displays all sample data if the form is filled
    // Expand filter logic as needed.
    setFilteredData(samplePLData)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Profit &amp; Loss Statement</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleView} className="row g-3">
              {/* Select: Statement Before/After Balance Transfer */}
              <CCol md={6}>
                <CFormLabel>Statement Type</CFormLabel>
                <CFormSelect
                  value={statementType}
                  onChange={(e) => setStatementType(e.target.value)}
                >
                  <option value="">-- Select Statement Type --</option>
                  <option value="Statement Before Balance Transfer">
                    Statement Before Balance Transfer
                  </option>
                  <option value="Statement After Balance Transfer">
                    Statement After Balance Transfer
                  </option>
                </CFormSelect>
              </CCol>

              {/* Date Input */}
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
            <strong>Records for 2025</strong>
          </CCardHeader>
          <CCardBody>
            {filteredData.length === 0 ? (
              <p>No data found for the chosen criteria.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Account Head</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredData.map((entry) => (
                    <CTableRow key={entry.id}>
                      <CTableDataCell>{entry.date}</CTableDataCell>
                      <CTableDataCell>{entry.accountHead}</CTableDataCell>
                      <CTableDataCell>{entry.description}</CTableDataCell>
                      <CTableDataCell>{entry.amount}</CTableDataCell>
                      <CTableDataCell>{entry.type}</CTableDataCell>
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

export default ProfitLossStatement
