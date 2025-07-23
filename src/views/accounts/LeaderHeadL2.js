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
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CFormCheck,
  CSpinner,
  CBadge,
  CButtonGroup,
} from '@coreui/react'
import apiService from '../../api/accountManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const LedgerHeadL2 = () => {
  const [balanceSheetMaster, setBalanceSheetMaster] = useState([])
  const [ledgerAccountList, setLedgerAccountList] = useState([])
  const [states, setStates] = useState([])
  const [editingAccount, setEditingAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
    setSubmitting(true)
    try {
      if (editingAccount) {
        await apiService.update('ledger-head-l2/update', editingAccount.id, formData)
        alert('Account updated successfully!')
      } else {
        await apiService.create('ledger-head-l2/add', formData)
        alert('Account added successfully!')
      }
      await fetchData()
      clearForm()
      setEditingAccount(null)
    } catch (error) {
      console.error('Error saving account:', error)
      alert('Error saving account. Please try again.')
    } finally {
      setSubmitting(false)
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

  const getAccountTitleName = (accountTitleId) => {
    const balanceSheet = balanceSheetMaster.find((bs) => bs.id === accountTitleId)
    return balanceSheet ? balanceSheet.accountName : 'N/A'
  }

  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId)
    return state ? state.name : 'N/A'
  }

  const getStatusColor = (status) => {
    return status === 'Credit' ? 'success' : status === 'Debit' ? 'danger' : 'secondary'
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Ledger Accounts (L2)</h6>
                <small className="text-muted">Manage detailed ledger account information</small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingAccount && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info">{ledgerAccountList.length} Accounts</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {loading ? (
              <div className="text-center py-3">
                <CSpinner color="primary" size="sm" className="me-2" />
                <span className="text-muted">Loading ledger accounts...</span>
              </div>
            ) : (
              <>
                {/* Form Section - Full Width */}
                <div className="mb-4">
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    {editingAccount ? '✏️ Edit Ledger Account' : '➕ Add New Ledger Account'}
                  </h6>

                  <CForm onSubmit={handleSubmit}>
                    <CRow className="g-2">
                      {/* Account Title */}
                      <CCol xs={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🏦 Account Title"
                          value={formData.accountTitleId}
                          onChange={(e) =>
                            setFormData({ ...formData, accountTitleId: e.target.value })
                          }
                          disabled={submitting}
                        >
                          <option value="">Select account title</option>
                          {balanceSheetMaster.map((balanceSheet) => (
                            <option key={balanceSheet.id} value={balanceSheet.id}>
                              {balanceSheet.accountName}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      {/* Account Head Level & Status */}
                      <CCol lg={6} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📊 Account Head Level"
                          type="text"
                          placeholder="Enter account head level"
                          value={formData.accountHeadLevel}
                          onChange={(e) =>
                            setFormData({ ...formData, accountHeadLevel: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={6} md={6}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="💼 Status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          disabled={submitting}
                        >
                          <option value="">Select status</option>
                          <option value="Credit">💰 Credit</option>
                          <option value="Debit">📤 Debit</option>
                        </CFormSelect>
                      </CCol>

                      {/* Firm Name */}
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🏢 Firm/Company Name"
                          type="text"
                          placeholder="Enter firm or company name"
                          value={formData.firmName}
                          onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>

                      {/* Banking Details */}
                      <CCol lg={6} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🏛️ Bank Name"
                          type="text"
                          placeholder="Enter bank name"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={6} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🔢 Account Number"
                          type="text"
                          placeholder="Enter account number"
                          value={formData.accountNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, accountNumber: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>

                      {/* Financial Details */}
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="💰 Opening Balance (₹)"
                          type="number"
                          placeholder="Enter opening balance"
                          value={formData.openingBalance}
                          onChange={(e) =>
                            setFormData({ ...formData, openingBalance: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📉 Depreciation Rate (%)"
                          type="number"
                          placeholder="Enter depreciation rate"
                          value={formData.depreciationRate}
                          onChange={(e) =>
                            setFormData({ ...formData, depreciationRate: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={4} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📋 TDS Liability"
                          type="text"
                          placeholder="Enter TDS liability details"
                          value={formData.tdsLiability}
                          onChange={(e) =>
                            setFormData({ ...formData, tdsLiability: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>

                      {/* Address */}
                      <CCol xs={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📍 Complete Address"
                          type="text"
                          placeholder="Enter complete address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>

                      {/* Contact Details */}
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📞 Phone Number"
                          type="text"
                          placeholder="Enter phone number"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📱 Mobile Number"
                          type="text"
                          placeholder="Enter mobile number"
                          value={formData.mobileNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, mobileNumber: e.target.value })
                          }
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={4} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📧 Email Address"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>

                      {/* State & Tax Details */}
                      <CCol lg={3} md={6}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🗺️ State"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          disabled={submitting}
                        >
                          <option value="">Select state</option>
                          {states.map((state) => (
                            <option key={state.id} value={state.id}>
                              {state.name}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🆔 PAN Number"
                          type="text"
                          placeholder="ABCDE1234F"
                          value={formData.panNumber}
                          onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="🏷️ TIN Number"
                          type="text"
                          placeholder="Enter TIN number"
                          value={formData.tinNumber}
                          onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="📄 GSTIN"
                          type="text"
                          placeholder="Enter GSTIN"
                          value={formData.gstin}
                          onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                          disabled={submitting}
                        />
                      </CCol>

                      {/* Close Account Checkbox */}
                      <CCol xs={12} className="mb-3">
                        <CFormCheck
                          id="closeAccount"
                          label="🔒 Close Account (Mark account as closed)"
                          checked={formData.closeAccount === true}
                          onChange={(e) =>
                            setFormData({ ...formData, closeAccount: e.target.checked })
                          }
                          disabled={submitting}
                        />
                      </CCol>
                    </CRow>

                    <div className="d-flex gap-2 border-top pt-3">
                      <CButton
                        color={editingAccount ? 'warning' : 'success'}
                        type="submit"
                        size="sm"
                        disabled={submitting}
                        className="px-4"
                      >
                        {submitting ? (
                          <>
                            <CSpinner size="sm" className="me-1" />
                            {editingAccount ? 'Updating...' : 'Adding...'}
                          </>
                        ) : editingAccount ? (
                          'Update Account'
                        ) : (
                          'Add Account'
                        )}
                      </CButton>
                      {editingAccount && (
                        <CButton
                          color="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setEditingAccount(null)
                            clearForm()
                          }}
                          disabled={submitting}
                          className="px-4"
                        >
                          Cancel
                        </CButton>
                      )}
                    </div>
                  </CForm>
                </div>

                {/* Table Section - Full Width Below Form */}
                <div>
                  <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                    📊 All Ledger Accounts
                  </h6>

                  {ledgerAccountList.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div style={{ fontSize: '2rem' }}>📊</div>
                      <p className="mb-0">No ledger accounts added yet</p>
                      <small>Add your first ledger account using the form above</small>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <CTable hover small className="mb-0">
                        <CTableHead className="table-light">
                          <CTableRow>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Firm Name
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Bank Details
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                              Contact
                            </CTableHeaderCell>
                            <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                              Actions
                            </CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {ledgerAccountList.map((acc) => (
                            <CTableRow
                              key={acc.id}
                              className={`align-middle ${editingAccount?.id === acc.id ? 'table-warning' : ''}`}
                            >
                              <CTableDataCell className="py-2 px-3">
                                <div className="fw-semibold text-muted">
                                  {acc.firmName || 'N/A'}
                                </div>
                                {acc.status && (
                                  <CBadge color={getStatusColor(acc.status)} size="sm">
                                    {acc.status}
                                  </CBadge>
                                )}
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3">
                                <div className="text-muted small">
                                  <div>{acc.bankName || 'N/A'}</div>
                                  <div className="text-xs">{acc.accountNumber || 'N/A'}</div>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3">
                                <div className="text-muted small">
                                  <div>{acc.mobileNumber || 'N/A'}</div>
                                  <div className="text-xs">{acc.email || 'N/A'}</div>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell className="py-2 px-3 text-center">
                                <CButtonGroup size="sm">
                                  <CButton
                                    color="outline-warning"
                                    onClick={() => handleEdit(acc)}
                                    disabled={submitting}
                                    title="Edit account"
                                  >
                                    ✏️
                                  </CButton>
                                  <CButton
                                    color="outline-info"
                                    onClick={() => handleView(acc)}
                                    disabled={submitting}
                                    title="View details"
                                  >
                                    👁️
                                  </CButton>
                                </CButtonGroup>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                        </CTableBody>
                      </CTable>
                    </div>
                  )}
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* View Account Modal */}
      {viewingAccount && (
        <CModal visible={true} onClose={handleCloseModal} size="lg">
          <CModalHeader className="py-2">
            <h6 className="mb-0">📋 Account Details - {viewingAccount.firmName || 'N/A'}</h6>
          </CModalHeader>
          <CModalBody className="py-3">
            <CRow className="g-3">
              <CCol md={6}>
                <h6 className="text-muted border-bottom pb-1">🏦 Basic Information</h6>
                <p className="mb-2">
                  <strong>Account Title:</strong>{' '}
                  {getAccountTitleName(
                    viewingAccount.accountTitleId || viewingAccount.accountTitle?.id,
                  )}
                </p>
                <p className="mb-2">
                  <strong>Account Head Level:</strong> {viewingAccount.accountHeadLevel || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Firm Name:</strong> {viewingAccount.firmName || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong>
                  {viewingAccount.status && (
                    <CBadge color={getStatusColor(viewingAccount.status)} className="ms-2">
                      {viewingAccount.status}
                    </CBadge>
                  )}
                </p>
              </CCol>
              <CCol md={6}>
                <h6 className="text-muted border-bottom pb-1">🏛️ Banking Details</h6>
                <p className="mb-2">
                  <strong>Bank Name:</strong> {viewingAccount.bankName || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Account Number:</strong> {viewingAccount.accountNumber || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Opening Balance:</strong> ₹{viewingAccount.openingBalance || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Depreciation Rate:</strong> {viewingAccount.depreciationRate || 'N/A'}%
                </p>
              </CCol>
              <CCol md={6}>
                <h6 className="text-muted border-bottom pb-1">📞 Contact Information</h6>
                <p className="mb-2">
                  <strong>Address:</strong> {viewingAccount.address || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong> {viewingAccount.phoneNumber || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Mobile:</strong> {viewingAccount.mobileNumber || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {viewingAccount.email || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>State:</strong>{' '}
                  {getStateName(viewingAccount.state?.id || viewingAccount.state)}
                </p>
              </CCol>
              <CCol md={6}>
                <h6 className="text-muted border-bottom pb-1">📋 Tax Details</h6>
                <p className="mb-2">
                  <strong>PAN Number:</strong> {viewingAccount.panNumber || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>TIN Number:</strong> {viewingAccount.tinNumber || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>GSTIN:</strong> {viewingAccount.gstin || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>TDS Liability:</strong> {viewingAccount.tdsLiability || 'N/A'}
                </p>
                <p className="mb-2">
                  <strong>Account Status:</strong>
                  <CBadge
                    color={viewingAccount.closeAccount ? 'danger' : 'success'}
                    className="ms-2"
                  >
                    {viewingAccount.closeAccount ? '🔒 Closed' : '✅ Active'}
                  </CBadge>
                </p>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter className="py-2">
            <CButton color="secondary" size="sm" onClick={handleCloseModal}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </CRow>
  )
}

export default LedgerHeadL2
