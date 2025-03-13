import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
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
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const CreateConcessionTitle = () => {
  const [selectedConcessionHead, setSelectedConcessionHead] = useState('')
  const [termList, setTermList] = useState([])
  const [studentType, setStudentType] = useState('new')
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
      console.log('terms: ', data)
      setTermList(data)

      // Initialize feeEntries with all terms set to 0 if not already set
      setFeeEntries((prevEntries) => {
        const updatedEntries = { ...prevEntries }
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
      console.log('receipt: ', data)
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
      console.error('Error fetching fee bills:', error)
    }
  }

  const fetchAllConcession = async () => {
    try {
      const data = await schoolManagementApi.getAll('concession-list/all')
      setConcessionList(data)
    } catch (error) {
      console.error('Error fetching fee bills:', error)
    }
  }

  const handleAmountChange = (termId, value) => {
    setFeeEntries((prevEntries) => ({
      ...prevEntries,
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

    console.log(concessionData)

    try {
      if (editingFeeBill) {
        await apiService.update(`concession-details/update/${editingFeeBill.id}`, concessionData)
      } else {
        await apiService.create('concession-details/add', concessionData)
      }
      alert('Fees bill created successfully!')
      fetchAllConcession()
    } catch (error) {
      console.error('Error creating fees bill:', error)
    }
  }

  const handleEdit = (concessions) => {
    console.log(concessions)
  }

  const handleCopyAsNew = (feeBill) => {
    setEditingFeeBill(null) // Ensure it's a new record
    setSelectedReceiptHead(feeBill.receiptHead.toString())
    setStudentType(feeBill.studentType)

    // Copy fee entries but do not copy the ID
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

              <CRow className="mt-3">
                <CCol xs={12}>
                  <strong>Value</strong>
                  <CTable hover>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Term</CTableHeaderCell>
                        <CTableHeaderCell>Amount</CTableHeaderCell>
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
                </CCol>
              </CRow>

              <CButton className="mt-3" color="success" type="submit">
                {editingFeeBill ? 'Update Concession List' : 'Add Concession List'}
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Fees Bills</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Receipt Head</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {concessionList.map((feeBill, index) => {
                  const receiptHeadName =
                    receiptHeads.find((fc) => fc.id === feeBill.receiptHead)?.headName || 'N/A'

                  return (
                    <CTableRow key={feeBill.id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
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
