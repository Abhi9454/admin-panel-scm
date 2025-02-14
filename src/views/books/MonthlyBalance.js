import React, { useState, useMemo } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

// Sample data from Jan 2024 to Feb 2025
const monthlyData = [
  { id: 1, month: 'January', year: 2024, totalBalance: 1000 },
  { id: 1, month: 'January', year: 2024, totalBalance: 3000 },
  { id: 2, month: 'February', year: 2024, totalBalance: 1250 },
  { id: 3, month: 'March', year: 2024, totalBalance: 1400 },
  { id: 4, month: 'April', year: 2024, totalBalance: 1800 },
  { id: 5, month: 'May', year: 2024, totalBalance: 900 },
  { id: 6, month: 'June', year: 2024, totalBalance: 2000 },
  { id: 7, month: 'July', year: 2024, totalBalance: 2200 },
  { id: 8, month: 'August', year: 2024, totalBalance: 1700 },
  { id: 9, month: 'September', year: 2024, totalBalance: 1300 },
  { id: 10, month: 'October', year: 2024, totalBalance: 2400 },
  { id: 11, month: 'November', year: 2024, totalBalance: 2600 },
  { id: 12, month: 'December', year: 2024, totalBalance: 2100 },
  { id: 13, month: 'January', year: 2025, totalBalance: 2800 },
  { id: 14, month: 'February', year: 2025, totalBalance: 1600 },
]

const MonthlyBalance = () => {
  // State for the selects
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  // State for the filtered results
  const [filteredList, setFilteredList] = useState([])

  // Available months to populate select
  const monthsOptions = [
    { value: '', label: 'All Months' },
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ]

  // Available years to populate select
  const yearsOptions = [
    { value: '', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2025', label: '2025' },
  ]

  // Compute total of filtered balances
  const totalFilteredBalance = useMemo(() => {
    return filteredList.reduce((sum, item) => sum + item.totalBalance, 0)
  }, [filteredList])

  const handleView = (e) => {
    e.preventDefault()

    // Filter logic
    let results = monthlyData

    if (selectedMonth) {
      results = results.filter((item) => item.month === selectedMonth)
    }
    if (selectedYear) {
      results = results.filter((item) => item.year.toString() === selectedYear)
    }

    setFilteredList(results)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Filter Monthly Balances</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleView} className="row g-3">
              <CCol md={6}>
                <CFormSelect
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthsOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormSelect value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {yearsOptions.map((y) => (
                    <option key={y.value} value={y.value}>
                      {y.label}
                    </option>
                  ))}
                </CFormSelect>
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
            <strong>Monthly Balances</strong>
            <span className="text-muted m-3">Total Balance: {totalFilteredBalance}</span>
          </CCardHeader>
          <CCardBody>
            {filteredList.length === 0 ? (
              <p>No data found for the selected month/year.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Month</CTableHeaderCell>
                    <CTableHeaderCell>Year</CTableHeaderCell>
                    <CTableHeaderCell>Total Balance</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredList.map((item) => (
                    <CTableRow key={item.id}>
                      <CTableDataCell>{item.month}</CTableDataCell>
                      <CTableDataCell>{item.year}</CTableDataCell>
                      <CTableDataCell>{item.totalBalance}</CTableDataCell>
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

export default MonthlyBalance
