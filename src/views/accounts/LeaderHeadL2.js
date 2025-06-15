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
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormCheck,
  CSpinner,
} from '@coreui/react'
import apiService from '../../api/accountManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const LeaderHeadL2 = () => {
  const [balanceSheetMaster, setBalanceSheetMaster] = useState([])
  const [leaderAccountList, setLedgerAccountList] = useState([])
  const [states, setStates] = useState([])
  const [editingAccount, setEditingAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewingAccount, setViewingAccount] = useState(null)

  const [formData, setFormData] = useState({
    accountTitleId: '',
    accountHeadLevel: '',
    firmName: '',
    bankName: '',
    accountNumber: '',
    openingBalance: '',
    status: '',
    tdsLiability: '',
    depreciationRate: '',
    address: '',
    phoneNumber: '',
    panNumber: '',
    mobileNumber: '',
    tinNumber: '',
    state: '',
    gstin: '',
    email: '',
    closeAccount: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [balanceSheetData, ledgerData, stateData] = await Promise.all([
        apiService.getAll('balance-sheet-head-master/all'),
        apiService.getAll('ledger-head-l2/all'),
        schoolManagementApi.getAll('state/all'),
      ])
      setStates(stateData)
      setBalanceSheetMaster(balanceSheetData)
      setLedgerAccountList(ledgerData)
      console.log(ledgerData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAccount) {
        await apiService.update('ledger-head-l2/update', editingAccount.id, formData)
        alert('Account updated successfully!')
      } else {
        await apiService.create('ledger-head-l2/add', formData)
        alert('Account added successfully!')
      }
      fetchData()
      clearForm()
      setEditingAccount(null)
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const clearForm = () => {
    setFormData({
      accountTitleId: '',
      accountHeadLevel: '',
      firmName: '',
      bankName: '',
      accountNumber: '',
      openingBalance: '',
      status: '',
      tdsLiability: '',
      depreciationRate: '',
      address: '',
      phoneNumber: '',
      panNumber: '',
      mobileNumber: '',
      tinNumber: '',
      state: '',
      gstin: '',
      email: '',
      closeAccount: false,
    })
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    // Map the account data to formData structure
    setFormData({
      accountTitleId: account.accountTitleId || account.accountTitle?.id || '',
      accountHeadLevel: account.accountHeadLevel || '',
      firmName: account.firmName || '',
      bankName: account.bankName || '',
      accountNumber: account.accountNumber || '',
      openingBalance: account.openingBalance || '',
      status: account.status || '',
      tdsLiability: account.tdsLiability || '',
      depreciationRate: account.depreciationRate || '',
      address: account.address || '',
      phoneNumber: account.phoneNumber || '',
      panNumber: account.panNumber || '',
      mobileNumber: account.mobileNumber || '',
      tinNumber: account.tinNumber || '',
      state: account.state?.id || account.state || '',
      gstin: account.gstin || '',
      email: account.email || '',
      closeAccount: account.closeAccount || false,
    })
  }

  const handleView = (account) => {
    setViewingAccount(account)
  }

  const handleCloseModal = () => {
    setViewingAccount(null)
  }

  // Helper function to get account title name
  const getAccountTitleName = (accountTitleId) => {
    const balanceSheet = balanceSheetMaster.find((bs) => bs.id === accountTitleId)
    return balanceSheet ? balanceSheet.accountName : 'N/A'
  }

  // Helper function to get state name
  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId)
    return state ? state.name : 'N/A'
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingAccount ? 'Edit Leader Head L2' : 'Add Leader Head L2'}</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
                <p>Loading data...</p>
              </div>
            ) : (
              <CForm onSubmit={handleSubmit} className="row g-2">
                <CCol md={6}>
                  <CFormLabel>Account Title</CFormLabel>
                  <CFormSelect
                    value={formData.accountTitleId}
                    onChange={(e) => setFormData({ ...formData, accountTitleId: e.target.value })}
                  >
                    <option value="">Select</option>
                    {balanceSheetMaster.map((balanceSheet) => (
                      <option key={balanceSheet.id} value={balanceSheet.id}>
                        {balanceSheet.accountName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Account Head Level</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.accountHeadLevel}
                    onChange={(e) => setFormData({ ...formData, accountHeadLevel: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Firm Name</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Bank Name</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Account Number</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Opening Balance</CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="">--Select Status--</option>
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>TDS Liability</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.tdsLiability}
                    onChange={(e) => setFormData({ ...formData, tdsLiability: e.target.value })}
                  />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Depreciation Rate</CFormLabel>
                  <CFormInput
                    type="number"
                    value={formData.depreciationRate}
                    onChange={(e) => setFormData({ ...formData, depreciationRate: e.target.value })}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Phone Number</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Mobile Number</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel>Address</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>PAN Number</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>TIN Number</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.tinNumber}
                    onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>GSTIN</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </CCol>
                <CCol md={4}>
                  <CFormLabel>State</CFormLabel>
                  <CFormSelect
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="">Select</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </CCol>
                <CCol md={12} className="d-flex align-items-center mt-4">
                  <CFormCheck
                    id="closeAccount"
                    label="Close Account"
                    checked={formData.closeAccount === true}
                    onChange={(e) => setFormData({ ...formData, closeAccount: e.target.checked })}
                  />
                </CCol>

                <div className="mt-3">
                  <CButton type="submit" color={editingAccount ? 'warning' : 'success'}>
                    {editingAccount ? 'Update Account' : 'Add Account'}
                  </CButton>
                  {editingAccount && (
                    <CButton
                      color="secondary"
                      className="ms-2"
                      onClick={() => {
                        setEditingAccount(null)
                        clearForm()
                      }}
                    >
                      Clear
                    </CButton>
                  )}
                </div>
              </CForm>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          {loading ? (
            <div className="text-center">
              <CSpinner color="primary" />
              <p>Loading data...</p>
            </div>
          ) : (
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Firm Name</CTableHeaderCell>
                    <CTableHeaderCell>Bank Name</CTableHeaderCell>
                    <CTableHeaderCell>Mobile Number</CTableHeaderCell>
                    <CTableHeaderCell>Account Number</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {leaderAccountList.map((acc) => (
                    <CTableRow key={acc.id}>
                      <CTableDataCell>{acc.firmName}</CTableDataCell>
                      <CTableDataCell>{acc.bankName}</CTableDataCell>
                      <CTableDataCell>{acc.mobileNumber}</CTableDataCell>
                      <CTableDataCell>{acc.accountNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(acc)}>
                          Edit
                        </CButton>
                        <CButton color="info" className="ms-2" onClick={() => handleView(acc)}>
                          View
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          )}
        </CCard>
      </CCol>

      {/* View Account Modal */}
      {viewingAccount && (
        <CModal visible={true} onClose={handleCloseModal}>
          <CModalHeader>Account Details</CModalHeader>
          <CModalBody>
            <p>
              <strong>Account Title:</strong>{' '}
              {getAccountTitleName(
                viewingAccount.accountTitleId || viewingAccount.accountTitle?.id,
              )}
            </p>
            <p>
              <strong>Account Head Level:</strong> {viewingAccount.accountHeadLevel || 'N/A'}
            </p>
            <p>
              <strong>Firm Name:</strong> {viewingAccount.firmName || 'N/A'}
            </p>
            <p>
              <strong>Bank Name:</strong> {viewingAccount.bankName || 'N/A'}
            </p>
            <p>
              <strong>Account Number:</strong> {viewingAccount.accountNumber || 'N/A'}
            </p>
            <p>
              <strong>Opening Balance:</strong> {viewingAccount.openingBalance || 'N/A'}
            </p>
            <p>
              <strong>Status:</strong> {viewingAccount.status || 'N/A'}
            </p>
            <p>
              <strong>TDS Liability:</strong> {viewingAccount.tdsLiability || 'N/A'}
            </p>
            <p>
              <strong>Depreciation Rate:</strong> {viewingAccount.depreciationRate || 'N/A'}
            </p>
            <p>
              <strong>Address:</strong> {viewingAccount.address || 'N/A'}
            </p>
            <p>
              <strong>Phone Number:</strong> {viewingAccount.phoneNumber || 'N/A'}
            </p>
            <p>
              <strong>PAN Number:</strong> {viewingAccount.panNumber || 'N/A'}
            </p>
            <p>
              <strong>Mobile Number:</strong> {viewingAccount.mobileNumber || 'N/A'}
            </p>
            <p>
              <strong>TIN Number:</strong> {viewingAccount.tinNumber || 'N/A'}
            </p>
            <p>
              <strong>State:</strong>{' '}
              {getStateName(viewingAccount.state?.id || viewingAccount.state)}
            </p>
            <p>
              <strong>GSTIN:</strong> {viewingAccount.gstin || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {viewingAccount.email || 'N/A'}
            </p>
            <p>
              <strong>Close Account:</strong> {viewingAccount.closeAccount ? 'Yes' : 'No'}
            </p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleCloseModal}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </CRow>
  )
}

export default LeaderHeadL2
