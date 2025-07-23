import React, { useState } from 'react'
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
  CBadge,
  CButtonGroup,
} from '@coreui/react'

// Initial empty data for depreciation transfers
const initialDepreciation = []

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
    if (!date || !fromAsset || !toDepreciation || !depreciationValue.trim()) {
      alert('Please fill all required fields')
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
        depreciationValue: parseFloat(depreciationValue) || 0,
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

  // Delete functionality
  const handleDeleteDepreciation = (id) => {
    if (confirm('Are you sure you want to delete this depreciation transfer?')) {
      setDepreciation((prev) => prev.filter((dep) => dep.id !== id))
      if (editingDepreciationId === id) {
        handleClearDepreciationEdit()
      }
    }
  }

  // Clear edit form
  const handleClearDepreciationEdit = () => {
    setEditingDepreciationId(null)
    clearDepreciationForm()
  }

  // Filter depreciation
  const filteredDepreciations = depreciation.filter((dep) => {
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

  // Calculate total depreciation value
  const totalDepreciationValue = filteredDepreciations.reduce(
    (sum, dep) => sum + dep.depreciationValue,
    0,
  )

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">📉 Depreciation Balance Transfer</h6>
                <small className="text-muted">
                  Manage asset depreciation transfers and calculations
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                {editingDepreciationId && (
                  <CBadge color="warning" className="me-2">
                    Editing Mode
                  </CBadge>
                )}
                <CBadge color="info" className="me-2">
                  {depreciation.length} Transfers
                </CBadge>
                <CBadge color="success">₹{totalDepreciationValue.toFixed(2)}</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            {/* Depreciation Transfer Form */}
            <div className="mb-4">
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                {editingDepreciationId
                  ? '✏️ Edit Depreciation Transfer'
                  : '➕ Add New Depreciation Transfer'}
              </h6>

              <CForm onSubmit={handleSubmit}>
                <CRow className="g-2">
                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          📅 Transfer Date<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          🏭 From Asset<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      value={fromAsset}
                      onChange={(e) => setFromAsset(e.target.value)}
                    >
                      <option value="">Select Asset</option>
                      <option value="Machinery">🔧 Machinery</option>
                      <option value="Building">🏢 Building</option>
                      <option value="Vehicle">🚗 Vehicle</option>
                      <option value="Office Equipment">🖥️ Office Equipment</option>
                      <option value="Furniture">🪑 Furniture</option>
                      <option value="Computer">💻 Computer</option>
                    </CFormSelect>
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          📊 To Depreciation<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      value={toDepreciation}
                      onChange={(e) => setToDepreciation(e.target.value)}
                    >
                      <option value="">Select Depreciation</option>
                      <option value="Accumulated Depreciation">📉 Accumulated Depreciation</option>
                    </CFormSelect>
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      floatingClassName="mb-2"
                      floatingLabel={
                        <>
                          💰 Depreciation Value (₹)<span style={{ color: 'red' }}> *</span>
                        </>
                      }
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter depreciation value"
                      value={depreciationValue}
                      onChange={(e) => setDepreciationValue(e.target.value)}
                    />
                  </CCol>
                </CRow>

                <div className="d-flex gap-2 border-top pt-3">
                  <CButton
                    color={editingDepreciationId ? 'warning' : 'success'}
                    type="submit"
                    size="sm"
                    className="px-4"
                  >
                    {editingDepreciationId ? '✏️ Update Transfer' : '💾 Add Transfer'}
                  </CButton>
                  {editingDepreciationId && (
                    <CButton
                      color="outline-secondary"
                      size="sm"
                      onClick={handleClearDepreciationEdit}
                      className="px-4"
                    >
                      Cancel
                    </CButton>
                  )}
                  <CButton
                    color="outline-info"
                    size="sm"
                    onClick={clearDepreciationForm}
                    className="px-4"
                  >
                    Clear Form
                  </CButton>
                </div>
              </CForm>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-4">
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                🔍 Search & Filter Transfers
              </h6>
              <CRow className="g-2">
                <CCol lg={6} md={6}>
                  <CFormInput
                    size="sm"
                    floatingClassName="mb-2"
                    floatingLabel="🔍 Search Transfers"
                    type="text"
                    placeholder="Search by asset, depreciation, or date"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CCol>
                <CCol lg={6} md={6}>
                  <CFormInput
                    size="sm"
                    floatingClassName="mb-2"
                    floatingLabel="📅 Filter by Date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                </CCol>
              </CRow>
            </div>

            {/* Depreciation Transfers Table */}
            <div>
              <h6 className="text-muted fw-semibold mb-3 border-bottom pb-2">
                📋 All Depreciation Transfers
              </h6>

              {filteredDepreciations.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div style={{ fontSize: '2rem' }}>📉</div>
                  <p className="mb-0">No depreciation transfers found</p>
                  <small>
                    {depreciation.length === 0
                      ? 'Add your first depreciation transfer using the form above'
                      : 'Try adjusting your search or filter criteria'}
                  </small>
                </div>
              ) : (
                <div className="table-responsive">
                  <CTable hover small className="mb-0">
                    <CTableHead className="table-light">
                      <CTableRow>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          📅 Date
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          🏭 From Asset
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold">
                          📊 To Depreciation
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-end">
                          💰 Value (₹)
                        </CTableHeaderCell>
                        <CTableHeaderCell className="py-2 px-3 border-0 fw-semibold text-center">
                          Actions
                        </CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filteredDepreciations.map((dep) => (
                        <CTableRow
                          key={dep.id}
                          className={editingDepreciationId === dep.id ? 'table-warning' : ''}
                        >
                          <CTableDataCell className="py-2 px-3">
                            <div className="text-muted small">{dep.date}</div>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3">
                            <div className="fw-semibold text-muted">{dep.fromAsset}</div>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3">
                            <CBadge color="secondary" className="text-white">
                              {dep.toDepreciation}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3 text-end">
                            <span className="fw-semibold">₹{dep.depreciationValue.toFixed(2)}</span>
                          </CTableDataCell>
                          <CTableDataCell className="py-2 px-3 text-center">
                            <CButtonGroup size="sm">
                              <CButton
                                color="outline-warning"
                                onClick={() => handleEditDepreciation(dep.id)}
                                title="Edit transfer"
                              >
                                ✏️
                              </CButton>
                              <CButton
                                color="outline-danger"
                                onClick={() => handleDeleteDepreciation(dep.id)}
                                title="Delete transfer"
                              >
                                🗑️
                              </CButton>
                            </CButtonGroup>
                          </CTableDataCell>
                        </CTableRow>
                      ))}

                      {/* Summary Row */}
                      {filteredDepreciations.length > 1 && (
                        <CTableRow className="table-dark">
                          <CTableDataCell className="py-3 px-3 fw-bold" colSpan="3">
                            📊 Summary ({filteredDepreciations.length} Transfers)
                          </CTableDataCell>
                          <CTableDataCell className="py-3 px-3 text-end fw-bold">
                            <CBadge color="success" className="text-white fs-6 px-3 py-2">
                              ₹{totalDepreciationValue.toFixed(2)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="py-3 px-3"></CTableDataCell>
                        </CTableRow>
                      )}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DepreciationBalanceTransfer
