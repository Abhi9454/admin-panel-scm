import React, { useState } from 'react'
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
} from '@coreui/react'

// 6 sample data for depreciation transfers
const initialDepreciation = [
]

const DepreciationBalanceTransfer = () => {
  // Separate states for the form fields
  const [date, setDate] = useState('')
  const [fromAsset, setFromAsset] = useState('')
  const [toDepreciation, setToDepreciation] = useState('')
  const [depreciationValue, setDepreciationValue] = useState('')

  // Data list
  const [depreciation, setDepreciation] = useState(initialDepreciation)

  // Track editing ID
  const [editingDepreciationId, setEditingDepreciationId] = useState(null)

  // Filter/search states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    // Basic validation
    if (!date || !fromAsset || !toDepreciation || !depreciationValue) {
      return
    }

    if (editingDepreciationId !== null) {
      // Update existing record
      setDepreciation((prev) =>
        prev.map((dep) =>
          dep.id === editingDepreciationId
            ? {
                ...dep,
                date,
                fromAsset,
                toDepreciation,
                depreciationValue: parseFloat(depreciationValue) || 0,
              }
            : dep,
        ),
      )
      setEditingDepreciationId(null)
    } else {
      // Create new record
      const newDep = {
        id: depreciation.length + 1,
        date,
        fromAsset,
        toDepreciation,
        depreciationValue: parseFloat(depreciationValue) || 0
      }
      setDepreciation([...depreciation, newDep])
    }

    clearDepreciationForm()
  }

  // Clear form fields
  const clearDepreciationForm = () => {
    setDate('')
    setFromAsset('')
    setToDepreciation('')
    setDepreciationValue('')
  }

  // Edit functionality
  const handleEditDepreciation = (id) => {
    const depToEdit = depreciation.find((d) => d.id === id)
    if (depToEdit) {
      setEditingDepreciationId(id)
      setDate(depToEdit.date)
      setFromAsset(depToEdit.fromAsset)
      setToDepreciation(depToEdit.toDepreciation)
      setDepreciationValue(depToEdit.depreciationValue.toString())
    }
  }

  // Clear edit form
  const handleClearDepreciationEdit = () => {
    setEditingDepreciationId(null)
    clearDepreciationForm()
  }

  // Filter depreciation
  const filteredDepreciations = depreciation.filter(dep => {
    // 1) Filter by date if provided
    if (filterDate && dep.date !== filterDate) {
      return false
    }
    // 2) Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      if (
        !(
          dep.fromAsset.toLowerCase().includes(lowerSearch) ||
          dep.toDepreciation.toLowerCase().includes(lowerSearch) ||
          dep.date.toLowerCase().includes(lowerSearch)
        )
      ) {
        return false
      }
    }
    return true
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>
              {editingDepreciationId ? 'Edit Depreciation Transfer' : 'Add Depreciation Transfer'}
            </strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit} className="row g-3">
              <CCol md={6}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </CCol>
              <CCol md={6}>
                <CFormLabel>From Asset</CFormLabel>
                <CFormSelect value={fromAsset} onChange={(e) => setFromAsset(e.target.value)}>
                  <option value="">Select Asset</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Building">Building</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Office Equipment">Office Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Computer">Computer</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>To Depreciation</CFormLabel>
                <CFormSelect
                  value={toDepreciation}
                  onChange={(e) => setToDepreciation(e.target.value)}
                >
                  <option value="">Select Depreciation</option>
                  <option value="Accumulated Depreciation">Accumulated Depreciation</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Depreciation Value</CFormLabel>
                <CFormInput
                  type="number"
                  placeholder="Enter Depreciation Value"
                  value={depreciationValue}
                  onChange={(e) => setDepreciationValue(e.target.value)}
                />
              </CCol>
              <CCol xs={12}>
                <CButton color={editingDepreciationId ? 'warning' : 'success'} type="submit">
                  {editingDepreciationId ? 'Update Depreciation' : 'Add Depreciation'}
                </CButton>
                {editingDepreciationId && (
                  <CButton color="secondary" className="ms-2" onClick={handleClearDepreciationEdit}>
                    Clear
                  </CButton>
                )}
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="row g-3">
              <CCol md={6}>
                <CFormInput
                  type="text"
                  placeholder="Search Depreciations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormInput
                  type="date"
                  placeholder="Filter by Date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </CCol>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>From Asset</CTableHeaderCell>
                  <CTableHeaderCell>To Depreciation</CTableHeaderCell>
                  <CTableHeaderCell>Depreciation Value</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredDepreciations.map((dep) => (
                  <CTableRow key={dep.id}>
                    <CTableDataCell>{dep.date}</CTableDataCell>
                    <CTableDataCell>{dep.fromAsset}</CTableDataCell>
                    <CTableDataCell>{dep.toDepreciation}</CTableDataCell>
                    <CTableDataCell>{dep.depreciationValue}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" onClick={() => handleEditDepreciation(dep.id)}>
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

export default DepreciationBalanceTransfer
