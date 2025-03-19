import React, { useState, useEffect } from 'react'
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
import apiService from '../../api/accountManagementApi' // Updated API import

const JournalTransaction = () => {
  const [date, setDate] = useState('')
  const [journalList, setJournalList] = useState([])
  const [transactions, setTransactions] = useState(
    Array.from({ length: 6 }, () => ({ accountTitle: null, narration: '', debit: 0, credit: 0 })),
  )
  const [accountTitles, setAccountTitles] = useState([])

  // Fetch account titles from API
  useEffect(() => {
    fetchBalanceHead()
    // Fetch journal transactions
    fetchJournalList()
  }, [])
  const fetchBalanceHead = () => {
    apiService.getAll('balance-sheet-head-master/all').then((data) => {
      setAccountTitles(data)
    })
  }
  const fetchJournalList = () => {
    apiService.getAll('journal/all').then((journalData) => {
      setJournalList(journalData)
    })
  }
  // Add a new row
  const handleAddRow = () => {
    setTransactions([...transactions, { accountTitle: null, narration: '', debit: 0, credit: 0 }])
  }

  // Update row data
  const handleRowChange = (index, field, value) => {
    const updatedTransactions = [...transactions]
    updatedTransactions[index][field] =
      field === 'accountTitle'
        ? Number(value)
        : field === 'debit' || field === 'credit'
          ? parseFloat(value) || 0
          : value
    setTransactions(updatedTransactions)
  }
  // Calculate totals
  const totalDebit = transactions.reduce((sum, row) => sum + (row.debit || 0), 0)
  const totalCredit = transactions.reduce((sum, row) => sum + (row.credit || 0), 0)

  // Save data
  const handleSave = () => {
    if (!date) {
      alert('Please select a date.')
      return
    }

    if (totalDebit !== totalCredit) {
      alert('Debit and Credit totals must be equal.')
      return
    }

    const requestData = {
      transactions: {
        [date]: transactions
          .filter((t) => t.accountTitle) // Remove empty rows
          .map((t) => ({
            accountTitle: Number(t.accountTitle), // Ensure number format
            narration: t.narration,
            debit: t.debit,
            credit: t.credit,
          })),
      },
    }

    console.log('this is data', requestData)

    apiService.create('journal/add', requestData).then(() => {
      alert('Transaction saved successfully!')
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <CFormLabel>Select Date</CFormLabel>
            <CFormInput
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Account Title</CTableHeaderCell>
                  <CTableHeaderCell>Narration</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {transactions.map((row, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      <CFormSelect
                        value={row.accountTitle}
                        onChange={(e) => handleRowChange(index, 'accountTitle', e.target.value)}
                      >
                        <option value="">Select Account</option>
                        {accountTitles.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountName}
                          </option>
                        ))}
                      </CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="text"
                        value={row.narration}
                        onChange={(e) => handleRowChange(index, 'narration', e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        value={row.debit}
                        onChange={(e) => handleRowChange(index, 'debit', e.target.value)}
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormInput
                        type="number"
                        value={row.credit}
                        onChange={(e) => handleRowChange(index, 'credit', e.target.value)}
                      />
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
            <CButton color="primary" className="mt-2" onClick={handleAddRow}>
              Add Row
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard>
          <CCardBody>
            <CTable bordered style={{ margin: 'auto' }}>
              <CTableBody>
                <CTableRow>
                  <CTableHeaderCell>Total Debit</CTableHeaderCell>
                  <CTableDataCell>{totalDebit}</CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell>Total Credit</CTableHeaderCell>
                  <CTableDataCell>{totalCredit}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
            <CButton className="mt-3" color="success" onClick={handleSave}>
              Save
            </CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default JournalTransaction
