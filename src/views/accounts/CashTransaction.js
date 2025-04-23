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
  const [openingBalance, setOpeningBalance] = useState({ debit: 0, credit: 0 })
  const [calculatedBalance, setCalculatedBalance] = useState({ debit: 0, credit: 0 })
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchBalanceHeads()
    fetchTransactions()
  }, [])

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

  // Fetch opening balance when balance head changes
  const fetchOpeningBalance = async (id) => {
    try {
      const response = await apiService.getById('opening-balance', id)
      setOpeningBalance({ debit: response.debit, credit: response.credit })
      setCalculatedBalance({ debit: response.debit, credit: response.credit }) // Reset calculated balance
    } catch (error) {
      console.error('Error fetching opening balance:', error)
    }
  }

  // Handle balance head selection
  const handleBalanceHeadChange = (e) => {
    const selectedId = e.target.value
    setBalanceHead(selectedId)
    if (selectedId) fetchOpeningBalance(selectedId)
  }

  // Handle amount input & live update
  const handleAmountChange = (e) => {
    const enteredAmount = parseFloat(e.target.value) || 0
    setAmount(enteredAmount)

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
      fetchOpeningBalance(balanceHead) // Refresh balance
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
                <CFormLabel>Date</CFormLabel>
                <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Balance Head</CFormLabel>
                <CFormSelect value={balanceHead} onChange={handleBalanceHeadChange}>
                  <option value="">Select Balance Head</option>
                  {balanceHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.accountName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Narration</CFormLabel>
                <CFormInput
                  type="text"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Type</CFormLabel>
                <CFormSelect value={transactionType} onChange={handleTransactionTypeChange}>
                  <option value="Debit">Debit</option>
                  <option value="Credit">Credit</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Amount</CFormLabel>
                <CFormInput type="number" value={amount} onChange={handleAmountChange} />
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
                  <CTableHeaderCell>Opening Balance</CTableHeaderCell>
                  <CTableHeaderCell>Voucher</CTableHeaderCell>
                  <CTableHeaderCell>Total</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {/* Debit Row */}
                <CTableRow>
                  <CTableDataCell>
                    <strong>Debit</strong>
                  </CTableDataCell>
                  <CTableDataCell>{openingBalance.debit}</CTableDataCell>
                  <CTableDataCell>{calculatedBalance.debit - openingBalance.debit}</CTableDataCell>
                  <CTableDataCell>{calculatedBalance.debit}</CTableDataCell>
                </CTableRow>

                {/* Credit Row */}
                <CTableRow>
                  <CTableDataCell>
                    <strong>Credit</strong>
                  </CTableDataCell>
                  <CTableDataCell>{openingBalance.credit}</CTableDataCell>
                  <CTableDataCell>
                    {calculatedBalance.credit - openingBalance.credit}
                  </CTableDataCell>
                  <CTableDataCell>{calculatedBalance.credit}</CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default CashTransaction
