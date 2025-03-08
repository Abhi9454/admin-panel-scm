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
} from '@coreui/react'
import apiService from '../../api/accountManagementApi' // Import API service

const AccountSetUp = () => {
  const [accountTitle, setAccountTitle] = useState('')
  const [accounts, setAccounts] = useState([])
  const [editingId, setEditingId] = useState(null) // Track editing account ID

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await apiService.getAll('account-title/all') // Fetch accounts from API
      setAccounts(response)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accountTitle) return

    try {
      if (editingId) {
        // Update existing account
        await apiService.update(`account-title/${editingId}`, { name: accountTitle })
        setAccounts(
          accounts.map((acc) => (acc.id === editingId ? { ...acc, name: accountTitle } : acc)),
        )
        setEditingId(null)
      } else {
        // Create new account
        const response = await apiService.create('account-title/add', { name: accountTitle })
        setAccounts([...accounts, response])
      }

      setAccountTitle('')
    } catch (error) {
      console.error('Error saving account:', error)
    }
  }

  const handleEdit = (id) => {
    const accToEdit = accounts.find((acc) => acc.id === id)
    if (accToEdit) {
      setAccountTitle(accToEdit.name)
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setAccountTitle('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Account' : 'Add New Account'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="accountTitle">Account Title</CFormLabel>
                <CFormInput
                  type="text"
                  id="accountTitle"
                  placeholder="Enter Account Title"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                />
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Account' : 'Add Account'}
              </CButton>
              {editingId && (
                <CButton color="secondary" className="ms-2" onClick={handleClear}>
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
            <strong>All Accounts</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">Account Title</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {accounts.map((acc) => (
                  <CTableRow key={acc.id}>
                    <CTableDataCell>{acc.name}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEdit(acc.id)}>
                        Edit
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AccountSetUp
