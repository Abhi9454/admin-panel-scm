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
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const CreateConcessionTitle = () => {
  const [selectedConcessionHead, setSelectedConcessionHead] = useState('')
  const [termList, setTermList] = useState([])
  const [receiptHeads, setReceiptHeads] = useState([])
  const [feeEntries, setFeeEntries] = useState({})
  const [selectedReceiptHead, setSelectedReceiptHead] = useState('')
  const [concessionTitle, setConcessionTitle] = useState([])
  const [concessionList, setConcessionList] = useState([])
  const [editingFeeBill, setEditingFeeBill] = useState(null)

  useEffect(() => {
    fetchTerm()
    fetchReceiptHeads()
    fetchConcessionTitle()
    fetchAllConcession()
  }, [])

  const fetchTerm = async () => {
    try {
      const data = await schoolManagementApi.getAll('term/all')
      setTermList(data)
      setFeeEntries((prev) => {
        const updatedEntries = { ...prev }
        data.forEach((term) => {
          if (!(term.id in updatedEntries)) {
            updatedEntries[term.id] = 0
          }
        })
        return updatedEntries
      })
    } catch (error) {
      console.error('Error fetching terms:', error)
    }
  }

  const fetchReceiptHeads = async () => {
    try {
      const data = await apiService.getAll('receipt-head/all')
      setReceiptHeads(data)
    } catch (error) {
      console.error('Error fetching receipt heads:', error)
    }
  }

  const fetchConcessionTitle = async () => {
    try {
      const data = await schoolManagementApi.getAll('concession/all')
      setConcessionTitle(data)
    } catch (error) {
      console.error('Error fetching concession titles:', error)
    }
  }

  const fetchAllConcession = async () => {
    try {
      const data = await apiService.getAll('concession-details/all')
      console.log('This is concession list : ' + data)
      setConcessionList(data)
    } catch (error) {
      console.error('Error fetching concession details:', error)
    }
  }

  const handleAmountChange = (termId, value) => {
    setFeeEntries((prev) => ({
      ...prev,
      [termId]: value ? parseInt(value) : 0,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const concessionData = {
      receiptHead: selectedReceiptHead ? parseInt(selectedReceiptHead) : null,
      concessionTitle: selectedConcessionHead ? parseInt(selectedConcessionHead) : null,
      feeEntries,
    }
    try {
      if (editingFeeBill) {
        await apiService.update(`concession-details/update/${editingFeeBill.id}`, concessionData)
      } else {
        await apiService.create('concession-details/add', concessionData)
      }
      alert('Concession saved successfully!')
      fetchAllConcession()
    } catch (error) {
      console.error('Error saving concession:', error)
    }
  }

  const handleEdit = (feeBill) => {
    setEditingFeeBill(feeBill)
    setSelectedReceiptHead(feeBill.receiptHead.toString())
    setSelectedConcessionHead(feeBill.concessionTitle.toString())
    setFeeEntries({ ...feeBill.feeEntries })
  }

  const handleCopyAsNew = (feeBill) => {
    setEditingFeeBill(null)
    setSelectedReceiptHead(feeBill.receiptHead.toString())
    setSelectedConcessionHead(feeBill.concessionTitle.toString())
    setFeeEntries({ ...feeBill.feeEntries })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingFeeBill ? 'Edit Concession' : 'Create Concession'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>Select Concession Head</CFormLabel>
                  <CFormSelect
                    value={selectedConcessionHead}
                    onChange={(e) => setSelectedConcessionHead(e.target.value)}
                  >
                    <option value="">Select Concession Head</option>
                    {concessionTitle.map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Receipt Head</CFormLabel>
                  <CFormSelect
                    value={selectedReceiptHead}
                    onChange={(e) => setSelectedReceiptHead(e.target.value)}
                  >
                    <option value="">Select Receipt Head</option>
                    {receiptHeads.map((head) => (
                      <option key={head.id} value={head.id}>
                        {head.headName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Term</CTableHeaderCell>
                    <CTableHeaderCell>Concession Percentage (%)</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {termList.map((term) => (
                    <CTableRow key={term.id}>
                      <CTableDataCell>{term.name}</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          value={feeEntries[term.id] ?? 0}
                          onChange={(e) => handleAmountChange(term.id, e.target.value)}
                        />
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
              <CButton className="mt-3" color="success" type="submit">
                {editingFeeBill ? 'Update Concession' : 'Add Concession'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Concessions List</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Concession Head</CTableHeaderCell>
                  <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {concessionList.map((feeBill, index) => {
                  const receiptHeadName =
                    receiptHeads.find((head) => head.id === feeBill.receiptHead)?.headName || 'N/A'

                  const concessionHeadName =
                    concessionTitle.find((title) => title.id === feeBill.concessionTitle)?.name ||
                    'N/A'

                  return (
                    <CTableRow key={feeBill.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{concessionHeadName}</CTableDataCell>
                      <CTableDataCell>{receiptHeadName}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" size="sm" onClick={() => handleEdit(feeBill)}>
                          Edit
                        </CButton>
                        <CButton
                          color="primary"
                          size="sm"
                          className="ms-2"
                          onClick={() => handleCopyAsNew(feeBill)}
                        >
                          Copy as New
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}
export default CreateConcessionTitle
