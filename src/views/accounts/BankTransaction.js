import React, { useEffect, useState } from 'react'
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

const BankTransaction = () => {
  const [date, setDate] = useState('')
  const [balanceHead, setBalanceHead] = useState('')
  const [narration, setNarration] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState('Debit')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [balanceHeads, setBalanceHeads] = useState([])
  const [openingBalance, setOpeningBalance] = useState({ accountId: null, debit: 0, credit: 0 })
  const [calculatedBalance, setCalculatedBalance] = useState({ debit: 0, credit: 0 })
  const [transactions, setTransactions] = useState([])
  const [accountBalances, setAccountBalances] = useState([])
  const [currentVoucher, setCurrentVoucher] = useState({
    accountId: null,
    amount: 0,
    type: 'Debit',
  })

  useEffect(() => {
    fetchBalanceHeads()
    fetchTransactions()
  }, [])

  useEffect(() => {
    calculateAccountBalances()
  }, [transactions, openingBalance, currentVoucher, balanceHeads])

  // Fetch balance head dropdown
  const fetchBalanceHeads = async () => {
    try {
      const response = await apiService.getAll('balance-sheet-head-master/all')
      setBalanceHeads(response)
    } catch (error) {
      console.error('Error fetching balance heads:', error)
    }
  }

  // Fetch transactions after saving
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAll('transaction/all')
      setTransactions(response)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate account balances for table display
  const calculateAccountBalances = () => {
    const accountBalanceMap = new Map()

    // Group transactions by balanceSheetHeadTitle.id
    transactions.forEach((transaction) => {
      const accountId = transaction.balanceSheetHeadTitle?.id
      const accountName = transaction.balanceSheetHeadTitle?.accountName || 'Unknown Account'

      if (!accountBalanceMap.has(accountId)) {
        accountBalanceMap.set(accountId, {
          accountId: accountId,
          accountName: accountName,
          openingBalanceDebit: 0,
          openingBalanceCredit: 0,
          debitVoucher: 0,
          creditVoucher: 0,
          currentBalance: 0,
        })
      }

      const accountData = accountBalanceMap.get(accountId)

      // Add voucher amounts
      if (transaction.debit && transaction.debit > 0) {
        accountData.debitVoucher += transaction.debit
        accountData.currentBalance += transaction.debit
      }
      if (transaction.credit && transaction.credit > 0) {
        accountData.creditVoucher += transaction.credit
        accountData.currentBalance -= transaction.credit
      }
    })

    // Add opening balance to the selected account
    if (openingBalance.accountId) {
      const selectedAccountData = accountBalanceMap.get(openingBalance.accountId)
      if (selectedAccountData) {
        selectedAccountData.openingBalanceDebit = openingBalance.debit
        selectedAccountData.openingBalanceCredit = openingBalance.credit
      } else {
        // If no transactions exist for this account, create entry
        const selectedAccount = balanceHeads.find((head) => head.id === openingBalance.accountId)
        if (selectedAccount) {
          accountBalanceMap.set(openingBalance.accountId, {
            accountId: openingBalance.accountId,
            accountName: selectedAccount.accountName,
            openingBalanceDebit: openingBalance.debit,
            openingBalanceCredit: openingBalance.credit,
            debitVoucher: 0,
            creditVoucher: 0,
            currentBalance: 0,
          })
        }
      }
    }

    // Add current voucher to the selected account
    if (currentVoucher.accountId && currentVoucher.amount > 0) {
      const selectedAccountData = accountBalanceMap.get(currentVoucher.accountId)
      if (selectedAccountData) {
        if (currentVoucher.type === 'Debit') {
          selectedAccountData.debitVoucher += currentVoucher.amount
        } else {
          selectedAccountData.creditVoucher += currentVoucher.amount
        }
      } else {
        // If no transactions exist for this account, create entry
        const selectedAccount = balanceHeads.find((head) => head.id === currentVoucher.accountId)
        if (selectedAccount) {
          accountBalanceMap.set(currentVoucher.accountId, {
            accountId: currentVoucher.accountId,
            accountName: selectedAccount.accountName,
            openingBalanceDebit:
              openingBalance.accountId === currentVoucher.accountId ? openingBalance.debit : 0,
            openingBalanceCredit:
              openingBalance.accountId === currentVoucher.accountId ? openingBalance.credit : 0,
            debitVoucher: currentVoucher.type === 'Debit' ? currentVoucher.amount : 0,
            creditVoucher: currentVoucher.type === 'Credit' ? currentVoucher.amount : 0,
            currentBalance: 0,
          })
        }
      }
    }

    setAccountBalances(Array.from(accountBalanceMap.values()))
  }

  // Fetch opening balance when balance head changes
  const fetchOpeningBalance = async (id) => {
    try {
      const response = await apiService.getById('opening-balance', id)
      setOpeningBalance({
        accountId: response.accountId,
        debit: response.debit,
        credit: response.credit,
      })
      setCalculatedBalance({ debit: response.debit, credit: response.credit })
    } catch (error) {
      console.error('Error fetching opening balance:', error)
      setOpeningBalance({ accountId: id, debit: 0, credit: 0 })
      setCalculatedBalance({ debit: 0, credit: 0 })
    }
  }

  // Handle balance head selection
  const handleBalanceHeadChange = (e) => {
    const selectedId = e.target.value
    setBalanceHead(selectedId)

    setCurrentVoucher((prev) => ({ ...prev, accountId: selectedId ? parseInt(selectedId) : null }))

    if (selectedId) {
      fetchOpeningBalance(selectedId)
    } else {
      setOpeningBalance({ accountId: null, debit: 0, credit: 0 })
      setCalculatedBalance({ debit: 0, credit: 0 })
    }
  }

  // Handle amount input & live update
  const handleAmountChange = (e) => {
    const enteredAmount = parseFloat(e.target.value) || 0
    setAmount(enteredAmount)

    setCurrentVoucher((prev) => ({ ...prev, amount: enteredAmount }))

    setCalculatedBalance((prev) => ({
      debit:
        transactionType === 'Debit' ? openingBalance.debit + enteredAmount : openingBalance.debit,
      credit:
        transactionType === 'Credit'
          ? openingBalance.credit + enteredAmount
          : openingBalance.credit,
    }))
  }

  // Handle Debit/Credit dropdown change
  const handleTransactionTypeChange = (e) => {
    const type = e.target.value
    setTransactionType(type)
    setAmount('')

    setCurrentVoucher((prev) => ({ ...prev, type: type, amount: 0 }))

    setCalculatedBalance({
      debit: type === 'Debit' ? openingBalance.debit : openingBalance.debit,
      credit: type === 'Credit' ? openingBalance.credit : openingBalance.credit,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!date || !balanceHead || !narration.trim() || !amount) {
      alert('Please fill all required fields')
      return
    }

    setSubmitting(true)
    const transactionData = {
      date,
      accountId: balanceHead,
      narration: narration.trim(),
      amount: parseFloat(amount),
      type: transactionType,
      paymentType: 1, // Bank transaction type
    }

    try {
      console.log(transactionData)
      await apiService.create('transaction/add', transactionData)
      alert('Bank transaction saved successfully!')
      await fetchTransactions()
      if (balanceHead) {
        fetchOpeningBalance(balanceHead)
      }
      clearForm()
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert('Error saving bank transaction. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Clear form fields
  const clearForm = () => {
    setDate('')
    setBalanceHead('')
    setNarration('')
    setAmount('')
    setTransactionType('Debit')
    setCurrentVoucher({ accountId: null, amount: 0, type: 'Debit' })
  }

  const getTotalDebit = () => {
    return accountBalances.reduce(
      (sum, account) => sum + account.openingBalanceDebit + account.debitVoucher,
      0,
    )
  }

  const getTotalCredit = () => {
    return accountBalances.reduce(
      (sum, account) => sum + account.openingBalanceCredit + account.creditVoucher,
      0,
    )
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">🏦 Bank Transaction Management</h6>
                <small className="text-muted">
                  Record and manage bank transactions for all accounts
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color="info" className="me-2">
                  {transactions.length} Transactions
                </CBadge>
                <CBadge color="secondary">{accountBalances.length} Accounts</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {/* Transaction Form */}
            <div className="mb-4">
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                ➕ Add New Bank Transaction
              </h6>

              <CForm onSubmit={handleSubmit}>
                <CRow className="g-2">
                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          📅 Transaction Date<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={submitting}
                    />
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          🏦 Balance Head<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      value={balanceHead}
                      onChange={handleBalanceHeadChange}
                      disabled={submitting}
                    >
                      <option value="">Select account</option>
                      {balanceHeads.map((head) => (
                        <option key={head.id} value={head.id}>
                          {head.accountName}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          💼 Transaction Type<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      value={transactionType}
                      onChange={handleTransactionTypeChange}
                      disabled={submitting}
                    >
                      <option value="Debit">📤 Debit</option>
                      <option value="Credit">📥 Credit</option>
                    </CFormSelect>
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          💰 Amount (₹)<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={submitting}
                      placeholder="Enter transaction amount"
                    />
                  </CCol>

                  <CCol xs={12}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-3"
                      floatingLabel={
                        <>
                          📝 Narration<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="text"
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      disabled={submitting}
                      placeholder="Enter transaction description/narration"
                    />
                  </CCol>
                </CRow>

                <div className="d-flex gap-2 border-top pt-3">
                  <CButton
                    color="success"
                    type="submit"
                    size="sm"
                    disabled={submitting || loading}
                    className="px-4"
                  >
                    {submitting ? (
                      <>
                        <CSpinner size="sm" className="me-1" />
                        Saving...
                      </>
                    ) : (
                      '💾 Save Bank Transaction'
                    )}
                  </CButton>
                  <CButton
                    color="outline-secondary"
                    size="sm"
                    onClick={clearForm}
                    disabled={submitting}
                    className="px-4"
                  >
                    Clear Form
                  </CButton>
                </div>
              </CForm>
            </div>

            {/* Account Balances Table */}
            <div>
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                📊 Account Balances Summary
              </h6>

              {loading && accountBalances.length === 0 ? (
                <div className="text-center py-4">
                  <CSpinner color="primary" size="sm" className="me-2" />
                  <span className="text-muted">Loading account balances...</span>
                </div>
              ) : accountBalances.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div style={{ fontSize: '2rem' }}>📊</div>
                  <p className="mb-0">No account balances to display</p>
                  <small>Add bank transactions to see account balances here</small>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover small className="mb-0">
                    <CTableHead className="table-light">
                      <CTableRow>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          🏦 Account Title
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                          💼 Type
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          📈 Current Balance
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          🎫 Voucher
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          📋 Opening Balance
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          💯 Total
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {accountBalances.map((account) => (
                        <React.Fragment key={account.accountId}>
                          {/* Show debit row if there are debit transactions or opening balance */}
                          {(account.debitVoucher > 0 || account.openingBalanceDebit > 0) && (
                            <CTableRow>
                              <CTableDataCell className="py-2 px-3">
                                <div className="fw-semibold text-muted">{account.accountName}</div>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-center">
                                <CBadge color="danger" className="text-white">
                                  Debit
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end">
                                ₹{account.debitVoucher.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end">
                                ₹{account.debitVoucher.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end">
                                ₹{account.openingBalanceDebit.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end fw-bold">
                                ₹{(account.openingBalanceDebit + account.debitVoucher).toFixed(2)}
                              </CTableDataCell>
                            </CTableRow>
                          )}

                          {/* Show credit row if there are credit transactions or opening balance */}
                          {(account.creditVoucher > 0 || account.openingBalanceCredit > 0) && (
                            <CTableRow>
                              <CTableDataCell className="py-2 px-3">
                                <div className="fw-semibold text-muted">{account.accountName}</div>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-center">
                                <CBadge color="success" className="text-white">
                                  Credit
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end">
                                ₹{account.creditVoucher.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end">
                                ₹{account.creditVoucher.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end">
                                ₹{account.openingBalanceCredit.toFixed(2)}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-end fw-bold">
                                ₹{(account.openingBalanceCredit + account.creditVoucher).toFixed(2)}
                              </CTableDataCell>
                            </CTableRow>
                          )}
                        </React.Fragment>
                      ))}

                      {/* Totals Row */}
                      <CTableRow className="table-dark">
                        <CTableDataCell className="py-3 px-3 fw-bold" colSpan="3">
                          📊 Grand Totals ({accountBalances.length} Accounts)
                        </CTableDataCell>
                        <CTableDataCell className="py-3 px-3 text-end fw-bold">
                          <CBadge color="primary" className="text-white fs-6 px-2 py-1">
                            ₹{(getTotalDebit() + getTotalCredit()).toFixed(2)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-3 px-3 text-end fw-bold">
                          <CBadge color="info" className="text-white fs-6 px-2 py-1">
                            ₹{(getTotalDebit() + getTotalCredit()).toFixed(2)}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="py-3 px-3 text-end fw-bold">
                          <CBadge color="success" className="text-white fs-6 px-2 py-1">
                            ₹{(getTotalDebit() + getTotalCredit()).toFixed(2)}
                          </CBadge>
                        </CTableDataCell>
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BankTransaction
