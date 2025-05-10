import React, { useState } from 'react'
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
  CFormSelect,
  CFormText,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import studentManagementApi from 'src/api/studentManagementApi'

const RefundableFees = () => {
  const [studentId, setStudentId] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [debounceTimeout, setDebounceTimeout] = useState(null)
  const [formData, setFormData] = useState({
    admissionNumber: '',
    receivedDate: '',
    referenceNumber: '',
    Amount: '',
    payMode: '',
    remarks: '',
  })

  const handleLiveSearch = async (value) => {
    console.log(value)
    setStudentId(value)

    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    // Set a new debounce timeout to trigger search after 300ms
    const timeout = setTimeout(async () => {
      try {
        setLoading(true) // Show loading spinner
        const response = await studentManagementApi.getById('search', value)
        setSearchResults(Array.isArray(response) ? response : [])
        setShowDropdown(response.length > 0)
      } catch (error) {
        console.error('Search failed', error)
        setSearchResults([])
      } finally {
        setLoading(false) // Hide loading spinner
      }
    }, 300)

    // Save the timeout ID for future cleanup
    setDebounceTimeout(timeout)
  }

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelect = (admissionNumber) => {
    setStudentId(admissionNumber)
    setShowDropdown(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await studentManagementApi.update(
        'refundable-security',
        formData.admissionNumber,
        formData,
      )
      if (response === false) {
        alert('No Student found!')
      } else {
        alert('Data Added!')
      }
      console.log('API Response:', response)
    } catch (error) {
      console.error('Error updating student left date:', error)
      alert('Failed to update student left date!')
    }
  }
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Refundable Fees</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Refundable Fees</p>
            <CForm className="row g-3" onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol xs={6}>
                  <CCard className="mb-4">
                    <CCardHeader>
                      <strong>Search Student by Admission Number</strong>
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="mb-3 position-relative">
                        <CCol md={12}>
                          <CFormInput
                            floatingClassName="mb-3"
                            floatingLabel={
                              <>
                                Enter or Search Admission Number
                                <span style={{ color: 'red' }}> *</span>
                              </>
                            }
                            type="text"
                            id="studentId"
                            placeholder="Enter or Search Admission Number"
                            value={studentId}
                            onChange={(e) => handleLiveSearch(e.target.value)}
                            autoComplete="off"
                          />
                          {showDropdown && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                zIndex: 999,
                                width: '100%',
                                border: '1px solid #ccc',
                                borderRadius: '0 0 4px 4px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                              }}
                            >
                              {searchResults.map((result, index) => (
                                <div
                                  key={index}
                                  style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #444',
                                    backgroundColor: '#777',
                                    color: 'white',
                                  }}
                                  onClick={() => handleSelect(result.admissionNumber)}
                                >
                                  {result.admissionNumber} - {result.name} - {result.className} -{' '}
                                  {result.sectionName}
                                </div>
                              ))}
                            </div>
                          )}
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
              <CCol md={3}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Received Date<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="date"
                  id="receivedDate"
                  placeholder="Received Date"
                  value={formData.receivedDate}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Reference Number<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="text"
                  id="referenceNumber"
                  placeholder="Reference Number"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Amount<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="text"
                  id="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={3}>
                <CFormSelect
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Pay Mode<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  id="payMode"
                  placeholder="Pay Mode"
                  value={formData.payMode}
                  onChange={handleChange}
                >
                  <option>Cash</option>
                  <option>Online</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormTextarea
                  floatingClassName="mb-3"
                  floatingLabel={
                    <>
                      Remarks<span style={{ color: 'red' }}> *</span>
                    </>
                  }
                  type="textArea"
                  id="remarks"
                  placeholder="Enter Remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Add Request
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RefundableFees
