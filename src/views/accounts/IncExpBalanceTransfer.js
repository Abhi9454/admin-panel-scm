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
  CFormSelect,
} from '@coreui/react'
import apiService from 'src/api/accountManagementApi'

const IncExpBalanceTransfer = () => {
  const [date, setDate] = useState('')
  const [fromAccount, setFromAccount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [balance, setBalance] = useState('')
  const [type, setType] = useState('credit') // default value
  const [balanceHeads, setBalanceHeads] = useState([])

  useEffect(() => {
    fetchBalanceHeads()
  }, [])

  const fetchBalanceHeads = async () => {
    try {
      const response = await apiService.getAll('balance-sheet-head-master/all')
      setBalanceHeads(response)
    } catch (error) {
      console.error('Error fetching balance heads:', error)
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

    if (!fromAccount || !toAccount || !date || !balance || !type) {
      alert('Please fill in all fields')
      return
    }

    const payload = {
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      date,
      type,
      balance: parseFloat(balance),
    }

    try {
      const response = await apiService.create('balance-transfer/add', payload)
      if (response === true) {
        alert(`Successfully created balance transfer`)
        clearForm()
      } else {
        alert('Check balance before transfer request')
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      alert('Failed to transfer balance')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Balance Transfer</strong>
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
                  onChange={(e) => setDate(e.target.value)}
                />
              </CCol>

              <CCol md={6}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      From Account<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                >
                  <option value="">Select From Account</option>
                  {balanceHeads.map((head) => (
                    <option key={head.id} value={head.id}>
                      {head.accountName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      To Account<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                >
                  <option value="">Select To Account</option>
                  {balanceHeads
                    .filter((head) => head.id !== parseInt(fromAccount))
                    .map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.accountName}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Transaction Type<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </CFormSelect>
              </CCol>

              <CCol md={6}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Balance<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="number"
                  placeholder="Enter Balance Amount"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </CCol>

              <CCol xs={12}>
                <CButton color="success" type="submit">
                  Transfer Balance
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default IncExpBalanceTransfer
