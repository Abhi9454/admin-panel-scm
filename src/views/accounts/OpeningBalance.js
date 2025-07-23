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
  CBadge,
  CButtonGroup,
} from '@coreui/react'

const OpeningBalance = () => {
  const [accounts, setAccounts] = useState([])
  const [balanceSheetHeads, setBalanceSheetHeads] = useState([])
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setIsLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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
    } finally {
      setIsLoading(false)
    }
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
    setSaving(true)
    const updatedData = accounts.map(({ accountId, debit, credit }) => ({
      accountId,
      debit,
      credit,
    }))
    console.log(updatedData)
    try {
      await apiService.create('opening-balance/update', updatedData)
      setIsEditing(false)
      await fetchData() // Refresh data after save
    } catch (error) {
      console.error('Error updating records:', error)
      alert('Error saving opening balance. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchData() // Reset to original data
  }

  const isBalanced = totalDebit === totalCredit

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">💰 Opening Balance Management</h6>
                <small className="text-muted">
                  Set and manage opening balances for all accounts
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                {isEditing && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{accounts.length} Accounts</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading && accounts.length === 0 ? (
              <div className="text-center py-4">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading opening balance data...</span>
              </div>
            ) : (
              <>
                {/* Balance Status Alert */}
                <div className="mb-3">
                  <div
                    className={`p-3 rounded-3 ${isBalanced ? 'bg-success bg-opacity-10 border border-success' : 'bg-warning bg-opacity-10 border border-warning'}`}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className={`mb-1 ${isBalanced ? 'text-success' : 'text-warning'}`}>
                          {isBalanced
                            ? '✅ Balance Status: Balanced'
                            : '⚠️ Balance Status: Unbalanced'}
                        </h6>
                        <small className="text-muted">
                          {isBalanced
                            ? 'Total Debit equals Total Credit'
                            : 'Total Debit and Credit must be equal'}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">
                          Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accounts Table */}
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <CTable hover small className="mb-0">
                    <CTableHead className="table-light sticky-top">
                      <CTableRow>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          📊 Account Title
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          💸 Debit (₹)
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          💰 Credit (₹)
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {accounts.map((acc) => (
                        <CTableRow
                          key={acc.accountId}
                          className={isEditing ? 'table-warning table-warning-subtle' : ''}
                        >
                          <CTableDataCell className="py-2 px-3 align-middle">
                            <div className="fw-semibold text-muted">{acc.accountName}</div>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3 text-end align-middle">
                            {isEditing ? (
                              <CFormInput
                                size="sm"
                                type="number"
                                step="0.01"
                                min="0"
                                value={acc.debit}
                                onChange={(e) =>
                                  handleInputChange(acc.accountId, 'debit', e.target.value)
                                }
                                disabled={saving}
                                className="text-end"
                                placeholder="0.00"
                              />
                            ) : (
                              <span className="fw-semibold">
                                {acc.debit > 0 ? `₹${acc.debit.toFixed(2)}` : '-'}
                              </span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3 text-end align-middle">
                            {isEditing ? (
                              <CFormInput
                                size="sm"
                                type="number"
                                step="0.01"
                                min="0"
                                value={acc.credit}
                                onChange={(e) =>
                                  handleInputChange(acc.accountId, 'credit', e.target.value)
                                }
                                disabled={saving}
                                className="text-end"
                                placeholder="0.00"
                              />
                            ) : (
                              <span className="fw-semibold">
                                {acc.credit > 0 ? `₹${acc.credit.toFixed(2)}` : '-'}
                              </span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}

                      {/* Totals Row */}
                      <CTableRow className="table-dark">
                        <CTableDataCell className="py-3 px-3 fw-bold">
                          📋 Total ({accounts.length} Accounts)
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
                      </CTableRow>
                    </CTableBody>
                  </CTable>
                </div>

                {/* Action Buttons */}
                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-muted small">
                      {isEditing
                        ? '✏️ Click Save to apply changes or Cancel to discard'
                        : '👆 Click Update to modify opening balances'}
                    </div>
                    <CButtonGroup size="sm">
                      {isEditing ? (
                        <>
                          <CButton
                            color="success"
                            onClick={handleSave}
                            disabled={saving || loading}
                          >
                            {saving ? (
                              <>
                                <CSpinner size="sm" className="me-1" />
                                Saving...
                              </>
                            ) : (
                              '💾 Save Changes'
                            )}
                          </CButton>
                          <CButton
                            color="outline-secondary"
                            onClick={handleCancel}
                            disabled={saving || loading}
                          >
                            Cancel
                          </CButton>
                        </>
                      ) : (
                        <CButton color="primary" onClick={handleEdit} disabled={loading}>
                          ✏️ Update Balances
                        </CButton>
                      )}
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

export default OpeningBalance
