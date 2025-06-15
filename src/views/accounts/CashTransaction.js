import React, { useEffect, useState } from 'react'
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
import apiService from '../../api/accountManagementApi'

const CashTransaction = () => {
  const [date, setDate] = useState('')
  const [balanceHead, setBalanceHead] = useState('')
  const [narration, setNarration] = useState('')
  const [amount, setAmount] = useState('')
  const [transactionType, setTransactionType] = useState('Debit')

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
      const response = await apiService.getAll('transaction/all')
      setTransactions(response)
    } catch (error) {
      console.error('Error fetching transactions:', error)
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

  // Get account name from transactions (not needed anymore but keeping for compatibility)
  const getAccountName = (accountId) => {
    const transaction = transactions.find((t) => t.balanceSheetHeadTitle?.id === accountId)
    return transaction?.balanceSheetHeadTitle?.accountName || 'Unknown Account'
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
      setCalculatedBalance({ debit: response.debit, credit: response.credit }) // Reset calculated balance
    } catch (error) {
      console.error('Error fetching opening balance:', error)
      // Set default values if API call fails
      setOpeningBalance({ accountId: id, debit: 0, credit: 0 })
      setCalculatedBalance({ debit: 0, credit: 0 })
    }
  }

  // Handle balance head selection
  const handleBalanceHeadChange = (e) => {
    const selectedId = e.target.value
    setBalanceHead(selectedId)

    // Update current voucher account ID
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

    // Update current voucher amount
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
    setAmount('') // Reset amount on type change

    // Update current voucher type and reset amount
    setCurrentVoucher((prev) => ({ ...prev, type: type, amount: 0 }))

    setCalculatedBalance({
      debit: type === 'Debit' ? openingBalance.debit : openingBalance.debit,
      credit: type === 'Credit' ? openingBalance.credit : openingBalance.credit,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!date || !balanceHead || !narration || !amount) {
      alert('Please fill all fields')
      return
    }

    const transactionData = {
      date,
      accountId: balanceHead,
      narration,
      amount: parseFloat(amount),
      type: transactionType,
      paymentType: 0, // Fixed as per requirement
    }

    try {
      console.log(transactionData)
      await apiService.create('transaction/add', transactionData)
      alert('Transaction Saved Successfully!')
      fetchTransactions() // Fetch updated transactions
      if (balanceHead) {
        fetchOpeningBalance(balanceHead) // Refresh balance
      }
      clearForm()
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  // Clear form fields
  const clearForm = () => {
    setDate('')
    setBalanceHead(null)
    setNarration('')
    setAmount('')
    setTransactionType('Debit')
    setCurrentVoucher({ accountId: null, amount: 0, type: 'Debit' })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Cash Transaction</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Date<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="date"
                  value={date}
                  placeholder="Date"
                  onChange={(e) => setDate(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Balance Head<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  value={balanceHead}
                  onChange={handleBalanceHeadChange}
                  placeholder="Balance Head"
                >
                  <option value="">Select Balance Head</option>
                  {balanceHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.accountName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Narration<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="text"
                  value={narration}
                  placeholder="Narration"
                  onChange={(e) => setNarration(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Type<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  value={transactionType}
                  onChange={handleTransactionTypeChange}
                >
                  <option value="Debit">Debit</option>
                  <option value="Credit">Credit</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Amount<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Amount"
                />
              </CCol>
              <CCol xs={12}>
                <CButton color="success" type="submit">
                  Save Transaction
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Account Balances</strong>
          </CCardHeader>
          <CCardBody>
            <CTable bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Account Title</CTableHeaderCell>
                  <CTableHeaderCell>Type</CTableHeaderCell>
                  <CTableHeaderCell>Current Balance</CTableHeaderCell>
                  <CTableHeaderCell>Voucher</CTableHeaderCell>
                  <CTableHeaderCell>Opening Balance</CTableHeaderCell>
                  <CTableHeaderCell>Total</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {accountBalances.length > 0 ? (
                  accountBalances.map((account) => (
                    <React.Fragment key={account.accountId}>
                      {/* Show debit row if there are debit transactions or opening balance */}
                      {(account.debitVoucher > 0 || account.openingBalanceDebit > 0) && (
                        <CTableRow>
                          <CTableDataCell>
                            <strong>{account.accountName}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="badge bg-danger">Debit</span>
                          </CTableDataCell>
                          <CTableDataCell>{account.debitVoucher}</CTableDataCell>
                          <CTableDataCell>{account.debitVoucher}</CTableDataCell>
                          <CTableDataCell>{account.openingBalanceDebit}</CTableDataCell>
                          <CTableDataCell>
                            {account.openingBalanceDebit + account.debitVoucher}
                          </CTableDataCell>
                        </CTableRow>
                      )}

                      {/* Show credit row if there are credit transactions or opening balance */}
                      {(account.creditVoucher > 0 || account.openingBalanceCredit > 0) && (
                        <CTableRow>
                          <CTableDataCell>
                            <strong>{account.accountName}</strong>
                          </CTableDataCell>
                          <CTableDataCell>
                            <span className="badge bg-success">Credit</span>
                          </CTableDataCell>
                          <CTableDataCell>{account.creditVoucher}</CTableDataCell>
                          <CTableDataCell>{account.creditVoucher}</CTableDataCell>
                          <CTableDataCell>{account.openingBalanceCredit}</CTableDataCell>
                          <CTableDataCell>
                            {account.openingBalanceCredit + account.creditVoucher}
                          </CTableDataCell>
                        </CTableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">
                      No transactions found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CashTransaction
