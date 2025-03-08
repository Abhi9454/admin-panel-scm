import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormSelect,
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

// Sample data for demonstration
const sampleTransactions = [
  {
    id: 1,
    date: '2024-07-01',
    category: 'tuition fees',
    narration: 'June end fees collection',
    amount: 1500,
    details: 'Collected from student A. Paid in cash.',
  },
  {
    id: 2,
    date: '2024-07-02',
    category: 'transport fees',
    narration: 'Bus pass renewal',
    amount: 300,
    details: 'Paid via online transaction.',
  },
  {
    id: 3,
    date: '2024-07-03',
    category: 'late fees',
    narration: 'Delay in monthly fees payment',
    amount: 50,
    details: 'Added to the tuition fees bill for student B.',
  },
  {
    id: 4,
    date: '2024-07-04',
    category: 'admission fees',
    narration: 'New admission for 1st grade',
    amount: 2000,
    details: 'Paid via cheque. Enrollment number #234.',
  },
  {
    id: 5,
    date: '2024-07-05',
    category: 'donation',
    narration: 'Donation for library expansion',
    amount: 500,
    details: 'Voluntary donation from an alumnus.',
  },
  {
    id: 6,
    date: '2024-07-06',
    category: 'library',
    narration: 'Penalty for lost library book',
    amount: 120,
    details: 'Lost book replaced fee.',
  },
]

const AccountStatement = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState([])

  // For viewing details of a single transaction
  const [viewingTx, setViewingTx] = useState(null)

  const categories = [
    { value: '', label: '--Select Category--' },
    { value: 'tuition fees', label: 'Tuition Fees' },
    { value: 'student security advances', label: 'Student Security Advances' },
    { value: 'practical exam', label: 'Practical Exam' },
    { value: 'transport fees', label: 'Transport Fees' },
    { value: 'computer fees', label: 'Computer Fees' },
    { value: 'donation', label: 'Donation' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'late fees', label: 'Late Fees' },
    { value: 'fine', label: 'Fine' },
    { value: 'misc collection', label: 'Misc Collection' },
    { value: 'ncc camp fees', label: 'NCC Camp Fees' },
    { value: 'ncc uniform fees', label: 'NCC Uniform Fees' },
    { value: 'Books sale fees', label: 'Books Sale Fees' },
    { value: 'auth uniform fees', label: 'School Uniform Fees' },
    { value: 'NSTSE', label: 'NSTSE' },
    { value: 'Robotics', label: 'Robotics' },
    { value: 'Library', label: 'Library' },
    { value: 'admission fees', label: 'Admission Fees' },
    { value: 'vedic math class', label: 'Vedic Math Class' },
  ]

  const handleView = (e) => {
    e.preventDefault()
    // Basic validation
    if (!selectedCategory || !startDate || !endDate) {
      // You can alert or handle error
      return
    }

    // Filter the sample data by the user-provided category and date range
    const results = sampleTransactions.filter((tx) => {
      const isCategoryMatch = tx.category === selectedCategory
      const isDateInRange = tx.date >= startDate && tx.date <= endDate
      return isCategoryMatch && isDateInRange
    })

    setFilteredTransactions(results)
  }

  const handleDetails = (tx) => {
    setViewingTx(tx)
  }

  const handleCloseModal = () => {
    setViewingTx(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Account Statement</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleView} className="row g-3">
              {/* Category Select */}
              <CCol md={4}>
                <CFormLabel>Category</CFormLabel>
                <CFormSelect
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              {/* Start Date */}
              <CCol md={4}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>

              {/* End Date */}
              <CCol md={4}>
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

      {/* Results Table */}
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Transactions</strong>
          </CCardHeader>
          <CCardBody>
            {filteredTransactions.length === 0 ? (
              <p>No transactions found for the selected category and dates.</p>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Date</CTableHeaderCell>
                    <CTableHeaderCell>Category</CTableHeaderCell>
                    <CTableHeaderCell>Narration</CTableHeaderCell>
                    <CTableHeaderCell>Amount</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredTransactions.map((tx) => (
                    <CTableRow key={tx.id}>
                      <CTableDataCell>{tx.date}</CTableDataCell>
                      <CTableDataCell>{tx.category}</CTableDataCell>
                      <CTableDataCell>{tx.narration}</CTableDataCell>
                      <CTableDataCell>{tx.amount}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="info" onClick={() => handleDetails(tx)}>
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
      {viewingTx && (
        <CModal visible={true} onClose={handleCloseModal}>
          <CModalHeader>Transaction Details</CModalHeader>
          <CModalBody>
            <p>
              <strong>Date:</strong> {viewingTx.date}
            </p>
            <p>
              <strong>Category:</strong> {viewingTx.category}
            </p>
            <p>
              <strong>Narration:</strong> {viewingTx.narration}
            </p>
            <p>
              <strong>Amount:</strong> {viewingTx.amount}
            </p>
            <p>
              <strong>Details:</strong> {viewingTx.details}
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

export default AccountStatement
