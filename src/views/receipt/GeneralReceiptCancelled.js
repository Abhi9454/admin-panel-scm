import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'
import studentManagementApi from '../../api/studentManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const GeneralReceiptCancelled = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [generalReceipts, setGeneralReceipts] = useState([])
  const [formData, setFormData] = useState({
    registrationNumber: '',
  })
  const navigate = useNavigate()
  const location = useLocation()

  const fetchGeneralReceipts = async () => {
    if (!formData.registrationNumber) return

    setLoading(true)
    try {
      const data = await receiptManagementApi.getAll(
        `general-receipt/search/${formData.registrationNumber}`,
      )
      setGeneralReceipts(data)
    } catch (error) {
      console.error('Error fetching general receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleStatusChange = async (receiptId, newStatus) => {
    setLoading(true)
    try {
      await receiptManagementApi.create(`general-receipt/${receiptId}/deactivate`)
      setGeneralReceipts((prevReceipts) =>
        prevReceipts.map((receipt) =>
          receipt.id === receiptId ? { ...receipt, active: newStatus === 'Cancelled' } : receipt,
        ),
      )
    } catch (error) {
      console.error('Error updating receipt status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = (id) => {
    console.log(`Printing receipt ${id}`)
  }

  return (
    <CRow>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Search Student by Registration Number</strong>
          </CCardHeader>
          <CCardBody>
            <CForm
              onSubmit={(e) => {
                e.preventDefault()
                fetchGeneralReceipts()
              }}
            >
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Registration Number</CFormLabel>
                  <CFormInput
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? <CSpinner size="sm" /> : 'Search'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All General Receipts</strong>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner color="primary" />
              </div>
            ) : (
              <CTable hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Receipt No.</CTableHeaderCell>
                    <CTableHeaderCell>Student Name</CTableHeaderCell>
                    <CTableHeaderCell>Pay Mode</CTableHeaderCell>
                    <CTableHeaderCell>Fees</CTableHeaderCell>
                    <CTableHeaderCell>Fine</CTableHeaderCell>
                    <CTableHeaderCell>Concession</CTableHeaderCell>
                    <CTableHeaderCell>Received</CTableHeaderCell>
                    <CTableHeaderCell>Active</CTableHeaderCell>
                    <CTableHeaderCell>Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {generalReceipts.length > 0 ? (
                    generalReceipts.map((receipt, index) => (
                      <CTableRow key={receipt.id}>
                        <CTableDataCell>{index + 1}</CTableDataCell>
                        <CTableDataCell>{receipt.receiptNumber}</CTableDataCell>
                        <CTableDataCell>{receipt.studentName || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{receipt.payModeName || 'N/A'}</CTableDataCell>
                        <CTableDataCell>{receipt.fees}</CTableDataCell>
                        <CTableDataCell>{receipt.fine}</CTableDataCell>
                        <CTableDataCell>{receipt.concession}</CTableDataCell>
                        <CTableDataCell>{receipt.received}</CTableDataCell>
                        <CTableDataCell>
                          <CFormSelect
                            value={receipt.active ? 'Active' : 'Cancelled'}
                            onChange={(e) => handleStatusChange(receipt.id, e.target.value)}
                          >
                            <option value="Active">Active</option>
                            <option value="Cancelled">Cancelled</option>
                          </CFormSelect>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="primary"
                            size="sm"
                            onClick={() => handlePrint(receipt.id)}
                          >
                            Print
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="10" className="text-center">
                        No receipts found.
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GeneralReceiptCancelled
