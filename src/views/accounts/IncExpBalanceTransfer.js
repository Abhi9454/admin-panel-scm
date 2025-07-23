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
  CFormSelect,
  CSpinner,
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from 'src/api/accountManagementApi'

const IncExpBalanceTransfer = () => {
  const [date, setDate] = useState('')
  const [fromAccount, setFromAccount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [balance, setBalance] = useState('')
  const [type, setType] = useState('credit') // default value
  const [balanceHeads, setBalanceHeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBalanceHeads()
  }, [])

  const fetchBalanceHeads = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAll('balance-sheet-head-master/all')
      setBalanceHeads(response)
    } catch (error) {
      console.error('Error fetching balance heads:', error)
      alert('Error loading account data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setDate('')
    setFromAccount('')
    setToAccount('')
    setBalance('')
    setType('credit')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!fromAccount || !toAccount || !date || !balance.trim() || !type) {
      alert('Please fill in all required fields')
      return
    }

    if (fromAccount === toAccount) {
      alert('From Account and To Account cannot be the same')
      return
    }

    const balanceAmount = parseFloat(balance)
    if (isNaN(balanceAmount) || balanceAmount <= 0) {
      alert('Please enter a valid balance amount greater than 0')
      return
    }

    setSubmitting(true)
    const payload = {
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      date,
      type,
      balance: balanceAmount,
    }

    try {
      const response = await apiService.create('balance-transfer/add', payload)
      if (response === true) {
        alert('Balance transfer completed successfully!')
        clearForm()
      } else {
        alert('Unable to complete transfer. Please check account balance before proceeding.')
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      alert('Failed to transfer balance. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Get account name by ID
  const getAccountName = (id) => {
    const account = balanceHeads.find((head) => head.id === parseInt(id))
    return account ? account.accountName : ''
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">💸 Income/Expense Balance Transfer</h6>
                <small className="text-muted">Transfer balances between different accounts</small>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color="info" className="me-2">
                  {balanceHeads.length} Accounts
                </CBadge>
                {type && (
                  <CBadge color={type === 'credit' ? 'success' : 'danger'}>
                    {type === 'credit' ? '📥 Credit' : '📤 Debit'}
                  </CBadge>
                )}
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
                {/* Balance Transfer Form */}
                <div className="mb-4">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    🔄 Balance Transfer Details
                  </h6>

                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              📅 Transfer Date<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>

                      <CCol lg={4} md={6}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              🏦 From Account<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          value={fromAccount}
                          onChange={(e) => setFromAccount(e.target.value)}
                          disabled={submitting}
                        >
                          <option value="">Select source account</option>
                          {balanceHeads.map((head) => (
                            <option key={head.id} value={head.id}>
                              {head.accountName}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={4} md={6}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              🎯 To Account<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          value={toAccount}
                          onChange={(e) => setToAccount(e.target.value)}
                          disabled={submitting || !fromAccount}
                        >
                          <option value="">Select destination account</option>
                          {balanceHeads
                            .filter((head) => head.id !== parseInt(fromAccount))
                            .map((head) => (
                              <option key={head.id} value={head.id}>
                                {head.accountName}
                              </option>
                            ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={6} md={6}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              💼 Transaction Type<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          disabled={submitting}
                        >
                          <option value="credit">📥 Credit</option>
                          <option value="debit">📤 Debit</option>
                        </CFormSelect>
                      </CCol>

                      <CCol lg={6} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              💰 Transfer Amount (₹)<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter transfer amount"
                          value={balance}
                          onChange={(e) => setBalance(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                    </CRow>

                    {/* Transfer Preview */}
                    {fromAccount && toAccount && balance && (
                      <div className="mt-3 p-3 bg-light rounded-3 border">
                        <h6 className="text-muted fw-semibold mb-2">🔍 Transfer Preview</h6>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="text-center">
                            <CBadge color="danger" className="d-block mb-1">
                              From
                            </CBadge>
                            <small className="fw-semibold">{getAccountName(fromAccount)}</small>
                          </div>
                          <div className="text-center mx-3">
                            <div style={{ fontSize: '1.5rem' }}>
                              {type === 'credit' ? '📥' : '📤'}
                            </div>
                            <CBadge
                              color={type === 'credit' ? 'success' : 'warning'}
                              className="text-white"
                            >
                              ₹{parseFloat(balance || 0).toFixed(2)}
                            </CBadge>
                          </div>
                          <div className="text-center">
                            <CBadge color="success" className="d-block mb-1">
                              To
                            </CBadge>
                            <small className="fw-semibold">{getAccountName(toAccount)}</small>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2 border-top pt-3 mt-3">
                      <CButton
                        color="success"
                        type="submit"
                        size="sm"
                        disabled={
                          submitting || loading || !fromAccount || !toAccount || !balance || !date
                        }
                        className="px-4"
                      >
                        {submitting ? (
                          <>
                            <CSpinner size="sm" className="me-1" />
                            Processing...
                          </>
                        ) : (
                          '💸 Transfer Balance'
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

                {/* Transfer Guidelines */}
                <div className="border-top pt-3">
                  <h6 className="text-muted fw-semibold mb-2">📝 Transfer Guidelines</h6>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="p-2 bg-info bg-opacity-10 rounded border border-info">
                        <small className="text-info fw-semibold d-block">💡 Credit Transfer</small>
                        <small className="text-muted">
                          Adds the amount to the destination account balance
                        </small>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-2 bg-warning bg-opacity-10 rounded border border-warning">
                        <small className="text-warning fw-semibold d-block">
                          ⚠️ Debit Transfer
                        </small>
                        <small className="text-muted">
                          Deducts the amount from the source account balance
                        </small>
                      </div>
                    </div>
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

export default IncExpBalanceTransfer
