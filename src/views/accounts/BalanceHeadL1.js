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
  CSpinner,
} from '@coreui/react'

import accountManagementApi from '../../api/accountManagementApi'

const BalanceHeadL1 = () => {
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('')
  const [sequenceNumber, setSequenceNumber] = useState('')
  const [accounts, setAccounts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

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
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accountName || !accountType || !sequenceNumber) return

    const accountData = {
      accountName,
      accountType,
      sequenceNumber: parseInt(sequenceNumber),
    }

    setLoading(true)
    try {
      if (editingId !== null) {
        await accountManagementApi.update('balance-sheet-head-master/', editingId, accountData)
        alert('Account updated successfully!')
      } else {
        await accountManagementApi.create('balance-sheet-head-master/add', accountData)
        alert('Account added successfully!')
      }
      handleClear()
    } catch (error) {
      // console.error('Error saving account:', error)
      // alert('Failed to save account. Please try again.')
    }
    fetchAccounts()
    setLoading(false)
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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>
              {editingId ? 'Edit Balance Sheet Head Master' : 'Balance Sheet Head Master'}
            </strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel>Account Name</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Enter Account Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel>Account Type</CFormLabel>
                <CFormSelect value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="ASSETS">ASSETS</option>
                  <option value="LIABILITY">LIABILITY</option>
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSES">EXPENSES</option>
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Sequence Number"
                  value={sequenceNumber}
                  onChange={(e) => setSequenceNumber(e.target.value)}
                />
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : editingId ? 'Update Account' : 'Add Account'}
              </CButton>
              {editingId && (
                <CButton
                  color="secondary"
                  className="ms-2"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Account List</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center">No records found</div>
            ) : (
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Account Name</CTableHeaderCell>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>Sequence</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {accounts.map((acc) => (
                    <CTableRow key={acc.id}>
                      <CTableDataCell>{acc.accountName}</CTableDataCell>
                      <CTableDataCell>{acc.accountType}</CTableDataCell>
                      <CTableDataCell>{acc.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(acc.id)}>
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BalanceHeadL1
