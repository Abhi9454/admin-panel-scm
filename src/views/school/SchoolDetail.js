import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CBadge,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import schoolManagementApi from '../../api/schoolManagementApi'
import receiptManagementApi from '../../api/receiptManagementApi'

const SchoolDetail = () => {
  const [school, setSchool] = useState({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [receiptBooks, setReceiptBooks] = useState([])
  const [loadingReceipts, setLoadingReceipts] = useState(false)
  const [schoolId] = useState('1')

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
      setSubmitting(true)
      if (editing) {
        await schoolManagementApi.update('school-summary/update', school.id, school)
      } else {
        await schoolManagementApi.create('school-summary/add', school)
      }
      alert('Details updated successfully.')
      fetchSchoolDetails()
    } catch (error) {
      console.error('Error saving school details:', error)
      alert('Error saving school details. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !school?.id) {
    return (
      <CRow className="g-2">
        <CCol xs={12}>
          <CCard className="shadow-sm">
            <CCardBody className="text-center py-4">
              <CSpinner color="primary" size="sm" className="me-2" />
              <span className="text-muted">Loading school configuration...</span>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">School Configuration</h6>
                <small className="text-muted">
                  Configure school details, accounts, and policies
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                <CBadge color={editing ? 'warning' : 'success'} className="me-2">
                  {editing ? 'Edit Mode' : 'New Setup'}
                </CBadge>
                <CBadge color="info">System Config</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCardBody className="p-3">
            <CForm onSubmit={handleSubmit}>
              <CAccordion className="accordion-compact">
                {/* School Address Setup */}
                <CAccordionItem itemKey="address">
                  <CAccordionHeader className="py-2">
                    🏫 School Address & Basic Information
                  </CAccordionHeader>
                  <CAccordionBody className="py-2">
                    <CRow className="g-2">
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="School Address"
                          type="text"
                          name="address"
                          value={school?.schoolAddress || ''}
                          onChange={handleChange}
                          placeholder="Enter complete school address"
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Email Address"
                          type="email"
                          name="emailId"
                          value={school?.emailId || ''}
                          onChange={handleChange}
                          placeholder="school@domain.com"
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Bank Account Number"
                          type="text"
                          name="bankAccountNo"
                          value={school?.bankAccountNo || ''}
                          onChange={handleChange}
                          placeholder="Enter bank account number"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="PAN Number"
                          type="text"
                          name="panNo"
                          value={school?.panNo || ''}
                          onChange={handleChange}
                          placeholder="ABCDE1234F"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="TAN Number"
                          type="text"
                          name="tanNo"
                          value={school?.tanNo || ''}
                          onChange={handleChange}
                          placeholder="ABCD12345E"
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Provident Fund Number"
                          type="text"
                          name="pfNo"
                          value={school?.pfNo || ''}
                          onChange={handleChange}
                          placeholder="Enter PF registration number"
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="ESI Number"
                          type="text"
                          name="esiNo"
                          value={school?.esiNo || ''}
                          onChange={handleChange}
                          placeholder="Enter ESI registration number"
                        />
                      </CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* Accounts Setup */}
                <CAccordionItem itemKey="accounts">
                  <CAccordionHeader className="py-2">
                    💰 Financial Accounts Configuration
                  </CAccordionHeader>
                  <CAccordionBody className="py-2">
                    <CRow className="g-2">
                      <CCol lg={8} md={12}>
                        {loadingReceipts ? (
                          <div className="text-center py-2">
                            <CSpinner size="sm" className="me-2" />
                            <small className="text-muted">Loading receipt books...</small>
                          </div>
                        ) : (
                          <CFormSelect
                            size="sm"
                            floatingClassName="mb-2"
                            floatingLabel="Cash in Hand Account"
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
                      <CCol lg={4} md={12}>
                        <CButton color="info" size="sm" className="w-100">
                          Bank Accounts
                        </CButton>
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Refundable Fees Account"
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
                      <CCol lg={6} md={12}>
                        <CFormSelect
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Fine Fees Head"
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
                      </CCol>

                      {/* Fine Configuration */}
                      <CCol xs={12} className="mt-3 mb-2">
                        <h6 className="text-muted fw-semibold border-bottom pb-1">
                          📋 Fine Configuration
                        </h6>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Fine Exemption After Due Date (Days)"
                          type="number"
                          name="fineExemptionDays"
                          value={school?.fineExemptionDays || ''}
                          onChange={handleChange}
                          placeholder="e.g., 7"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Default Days"
                          type="number"
                          name="defaultDays"
                          value={school?.defaultDays || ''}
                          onChange={handleChange}
                          placeholder="e.g., 30"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Fine Amount (₹)"
                          type="number"
                          name="fineAmount"
                          value={school?.fineAmount || ''}
                          onChange={handleChange}
                          placeholder="e.g., 50"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Fine Exempt if Fees Less Than (₹)"
                          type="number"
                          name="fineExemptFees"
                          value={school?.fineExemptFees || ''}
                          onChange={handleChange}
                          placeholder="e.g., 100"
                        />
                      </CCol>
                      <CCol lg={6} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Maximum Fine Amount (₹)"
                          type="number"
                          name="maxFine"
                          value={school?.maxFine || ''}
                          onChange={handleChange}
                          placeholder="e.g., 500"
                        />
                      </CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>

                {/* Employee Setup */}
                <CAccordionItem itemKey="employee">
                  <CAccordionHeader className="py-2">
                    👥 Employee Configuration & Benefits
                  </CAccordionHeader>
                  <CAccordionBody className="py-2">
                    <CRow className="g-2">
                      {/* Allowances */}
                      <CCol xs={12} className="mb-2">
                        <h6 className="text-muted fw-semibold border-bottom pb-1">
                          💵 Allowances Configuration
                        </h6>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="D.A. Percentage (%)"
                          type="number"
                          name="daPercentage"
                          value={school?.daPercentage || ''}
                          onChange={handleChange}
                          placeholder="e.g., 12"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="H.R.A. Percentage (%)"
                          type="number"
                          name="hraPercentage"
                          value={school?.hraPercentage || ''}
                          onChange={handleChange}
                          placeholder="e.g., 10"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Max PF (8.33%) Per Employee (₹)"
                          type="number"
                          name="maxPfPerEmp"
                          value={school?.maxPfPerEmp || ''}
                          onChange={handleChange}
                          placeholder="e.g., 1800"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Full Time Total Periods"
                          type="number"
                          name="fullTimePeriods"
                          value={school?.fullTimePeriods || ''}
                          onChange={handleChange}
                          placeholder="e.g., 40"
                        />
                      </CCol>

                      {/* Annual Leaves */}
                      <CCol xs={12} className="mt-3 mb-2">
                        <h6 className="text-muted fw-semibold border-bottom pb-1">
                          📅 Annual Leave Configuration
                        </h6>
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Other Employee Payable Leaves"
                          type="number"
                          name="otherEmpPayable"
                          value={school?.otherEmpPayable || ''}
                          onChange={handleChange}
                          placeholder="e.g., 12"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Other Employee Non-Payable Leaves"
                          type="number"
                          name="otherEmpNonPayable"
                          value={school?.otherEmpNonPayable || ''}
                          onChange={handleChange}
                          placeholder="e.g., 15"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Class IV Employee Payable Leaves"
                          type="number"
                          name="ivClassEmpPayable"
                          value={school?.ivClassEmpPayable || ''}
                          onChange={handleChange}
                          placeholder="e.g., 10"
                        />
                      </CCol>
                      <CCol lg={3} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="Class IV Employee Non-Payable Leaves"
                          type="number"
                          name="ivClassEmpNonPayable"
                          value={school?.ivClassEmpNonPayable || ''}
                          onChange={handleChange}
                          placeholder="e.g., 12"
                        />
                      </CCol>

                      {/* PF Deduction */}
                      <CCol xs={12} className="mt-3 mb-2">
                        <div className="p-3 bg-secondary rounded">
                          <h6 className="text-muted fw-semibold mb-3">
                            🏦 Provident Fund Deduction Settings
                          </h6>
                          <CRow className="g-2">
                            <CCol lg={3} md={6}>
                              <CFormInput
                                size="sm"
                                floatingClassName="mb-2"
                                floatingLabel="PF1 Percentage (%)"
                                type="number"
                                name="pf1Percentage"
                                value={school?.pf1Percentage || ''}
                                onChange={handleChange}
                                placeholder="e.g., 12"
                              />
                            </CCol>
                            <CCol lg={3} md={6}>
                              <CFormInput
                                size="sm"
                                floatingClassName="mb-2"
                                floatingLabel="PF2 Percentage (%)"
                                type="number"
                                name="pf2Percentage"
                                value={school?.pf2Percentage || ''}
                                onChange={handleChange}
                                placeholder="e.g., 8.33"
                              />
                            </CCol>
                            <CCol lg={3} md={6}>
                              <CFormInput
                                size="sm"
                                floatingClassName="mb-2"
                                floatingLabel="Total PF Percentage (%)"
                                type="number"
                                name="totalPercentage"
                                value={school?.totalPercentage || ''}
                                onChange={handleChange}
                                placeholder="e.g., 20.33"
                              />
                            </CCol>
                            <CCol lg={3} md={6}>
                              <CFormInput
                                size="sm"
                                floatingClassName="mb-2"
                                floatingLabel="PF Salary Limit (₹)"
                                type="number"
                                name="limited"
                                value={school?.limited || ''}
                                onChange={handleChange}
                                placeholder="e.g., 15000"
                              />
                            </CCol>
                          </CRow>
                        </div>
                      </CCol>

                      {/* ESI Configuration */}
                      <CCol xs={12} className="mt-3 mb-2">
                        <h6 className="text-muted fw-semibold border-bottom pb-1">
                          🏥 ESI Configuration
                        </h6>
                      </CCol>
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="ESI1 Percentage (%)"
                          type="number"
                          name="esi1Percentage"
                          value={school?.esi1Percentage || ''}
                          onChange={handleChange}
                          placeholder="e.g., 1.75"
                        />
                      </CCol>
                      <CCol lg={4} md={6}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="ESI2 Percentage (%)"
                          type="number"
                          name="esi2Percentage"
                          value={school?.esi2Percentage || ''}
                          onChange={handleChange}
                          placeholder="e.g., 4.75"
                        />
                      </CCol>
                      <CCol lg={4} md={12}>
                        <CFormInput
                          size="sm"
                          floatingClassName="mb-2"
                          floatingLabel="ESI Salary Limit (₹)"
                          type="number"
                          name="esiLimit"
                          value={school?.esiLimit || ''}
                          onChange={handleChange}
                          placeholder="e.g., 21000"
                        />
                      </CCol>
                    </CRow>
                  </CAccordionBody>
                </CAccordionItem>
              </CAccordion>

              {/* Submit Button */}
              <div className="border-top pt-3 mt-3">
                <CRow className="align-items-center">
                  <CCol md={6}>
                    <small className="text-muted">
                      Save configuration to apply changes across the system
                    </small>
                  </CCol>
                  <CCol md={6} className="text-end">
                    <CButton color="success" type="submit" disabled={submitting} className="px-4">
                      {submitting ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Saving Configuration...
                        </>
                      ) : (
                        'Save Configuration'
                      )}
                    </CButton>
                  </CCol>
                </CRow>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SchoolDetail
