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

import accountManagementApi from '../../api/accountManagementApi'

const BalanceHeadL1 = () => {
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('')
  const [sequenceNumber, setSequenceNumber] = useState('')
  const [accounts, setAccounts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const response = await accountManagementApi.getAll('balance-sheet-head-master/all')
      console.log('account list:', response)
      setAccounts(response || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accountName.trim() || !accountType || !sequenceNumber.trim()) {
      alert('Please fill all required fields')
      return
    }

    const accountData = {
      accountName: accountName.trim(),
      accountType,
      sequenceNumber: parseInt(sequenceNumber),
    }

    setSubmitting(true)
    try {
      if (editingId !== null) {
        await accountManagementApi.update('balance-sheet-head-master', editingId, accountData)
        alert('Account updated successfully!')
        setEditingId(null)
      } else {
        await accountManagementApi.create('balance-sheet-head-master/add', accountData)
        alert('Account added successfully!')
      }
      handleClear()
      await fetchAccounts()
    } catch (error) {
      console.error('Error saving account:', error)
      alert('Failed to save account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (id) => {
    const accToEdit = accounts.find((acc) => acc.id === id)
    if (accToEdit) {
      setAccountName(accToEdit.accountName)
      setAccountType(accToEdit.accountType)
      setSequenceNumber(accToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setAccountName('')
    setAccountType('')
    setSequenceNumber('')
    setEditingId(null)
  }

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'ASSETS':
        return 'success'
      case 'LIABILITY':
        return 'danger'
      case 'INCOME':
        return 'info'
      case 'EXPENSES':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'ASSETS':
        return '💰'
      case 'LIABILITY':
        return '📋'
      case 'INCOME':
        return '📈'
      case 'EXPENSES':
        return '📉'
      default:
        return '💼'
    }
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Chart of Accounts (L1)</h6>
                <small className="text-muted">Manage balance sheet head master accounts</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingId && (
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
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading accounts...</span>
              </div>
            ) : (
              <CRow className="g-2">
                {/* Form Section */}
                <CCol lg={4} md={12} className="border-end">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingId ? '✏️ Edit Account' : '➕ Add New Account'}
                  </h6>
                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              Account Name<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          type="text"
                          id="accountName"
                          placeholder="Enter account name (e.g., Cash, Bank, Salary)"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel={
                            <>
                              Account Type<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          value={accountType}
                          onChange={(e) => setAccountType(e.target.value)}
                          disabled={submitting}
                        >
                          <option value="">Select Type</option>
                          <option value="ASSETS">💰 ASSETS</option>
                          <option value="LIABILITY">📋 LIABILITY</option>
                          <option value="INCOME">📈 INCOME</option>
                          <option value="EXPENSES">📉 EXPENSES</option>
                        </CFormSelect>
                      </CCol>
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-3"
                          floatingLabel={
                            <>
                              Sequence Number<span style={{ color: 'red' }}> *</span>
                            </>
                          }
                          type="number"
                          id="sequenceNumber"
                          placeholder="Enter sequence number for ordering"
                          value={sequenceNumber}
                          onChange={(e) => setSequenceNumber(e.target.value)}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol xs={12}>
                        <div className="d-flex gap-2">
                          <CButton
                            color={editingId ? 'warning' : 'success'}
                            type="submit"
                            size="sm"
                            disabled={submitting}
                            className="flex-grow-1"
                          >
                            {submitting ? (
                              <>
                                <CSpinner size="sm" className="me-1" />
                                {editingId ? 'Updating...' : 'Adding...'}
                              </>
                            ) : editingId ? (
                              'Update Account'
                            ) : (
                              'Add Account'
                            )}
                          </CButton>
                          {editingId && (
                            <CButton
                              color="outline-secondary"
                              size="sm"
                              onClick={handleClear}
                              disabled={submitting}
                            >
                              Cancel
                            </CButton>
                          )}
                        </div>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCol>

                {/* Table Section */}
                <CCol lg={8} md={12}>
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    💼 All Chart Accounts
                  </h6>

                  {loading && accounts.length > 0 ? (
                    <div className="text-center py-2 mb-3">
                      <CSpinner size="sm" className="me-2" />
                      <small className="text-muted">Refreshing accounts...</small>
                    </div>
                  ) : null}

                  {accounts.length === 0 && !loading ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>💼</div>
                      <p className="mb-0">No accounts added yet</p>
                      <small>Add your first chart account using the form</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Account Name
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Type
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Sequence
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                              Action
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {accounts
                            .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                            .map((acc) => (
                              <CTableRow
                                key={acc.id}
                                className={`align-middle ${editingId === acc.id ? 'table-warning' : ''}`}
                              >
                                <CTableDataCell className="py-2 px-3">
                                  <div className="fw-semibold text-muted">{acc.accountName}</div>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge
                                    color={getAccountTypeColor(acc.accountType)}
                                    className="text-white"
                                  >
                                    {getAccountTypeIcon(acc.accountType)} {acc.accountType}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3">
                                  <CBadge color="secondary" className="text-white">
                                    #{acc.sequenceNumber}
                                  </CBadge>
                                </CTableDataCell>
                                <CTableDataCell className="py-2 px-3 text-center">
                                  <CButton
                                    color="outline-warning"
                                    size="sm"
                                    onClick={() => handleEdit(acc.id)}
                                    disabled={submitting}
                                    title="Edit account"
                                  >
                                    ✏️ Edit
                                  </CButton>
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  )}
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BalanceHeadL1
