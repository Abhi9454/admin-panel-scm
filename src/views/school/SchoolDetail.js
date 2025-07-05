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
  CSpinner,
} from '@coreui/react'
import schoolManagementApi from '../../api/schoolManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const SchoolDetail = () => {
  const [school, setSchool] = useState({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [receiptBooks, setReceiptBooks] = useState([])
  const [loadingReceipts, setLoadingReceipts] = useState(false)
  const [schoolId] = useState('1') // Default school ID

  useEffect(() => {
    fetchSchoolDetails()
    fetchReceiptBooks()
  }, [])

  const fetchSchoolDetails = async () => {
    try {
      setLoading(true)
      const data = await schoolManagementApi.getAll('school-summary')
      if (data) {
        setSchool(data)
        console.log(data)
        setEditing(true)
      }
    } catch (error) {
      console.error('Error fetching school details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReceiptBooks = async () => {
    try {
      setLoadingReceipts(true)
      const data = await receiptManagementApi.getAll('receipt-head/all')
      setReceiptBooks(data || [])
    } catch (error) {
      console.error('Error fetching receipt books:', error)
      setReceiptBooks([])
    } finally {
      setLoadingReceipts(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSchool((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (editing) {
        await schoolManagementApi.update('school-summary/update', school.id, school)
      } else {
        await schoolManagementApi.create('school-summary/add', school)
      }
      alert('Details updated successfully.')
      fetchSchoolDetails()
    } catch (error) {
      console.error('Error saving school details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !school?.id) {
    return (
      <div className="text-center m-5">
        <CSpinner color="primary" />
        <p>Loading school details...</p>
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>School Setup Form</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              {/* Basic Details Card */}
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>School Address Setup</strong>
                </CCardHeader>
                <CCardBody>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>Address</CFormLabel>
                    </CCol>
                    <CCol md={9}>
                      <CFormInput
                        type="text"
                        name="address"
                        value={school?.schoolAddress || ''}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>Email ID</CFormLabel>
                    </CCol>
                    <CCol md={9}>
                      <CFormInput
                        type="email"
                        name="emailId"
                        value={school?.emailId || ''}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>Bank A/c No.</CFormLabel>
                    </CCol>
                    <CCol md={9}>
                      <CFormInput
                        type="text"
                        name="bankAccountNo"
                        value={school?.bankAccountNo || ''}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>PAN No.</CFormLabel>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        name="panNo"
                        value={school?.panNo || ''}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>TAN No.</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="text"
                        name="tanNo"
                        value={school?.tanNo || ''}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>P.F. No.</CFormLabel>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="text"
                        name="pfNo"
                        value={school?.pfNo || ''}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>ESI No.</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="text"
                        name="esiNo"
                        value={school?.esiNo || ''}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Accounts Setup */}
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>Accounts Setup (Select Account For) And Amount</strong>
                </CCardHeader>
                <CCardBody>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Cash in Hand</CFormLabel>
                    </CCol>
                    <CCol md={6}>
                      {loadingReceipts ? (
                        <CSpinner size="sm" />
                      ) : (
                        <CFormSelect
                          name="cashInHand"
                          value={school?.cashInHand || ''}
                          onChange={handleChange}
                        >
                          <option value="">Select Account</option>
                          {receiptBooks && receiptBooks.length > 0 ? (
                            receiptBooks.map((book) => (
                              <option key={book.id} value={book.id}>
                                {book.headName}
                              </option>
                            ))
                          ) : (
                            <option disabled>No receipt books available</option>
                          )}
                        </CFormSelect>
                      )}
                    </CCol>
                    <CCol md={2}>
                      <CButton color="info" size="sm">
                        Bank Accounts
                      </CButton>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Refundable Fees</CFormLabel>
                    </CCol>
                    <CCol md={8}>
                      <CFormSelect
                        name="refundableFees"
                        value={school?.refundableFees || ''}
                        onChange={handleChange}
                      >
                        <option value="">Select Account</option>
                        {receiptBooks && receiptBooks.length > 0 ? (
                          receiptBooks.map((book) => (
                            <option key={book.id} value={book.id}>
                              {book.headName}
                            </option>
                          ))
                        ) : (
                          <option disabled>No receipt books available</option>
                        )}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Fine Fees Head</CFormLabel>
                    </CCol>
                    <CCol md={8}>
                      {loadingReceipts ? (
                        <CSpinner size="sm" />
                      ) : (
                        <CFormSelect
                          name="fineFeesHead"
                          value={school?.fineFeesHead || ''}
                          onChange={handleChange}
                        >
                          <option value="">Select Account</option>
                          {receiptBooks && receiptBooks.length > 0 ? (
                            receiptBooks.map((book) => (
                              <option key={book.id} value={book.id}>
                                {book.headName}
                              </option>
                            ))
                          ) : (
                            <option disabled>No receipt books available</option>
                          )}
                        </CFormSelect>
                      )}
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Fine Exemption After Due Date</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="fineExemptionDays"
                        value={school?.fineExemptionDays}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Default Days</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="defaultDays"
                        value={school?.defaultDays}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Fine Amount</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="fineAmount"
                        value={school?.fineAmount}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={4}>
                      <CFormLabel>Fine Exempt Fees Less then</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="fineExemptFees"
                        value={school?.fineExemptFees}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={4}>
                      <CFormLabel>Max Fine</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="maxFine"
                        value={school?.maxFine}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Employee Setup */}
              <CCard className="mb-4">
                <CCardHeader>
                  <strong>Employee Setup</strong>
                </CCardHeader>
                <CCardBody>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>D.A.(In %)</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="number"
                        name="daPercentage"
                        value={school?.daPercentage}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={3}>
                      <CFormLabel>H.R.A.(%)</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="number"
                        name="hraPercentage"
                        value={school?.hraPercentage}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={12}>
                      <CFormLabel>
                        <strong>Annual Leaves</strong>
                      </CFormLabel>
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={2}>
                      <CFormLabel>Other Emp.</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="otherEmpPayable"
                        value={school?.otherEmpPayable}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Payable</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>Non Payable</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="otherEmpNonPayable"
                        value={school?.otherEmpNonPayable}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={2}>
                      <CFormLabel>IV Class Emp.</CFormLabel>
                    </CCol>
                    <CCol md={2}>
                      <CFormInput
                        type="number"
                        name="ivClassEmpPayable"
                        value={school?.ivClassEmpPayable}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={6}>
                      <CFormInput
                        type="number"
                        name="ivClassEmpNonPayable"
                        value={school?.ivClassEmpNonPayable}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Max. P.F.(8.33%) Per Emp</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="number"
                        name="maxPfPerEmp"
                        value={school?.maxPfPerEmp}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CFormLabel>Full Time Total Period's</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="number"
                        name="fullTimePeriods"
                        value={school?.fullTimePeriods}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>

                  {/* Deduct P.F. Section */}
                  <CCard className="mb-3" style={{ backgroundColor: '#333333' }}>
                    <CCardBody>
                      <CRow className="mb-2">
                        <CCol md={12}>
                          <CFormLabel>
                            <strong>Deduct P.F.</strong>
                          </CFormLabel>
                        </CCol>
                      </CRow>
                      <CRow className="mb-2">
                        <CCol md={2}>
                          <CFormLabel>PF1 (%)</CFormLabel>
                        </CCol>
                        <CCol md={3}>
                          <CFormInput
                            type="number"
                            name="pf1Percentage"
                            value={school?.pf1Percentage}
                            onChange={handleChange}
                          />
                        </CCol>
                        <CCol md={2}>
                          <CFormLabel>PF2 (%)</CFormLabel>
                        </CCol>
                        <CCol md={3}>
                          <CFormInput
                            type="number"
                            name="pf2Percentage"
                            value={school?.pf2Percentage}
                            onChange={handleChange}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-2">
                        <CCol md={2}>
                          <CFormLabel>Total (%)</CFormLabel>
                        </CCol>
                        <CCol md={3}>
                          <CFormInput
                            type="number"
                            name="totalPercentage"
                            value={school?.totalPercentage}
                            onChange={handleChange}
                          />
                        </CCol>
                        <CCol md={2}>
                          <CFormLabel>Limited</CFormLabel>
                        </CCol>
                        <CCol md={3}>
                          <CFormInput
                            type="number"
                            name="limited"
                            value={school?.limited}
                            onChange={handleChange}
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>

                  <CRow className="mb-3">
                    <CCol md={2}>
                      <CFormLabel>ESI1-(%)</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="number"
                        name="esi1Percentage"
                        value={school?.esi1Percentage}
                        onChange={handleChange}
                      />
                    </CCol>
                    <CCol md={2}>
                      <CFormLabel>ESI2-(%)</CFormLabel>
                    </CCol>
                    <CCol md={3}>
                      <CFormInput
                        type="number"
                        name="esi2Percentage"
                        value={school?.esi2Percentage}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={3}>
                      <CFormLabel>ESI Limit</CFormLabel>
                    </CCol>
                    <CCol md={4}>
                      <CFormInput
                        type="number"
                        name="esiLimit"
                        value={school?.esiLimit}
                        onChange={handleChange}
                      />
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>

              {/* Submit Button */}
              <CRow>
                <CCol md={12}>
                  <CCard>
                    <CCardBody>
                      <CRow>
                        <CCol md={12} className="text-center">
                          <CButton
                            color="success"
                            type="submit"
                            disabled={loading}
                            className="me-2"
                          >
                            {loading ? 'Processing...' : 'Save'}
                          </CButton>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SchoolDetail
