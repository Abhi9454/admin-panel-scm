import React, { useEffect, useState } from 'react'
import apiService from '../../api/accountManagementApi'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CRow,
  CFormInput,
  CSpinner,
} from '@coreui/react'

const OpeningBalance = () => {
  const [accounts, setAccounts] = useState([])
  const [balanceSheetHeads, setBalanceSheetHeads] = useState([])
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  // Fetch both Balance Sheet Heads and Opening Balance
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const balanceHeadData = await apiService.getAll('balance-sheet-head-master/all')
      setBalanceSheetHeads(balanceHeadData)

      const openingBalanceData = await apiService.getAll('opening-balance/all')

      // If opening balance is empty, initialize all accounts with zero
      let mappedAccounts
      if (openingBalanceData.length === 0) {
        mappedAccounts = balanceHeadData.map((head) => ({
          accountId: head.id,
          accountName: head.accountName,
          debit: 0,
          credit: 0,
        }))
      } else {
        mappedAccounts = balanceHeadData.map((head) => {
          const balance = openingBalanceData.find((b) => b.accountId === head.id) || {
            debit: 0,
            credit: 0,
          }
          return {
            accountId: head.id,
            accountName: head.accountName,
            debit: balance.debit,
            credit: balance.credit,
          }
        })
      }

      setAccounts(mappedAccounts)
      calculateTotals(mappedAccounts)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setIsLoading(false)
  }

  // Calculate Totals
  const calculateTotals = (accounts) => {
    let debitTotal = accounts.reduce((sum, acc) => sum + acc.debit, 0)
    let creditTotal = accounts.reduce((sum, acc) => sum + acc.credit, 0)
    setTotalDebit(debitTotal)
    setTotalCredit(creditTotal)
  }

  // Handle Input Change for Debit/Credit
  const handleInputChange = (accountId, field, value) => {
    const updatedAccounts = accounts.map((acc) =>
      acc.accountId === accountId ? { ...acc, [field]: value ? parseFloat(value) : 0 } : acc,
    )
    setAccounts(updatedAccounts)
    calculateTotals(updatedAccounts)
  }

  // Enable Editing Mode
  const handleEdit = () => {
    setIsEditing(true)
  }

  // Save Updated Values
  const handleSave = async () => {
    setIsLoading(true)
    const updatedData = accounts.map(({ accountId, debit, credit }) => ({
      accountId,
      debit,
      credit,
    }))
    console.log(updatedData)
    try {
      await apiService.create('opening-balance/update', updatedData)
      setIsEditing(false)
      fetchData() // Refresh data after save
    } catch (error) {
      console.error('Error updating records:', error)
    }
    setIsLoading(false)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="text-center fw-bold fs-5">Set Opening Balance</CCardHeader>
          <CCardBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <CTable bordered hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Account Title</CTableHeaderCell>
                  <CTableHeaderCell>Debit</CTableHeaderCell>
                  <CTableHeaderCell>Credit</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              {loading ? (
                <div className="text-center">
                  <CSpinner color="primary" />
                  <p>Loading data...</p>
                </div>
              ) : (
                <CTableBody>
                  {accounts.map((acc) => (
                    <CTableRow key={acc.accountId}>
                      <CTableDataCell>{acc.accountName}</CTableDataCell>
                      <CTableDataCell>
                        {isEditing ? (
                          <CFormInput
                            type="number"
                            value={acc.debit}
                            onChange={(e) =>
                              handleInputChange(acc.accountId, 'debit', e.target.value)
                            }
                          />
                        ) : (
                          acc.debit
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        {isEditing ? (
                          <CFormInput
                            type="number"
                            value={acc.credit}
                            onChange={(e) =>
                              handleInputChange(acc.accountId, 'credit', e.target.value)
                            }
                          />
                        ) : (
                          acc.credit
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  <CTableRow className="fw-bold text-danger">
                    <CTableDataCell>Total {accounts.length} Record(s) Found.</CTableDataCell>
                    <CTableDataCell>{totalDebit.toFixed(2)}</CTableDataCell>
                    <CTableDataCell>{totalCredit.toFixed(2)}</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              )}
            </CTable>
          </CCardBody>
          <CCardBody className="d-flex justify-content-center gap-3">
            <CButton
              color={isEditing ? 'success' : 'primary'}
              onClick={isEditing ? handleSave : handleEdit}
            >
              {isEditing ? 'Save' : 'Update'}
            </CButton>
            <CButton color="info">Print</CButton>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default OpeningBalance
