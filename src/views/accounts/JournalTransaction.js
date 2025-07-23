import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
  CSpinner,
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../api/accountManagementApi'

const JournalTransaction = () => {
  const [date, setDate] = useState('')
  const [journalList, setJournalList] = useState([])
  const [transactions, setTransactions] = useState(
    Array.from({ length: 6 }, () => ({ accountTitle: null, narration: '', debit: 0, credit: 0 })),
  )
  const [accountTitles, setAccountTitles] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch account titles from API
  useEffect(() => {
    fetchBalanceHead()
    fetchJournalList()
  }, [])

  const fetchBalanceHead = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAll('balance-sheet-head-master/all')
      setAccountTitles(data)
    } catch (error) {
      console.error('Error fetching balance heads:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJournalList = async () => {
    try {
      const journalData = await apiService.getAll('journal/all')
      setJournalList(journalData)
    } catch (error) {
      console.error('Error fetching journal list:', error)
    }
  }

  // Add a new row
  const handleAddRow = () => {
    setTransactions([...transactions, { accountTitle: null, narration: '', debit: 0, credit: 0 }])
  }

  // Remove a row
  const handleRemoveRow = (index) => {
    if (transactions.length > 1) {
      const updatedTransactions = transactions.filter((_, i) => i !== index)
      setTransactions(updatedTransactions)
    }
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
  const isBalanced = totalDebit === totalCredit && totalDebit > 0

  // Get account name by ID
  const getAccountName = (id) => {
    const account = accountTitles.find((acc) => acc.id === id)
    return account ? account.accountName : 'Select Account'
  }

  // Clear form
  const handleClear = () => {
    setDate('')
    setTransactions(
      Array.from({ length: 6 }, () => ({ accountTitle: null, narration: '', debit: 0, credit: 0 })),
    )
  }

  // Save data
  const handleSave = async () => {
    if (!date) {
      alert('Please select a date.')
      return
    }

    const filledTransactions = transactions.filter(
      (t) => t.accountTitle && (t.debit > 0 || t.credit > 0),
    )

    if (filledTransactions.length === 0) {
      alert('Please add at least one transaction entry.')
      return
    }

    if (totalDebit !== totalCredit) {
      alert('Debit and Credit totals must be equal.')
      return
    }

    setSubmitting(true)
    const requestData = {
      transactions: {
        [date]: filledTransactions.map((t) => ({
          accountTitle: Number(t.accountTitle),
          narration: t.narration.trim(),
          debit: t.debit,
          credit: t.credit,
        })),
      },
    }

    console.log('this is data', requestData)

    try {
      await apiService.create('journal/add', requestData)
      alert('Journal transaction saved successfully!')
      await fetchJournalList()
      handleClear()
    } catch (error) {
      console.error('Error saving journal transaction:', error)
      alert('Error saving transaction. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">📋 Journal Transaction Entry</h6>
                <small className="text-muted">
                  Record multi-account journal entries with balanced debits and credits
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                {isBalanced && totalDebit > 0 && (
                  <CBadge color="success" className="me-2">
                    ✅ Balanced
                  </CBadge>
                )}
                {totalDebit !== totalCredit && totalDebit > 0 && (
                  <CBadge color="warning" className="me-2">
                    ⚠️ Unbalanced
                  </CBadge>
                )}
                <CBadge color="info">
                  {transactions.filter((t) => t.accountTitle).length} Entries
                </CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-4">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading account data...</span>
              </div>
            ) : (
              <>
                {/* Date Selection */}
                <div className="mb-4">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    📅 Transaction Details
                  </h6>
                  <CRow className="g-2">
                    <CCol lg={4} md={6}>
                      <CFormInput
                        size="sm"
                        floatingClassName="mb-2"
                        floatingLabel="📅 Transaction Date *"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        disabled={submitting}
                      />
                    </CCol>
                    <CCol lg={8} md={6} className="d-flex align-items-center">
                      <div
                        className={`p-3 rounded-3 flex-grow-1 ${isBalanced && totalDebit > 0 ? 'bg-success bg-opacity-10 border border-success' : totalDebit !== totalCredit && totalDebit > 0 ? 'bg-warning bg-opacity-10 border border-warning' : 'bg-dark border'}`}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6
                              className={`mb-1 ${isBalanced && totalDebit > 0 ? 'text-success' : totalDebit !== totalCredit && totalDebit > 0 ? 'text-warning' : 'text-muted'}`}
                            >
                              {isBalanced && totalDebit > 0
                                ? '✅ Entry Balanced'
                                : totalDebit !== totalCredit && totalDebit > 0
                                  ? '⚠️ Entry Unbalanced'
                                  : '📝 Ready for Entry'}
                            </h6>
                            <small className="text-muted">
                              {isBalanced && totalDebit > 0
                                ? 'Debit and Credit totals match'
                                : totalDebit !== totalCredit && totalDebit > 0
                                  ? 'Debit and Credit must be equal'
                                  : 'Add transaction entries below'}
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">
                              Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                </div>

                {/* Journal Entries Table */}
                <div className="mb-4">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    📊 Journal Entries
                  </h6>
                  <div className="table-responsive">
                    <CTable hover small className="mb-0">
                      <CTableHead className="table-dark">
                        <CTableRow>
                          <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                            🏦 Account Title
                          </CTableHeaderCell>
                          <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                            📝 Narration
                          </CTableHeaderCell>
                          <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                            💸 Debit (₹)
                          </CTableHeaderCell>
                          <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                            💰 Credit (₹)
                          </CTableHeaderCell>
                          <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                            Actions
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {transactions.map((row, index) => (
                          <CTableRow key={index} className={row.accountTitle ? 'table-light' : ''}>
                            <CTableDataCell className="py-2 px-3">
                              <CFormSelect
                                size="sm"
                                value={row.accountTitle || ''}
                                onChange={(e) =>
                                  handleRowChange(index, 'accountTitle', e.target.value)
                                }
                                disabled={submitting}
                              >
                                <option value="">Select Account</option>
                                {accountTitles.map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.accountName}
                                  </option>
                                ))}
                              </CFormSelect>
                            </CTableDataCell>
                            <CTableDataCell className="py-2 px-3">
                              <CFormInput
                                size="sm"
                                type="text"
                                value={row.narration}
                                onChange={(e) =>
                                  handleRowChange(index, 'narration', e.target.value)
                                }
                                disabled={submitting}
                                placeholder="Enter transaction description"
                              />
                            </CTableDataCell>
                            <CTableDataCell className="py-2 px-3">
                              <CFormInput
                                size="sm"
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.debit || ''}
                                onChange={(e) => handleRowChange(index, 'debit', e.target.value)}
                                disabled={submitting}
                                placeholder="0.00"
                                className="text-end"
                              />
                            </CTableDataCell>
                            <CTableDataCell className="py-2 px-3">
                              <CFormInput
                                size="sm"
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.credit || ''}
                                onChange={(e) => handleRowChange(index, 'credit', e.target.value)}
                                disabled={submitting}
                                placeholder="0.00"
                                className="text-end"
                              />
                            </CTableDataCell>
                            <CTableDataCell className="py-2 px-3 text-center">
                              {transactions.length > 1 && (
                                <CButton
                                  color="outline-danger"
                                  size="sm"
                                  onClick={() => handleRemoveRow(index)}
                                  disabled={submitting}
                                  title="Remove row"
                                >
                                  🗑️
                                </CButton>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ))}

                        {/* Totals Row */}
                        <CTableRow className="table-dark">
                          <CTableDataCell className="py-3 px-3 fw-bold" colSpan="2">
                            📊 Totals ({transactions.filter((t) => t.accountTitle).length} Entries)
                          </CTableDataCell>
                          <CTableDataCell className="py-3 px-3 text-end fw-bold">
                            <CBadge color="danger" className="text-white fs-6 px-3 py-2">
                              ₹{totalDebit.toFixed(2)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="py-3 px-3 text-end fw-bold">
                            <CBadge color="success" className="text-white fs-6 px-3 py-2">
                              ₹{totalCredit.toFixed(2)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="py-3 px-3 text-center">
                            <CBadge
                              color={
                                isBalanced && totalDebit > 0
                                  ? 'success'
                                  : totalDebit !== totalCredit && totalDebit > 0
                                    ? 'warning'
                                    : 'secondary'
                              }
                              className="text-white px-2 py-1"
                            >
                              {isBalanced && totalDebit > 0
                                ? '✅'
                                : totalDebit !== totalCredit && totalDebit > 0
                                  ? '⚠️'
                                  : '📝'}
                            </CBadge>
                          </CTableDataCell>
                        </CTableRow>
                      </CTableBody>
                    </CTable>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <CButton
                        color="outline-primary"
                        size="sm"
                        onClick={handleAddRow}
                        disabled={submitting}
                        className="me-2"
                      >
                        ➕ Add Entry Row
                      </CButton>
                      <small className="text-muted">
                        Add more rows as needed for complex journal entries
                      </small>
                    </div>
                    <CButtonGroup size="sm">
                      <CButton
                        color="success"
                        onClick={handleSave}
                        disabled={submitting || !isBalanced || !date || totalDebit === 0}
                      >
                        {submitting ? (
                          <>
                            <CSpinner size="sm" className="me-1" />
                            Saving...
                          </>
                        ) : (
                          '💾 Save Journal Entry'
                        )}
                      </CButton>
                      <CButton
                        color="outline-secondary"
                        onClick={handleClear}
                        disabled={submitting}
                      >
                        Clear All
                      </CButton>
                    </CButtonGroup>
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default JournalTransaction
