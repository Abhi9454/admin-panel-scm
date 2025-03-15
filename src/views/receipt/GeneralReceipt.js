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
  CFormSelect,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const GeneralReceipt = () => {
  const [receiptTitle, setReceiptTitle] = useState('')
  const [date, setDate] = useState('')
  const [payMode, setPayMode] = useState('')
  const [admNo, setAdmNo] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [name, setName] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [motherName, setMotherName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [gameOpted, setGameOpted] = useState('')
  const [debitAccount, setDebitAccount] = useState('')
  const [narration, setNarration] = useState('')
  const [fees, setFees] = useState('')
  const [fine, setFine] = useState('')
  const [posChg, setPosChg] = useState('')
  const [concession, setConcession] = useState('')
  const [received, setReceived] = useState('')
  const [dated, setDated] = useState('')
  const [refNo, setRefNo] = useState('')
  const [drawnOn, setDrawnOn] = useState('')
  const [remarks, setRemarks] = useState('')

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>General Receipt</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Receipt Title</CFormLabel>
                  <CFormInput
                    value={receiptTitle}
                    onChange={(e) => setReceiptTitle(e.target.value)}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Pay Mode</CFormLabel>
                  <CFormSelect value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                    <option>Select</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>Online</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Adm No.</CFormLabel>
                  <CFormInput value={admNo} onChange={(e) => setAdmNo(e.target.value)} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Receipt No.</CFormLabel>
                  <CFormInput value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Name</CFormLabel>
                  <CFormInput value={name} onChange={(e) => setName(e.target.value)} />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Father Name</CFormLabel>
                  <CFormInput value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Mother Name</CFormLabel>
                  <CFormInput value={motherName} onChange={(e) => setMotherName(e.target.value)} />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Class</CFormLabel>
                  <CFormInput
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Game Opted</CFormLabel>
                  <CFormInput value={gameOpted} onChange={(e) => setGameOpted(e.target.value)} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Narration</CFormLabel>
                  <CFormInput value={narration} onChange={(e) => setNarration(e.target.value)} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={2}>
                  <CFormLabel>Fees</CFormLabel>
                  <CFormInput value={fees} onChange={(e) => setFees(e.target.value)} />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Fine</CFormLabel>
                  <CFormInput value={fine} onChange={(e) => setFine(e.target.value)} />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Pos Chg.</CFormLabel>
                  <CFormInput value={posChg} onChange={(e) => setPosChg(e.target.value)} />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Concession</CFormLabel>
                  <CFormInput value={concession} onChange={(e) => setConcession(e.target.value)} />
                </CCol>
                <CCol md={2}>
                  <CFormLabel>Received</CFormLabel>
                  <CFormInput value={received} onChange={(e) => setReceived(e.target.value)} />
                </CCol>
              </CRow>
              <CButton color="success" className="mt-3">
                Add
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GeneralReceipt
