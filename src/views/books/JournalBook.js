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
  CFormSelect,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'

// Sample data for journal entries
const sampleJournalData = [
  {
    id: 1,
    date: '2025-01-10',
    journalType: 'journal book',
    narration: 'Opening Balance Entry',
    debit: 1000,
    credit: 0,
  },
  {
    id: 2,
    date: '2025-01-12',
    journalType: 'journal book difference',
    narration: 'Adjustment Entry',
    debit: 0,
    credit: 200,
  },
  {
    id: 3,
    date: '2025-01-15',
    journalType: 'journal book',
    narration: 'Purchase Return Entry',
    debit: 300,
    credit: 0,
  },
  {
    id: 4,
    date: '2025-02-01',
    journalType: 'journal book difference',
    narration: 'Year-End Adjustment',
    debit: 500,
    credit: 200,
  },
]

const JournalBook = () => {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedJournalType, setSelectedJournalType] = useState('')
  const [filteredList, setFilteredList] = useState([])

  // Handle the View button click
  const handleView = (e) => {
    e.preventDefault()

    // If no date range or no journal type is selected, you can handle accordingly
    if (!startDate || !endDate || !selectedJournalType) return

    // Filter by date range AND the selected journalType
    const results = sampleJournalData.filter((entry) => {
      return (
        entry.date >= startDate &&
        entry.date <= endDate &&
        entry.journalType === selectedJournalType
      )
    })

    setFilteredList(results)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Journal Book Filter</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleView} className="row g-3">
              {/* Date Range Fields */}
              <CCol md={4}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </CCol>

              {/* Journal Type Select */}
              <CCol md={4}>
                <CFormLabel>Journal Type</CFormLabel>
                <CFormSelect
                  value={selectedJournalType}
                  onChange={(e) => setSelectedJournalType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="journal book">Journal Book</option>
                  <option value="journal book difference">Journal Book Difference</option>
                </CFormSelect>
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

      {/* Filtered Table */}
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Filtered Journal Entries</strong>
          </CCardHeader>
          <CCardBody>
            {filteredList.length === 0 ? (
              <p>No journal entries found for the selected criteria.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Journal Type</CTableHeaderCell>
                    <CTableHeaderCell>Narration</CTableHeaderCell>
                    <CTableHeaderCell>Debit</CTableHeaderCell>
                    <CTableHeaderCell>Credit</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredList.map((entry) => (
                    <CTableRow key={entry.id}>
                      <CTableDataCell>{entry.date}</CTableDataCell>
                      <CTableDataCell>{entry.journalType}</CTableDataCell>
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

export default JournalBook
