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
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTabPane,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'


const refundableFeesData = [
  {
    id: 1,
    studentName: 'Ranjeeta Singh',
    fatherName: 'Rajesh Singh',
    admissionNumber: 'A1023',
    class: '3',
    amount: '5000',
    payMode: 'Cash',
    referenceNumber: 'REF12345',
    receivedDate: '2025-02-08',
    refundDate: '2025-02-10',
    accountHolderName: 'Rajesh Singh',
  },
  {
    id: 2,
    studentName: 'Aarav Sharma',
    fatherName: 'Vikram Sharma',
    admissionNumber: 'A1024',
    class: '5',
    amount: '7000',
    payMode: 'Online',
    referenceNumber: 'REF12346',
    receivedDate: '2025-02-07',
    refundDate: '2025-02-11',
    accountHolderName: 'Vikram Sharma',
  },
  {
    id: 3,
    studentName: 'Sneha Verma',
    fatherName: 'Sunil Verma',
    admissionNumber: 'A1025',
    class: '4',
    amount: '6000',
    payMode: 'Cash',
    referenceNumber: 'REF12347',
    receivedDate: '2025-02-06',
    refundDate: '2025-02-12',
    accountHolderName: 'Sunil Verma',
  },
]

const RefundableFees = () => {
  const [searchText, setSearchText] = useState('')
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedPayMode, setSelectedPayMode] = useState('All')
  const [receivedDate, setReceivedDate] = useState('')
  const [refundDate, setRefundDate] = useState('')

  const filteredFees = refundableFeesData.filter((fee) => {
    const matchesSearch =
      searchText === '' ||
      fee.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      fee.fatherName.toLowerCase().includes(searchText.toLowerCase()) ||
      fee.admissionNumber.includes(searchText) ||
      fee.referenceNumber.includes(searchText) ||
      fee.accountHolderName.toLowerCase().includes(searchText.toLowerCase()) ||
      fee.amount.includes(searchText)

    const matchesClass = selectedClass === 'All' || fee.class === selectedClass
    const matchesPayMode = selectedPayMode === 'All' || fee.payMode === selectedPayMode
    const matchesReceivedDate = receivedDate === '' || fee.receivedDate === receivedDate
    const matchesRefundDate = refundDate === '' || fee.refundDate === refundDate

    return (
      matchesSearch && matchesClass && matchesPayMode && matchesReceivedDate && matchesRefundDate)
  })
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Refundable Fees</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Refundable Fees</p>
            <CForm className="row g-3">
              <CCol md={4}>
                <CFormLabel htmlFor="receivedDate">Received Date</CFormLabel>
                <CFormInput type="date" id="receivedDate" />
              </CCol>
              <CCol md={2}>
                <CFormLabel htmlFor="referenceNumber">Reference Number</CFormLabel>
                <CFormInput type="text" id="referenceNumber" />
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="admissionNumber">Admission Number</CFormLabel>
                <CFormInput type="text" id="admissionNumber" />
              </CCol>
              <CCol md={3}>
                <CFormLabel htmlFor="class">Class</CFormLabel>
                <CFormSelect id="class">
                  <option>Choose...</option>
                  <option>...</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="name">Student Name</CFormLabel>
                <CFormInput type="text" id="name" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="fatherName">Father Name</CFormLabel>
                <CFormInput type="text" id="fatherName" />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="motherName">Mother Name</CFormLabel>
                <CFormInput type="text" id="motherName" />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="amount">Amount</CFormLabel>
                <CFormInput type="text" id="amount" />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="payMode">Pay Mode</CFormLabel>
                <CFormSelect id="payMode">
                  <option>Cash</option>
                  <option>Online</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="remarks">Remarks</CFormLabel>
                <CFormTextarea type="textArea" id="remarks" placeholder="Enter Remarks" />
              </CCol>
              <CCard className="mb-4 mt-4">
                <p className="text-body-secondary medium m-2">Refund Details</p>
                <CCardBody>
                  <CForm className="row g-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="refundDate">Refund Date</CFormLabel>
                      <CFormInput type="date" id="refundDate" />
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="accountHolderName">Account Holder Name</CFormLabel>
                      <CFormInput
                        type="text"
                        id="accountHolderName"
                        placeholder="Enter Account Holder Name"
                      />
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel htmlFor="refundRemarks">Remarks</CFormLabel>
                      <CFormTextarea
                        type="textArea"
                        id="refundRemarks"
                        placeholder="Enter Remarks"
                      />
                    </CCol>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Add Request
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Refundable Fees</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Filter Refundable Fees</p>
            <CForm className="row g-3">
              <CCol md={3}>
                <CFormLabel>Search</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Search by name, amount, etc."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Class</CFormLabel>
                <CFormSelect value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  <option value="All">All Classes</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Pay Mode</CFormLabel>
                <CFormSelect value={selectedPayMode} onChange={(e) => setSelectedPayMode(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Received Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Refund Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={refundDate}
                  onChange={(e) => setRefundDate(e.target.value)}
                />
              </CCol>
            </CForm>

            <CCard className="mb-4 mt-4">
              <p className="text-body-secondary medium m-2">Refund Details</p>
              <CCardBody>
                <CTable hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Student Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Father Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Admission No.</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Class</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Pay Mode</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Reference No.</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Received Date</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Refund Date</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Account Holder</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredFees.length > 0 ? (
                      filteredFees.map((fee) => (
                        <CTableRow key={fee.id}>
                          <CTableDataCell>{fee.studentName}</CTableDataCell>
                          <CTableDataCell>{fee.fatherName}</CTableDataCell>
                          <CTableDataCell>{fee.admissionNumber}</CTableDataCell>
                          <CTableDataCell>{fee.class}</CTableDataCell>
                          <CTableDataCell>{fee.amount}</CTableDataCell>
                          <CTableDataCell>{fee.payMode}</CTableDataCell>
                          <CTableDataCell>{fee.referenceNumber}</CTableDataCell>
                          <CTableDataCell>{fee.receivedDate}</CTableDataCell>
                          <CTableDataCell>{fee.refundDate}</CTableDataCell>
                          <CTableDataCell>{fee.accountHolderName}</CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="10" className="text-center">
                          No records found.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default RefundableFees
