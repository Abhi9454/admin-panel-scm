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
    accountTitle: '',
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
    closeAccount: '',
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
        await apiService.update('ledger-head-l2/', editingAccount.id, formData)
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
      accountTitle: '',
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
      closeAccount: '',
    })
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setFormData(account)
  }

  const handleView = (account) => {
    setViewingAccount(account)
  }

  const handleCloseModal = () => {
    setViewingAccount(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingAccount ? 'Edit Leader Head L2' : 'Add Leader Head L2'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-2">
              <CCol md={6}>
                <CFormLabel>Account Title</CFormLabel>
                <CFormSelect
                  value={formData.accountTitle}
                  onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
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
              <CCol md={6}>
                <CFormLabel>Phone Number</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                  checked={formData.closeAccount === 'Yes'}
                  onChange={(e) =>
                    setFormData({ ...formData, closeAccount: e.target.checked ? 'Yes' : 'No' })
                  }
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
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
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
        </CCard>
      </CCol>

      {/* View Account Modal */}
      {viewingAccount && (
        <CModal visible={true} onClose={handleCloseModal}>
          <CModalHeader>Account Details</CModalHeader>
          <CModalBody>
            <p>
              <strong>Account Title:</strong> {viewingAccount.accountTitle}
            </p>
            <p>
              <strong>Account Head Level:</strong> {viewingAccount.accountHeadLevel}
            </p>
            <p>
              <strong>Firm Name:</strong> {viewingAccount.firmName}
            </p>
            <p>
              <strong>Bank Name:</strong> {viewingAccount.bankName}
            </p>
            <p>
              <strong>Account Number:</strong> {viewingAccount.accountNumber}
            </p>
            <p>
              <strong>Opening Balance:</strong> {viewingAccount.openingBalance}
            </p>
            <p>
              <strong>Status:</strong> {viewingAccount.status}
            </p>
            <p>
              <strong>TDS Liability:</strong> {viewingAccount.tdsLiability}
            </p>
            <p>
              <strong>Depreciation Rate:</strong> {viewingAccount.depreciationRate}
            </p>
            <p>
              <strong>Address:</strong> {viewingAccount.address}
            </p>
            <p>
              <strong>Phone Number:</strong> {viewingAccount.phoneNumber}
            </p>
            <p>
              <strong>PAN Number:</strong> {viewingAccount.panNumber}
            </p>
            <p>
              <strong>Mobile Number:</strong> {viewingAccount.mobileNumber}
            </p>
            <p>
              <strong>TIN Number:</strong> {viewingAccount.tinNumber}
            </p>
            <p>
              <strong>State:</strong> {viewingAccount.state}
            </p>
            <p>
              <strong>GSTIN:</strong> {viewingAccount.gstin}
            </p>
            <p>
              <strong>Email:</strong> {viewingAccount.email}
            </p>
            <p>
              <strong>Close Account:</strong> {viewingAccount.closeAccount}
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
