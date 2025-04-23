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
  CFormSelect,
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilLevelDown, cilLevelUp } from '@coreui/icons'

const StudentTransferCertificate = () => {
  const [isFormOpen, setIsFormOpen] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [admissionDateFilter, setAdmissionDateFilter] = useState('')
  const [leftDateFilter, setLeftDateFilter] = useState('')
  const [issueDateFilter, setIssueDateFilter] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const studentRequests = [
  ]

  const handleIssue = (student) => {
    setSelectedStudent(student)
    setModalVisible(true)
  }

  const confirmIssue = () => {
    alert(`Certificate issued for ${selectedStudent.studentName}`)
    setModalVisible(false)
  }

  const filteredRequests = studentRequests.filter((req) => {
    const matchesSearch =
      searchText === '' ||
      req.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      req.fatherName.toLowerCase().includes(searchText.toLowerCase()) ||
      req.admissionNumber.includes(searchText) ||
      req.bookNumber.includes(searchText) ||
      req.srNumber.includes(searchText)

    const matchesAdmissionDate =
      admissionDateFilter === '' || req.admissionDate === admissionDateFilter
    const matchesLeftDate = leftDateFilter === '' || req.leftDate === leftDateFilter
    const matchesIssueDate = issueDateFilter === '' || req.issueDate === issueDateFilter

    return matchesSearch && matchesAdmissionDate && matchesLeftDate && matchesIssueDate
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Transfer Certificate</strong>
            <CButton color="light" onClick={() => setIsFormOpen(!isFormOpen)}>
              <CIcon icon={isFormOpen ? cilLevelUp : cilLevelDown} />
            </CButton>
          </CCardHeader>

          {isFormOpen && (
            <CCardBody>
              <p className="text-body-secondary small">Add Student Details</p>
              <CForm className="row g-3">
                <CCol md={4}>
                  <CFormLabel htmlFor="admissionnumber">Admission Number</CFormLabel>
                  <CFormInput type="text" id="admissionnumber" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="booknumber">Book Number</CFormLabel>
                  <CFormInput type="text" id="booknumber" />
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="srno">Sr Number</CFormLabel>
                  <CFormInput type="text" id="srno" />
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
                  <CFormLabel htmlFor="admissionDate">Admission Date</CFormLabel>
                  <CFormInput type="date" id="admissionDate" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="dob">Date of Birth</CFormLabel>
                  <CFormInput type="date" id="dob" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="class">Games</CFormLabel>
                  <CFormSelect id="class">
                    <option>Choose...</option>
                    <option>...</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="class">Concession</CFormLabel>
                  <CFormSelect id="class">
                    <option>Choose...</option>
                    <option>...</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="section">Nationality</CFormLabel>
                  <CFormSelect id="section">
                    <option>Indian</option>
                    <option>Other</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="caste">SC/ST</CFormLabel>
                  <CFormSelect id="caste">
                    <option>Yes</option>
                    <option>No</option>
                  </CFormSelect>
                </CCol>

                <CCol md={6}>
                  <CFormLabel htmlFor="qualified">Qualified for Promotion</CFormLabel>
                  <CFormSelect id="qualified">
                    <option>Yes</option>
                    <option>No</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="classpromoted">Class for Promotion</CFormLabel>
                  <CFormSelect id="classpromoted">
                    <option>1</option>
                    <option>2</option>
                    <option>None</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="admissionDate">Date Applied</CFormLabel>
                  <CFormInput type="date" id="admissionDate" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel htmlFor="dob">Issue Date</CFormLabel>
                  <CFormInput type="date" id="dob" />
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="fatherContact">Reason for Leaving</CFormLabel>
                  <CFormInput type="text" id="remarks" placeholder="Enter Reason for Leaving" />
                </CCol>
                <CCol md={12}>
                  <CFormLabel htmlFor="fatherContact">Remarks</CFormLabel>
                  <CFormTextarea type="textArea" id="remarks" placeholder="Enter Remarks" />
                </CCol>
                <CCol xs={12}>
                  <CButton color="primary" type="submit">
                    Add Request
                  </CButton>
                </CCol>
              </CForm>
            </CCardBody>
          )}
        </CCard>
      </CCol>
      {/*<CCol xs={12}>*/}
      {/*  <CCard className="mb-4">*/}
      {/*    <CCardHeader>*/}
      {/*      <strong>Previously Submitted Requests</strong>*/}
      {/*    </CCardHeader>*/}
      {/*    <CCardBody>*/}
      {/*      <CForm className="row g-3">*/}
      {/*        <CCol md={4}>*/}
      {/*          <CFormLabel>Search</CFormLabel>*/}
      {/*          <CFormInput*/}
      {/*            type="text"*/}
      {/*            placeholder="Search by name, admission no, book no, sr no"*/}
      {/*            value={searchText}*/}
      {/*            onChange={(e) => setSearchText(e.target.value)}*/}
      {/*          />*/}
      {/*        </CCol>*/}
      {/*        <CCol md={4}>*/}
      {/*          <CFormLabel>Admission Date</CFormLabel>*/}
      {/*          <CFormInput*/}
      {/*            type="date"*/}
      {/*            value={admissionDateFilter}*/}
      {/*            onChange={(e) => setAdmissionDateFilter(e.target.value)}*/}
      {/*          />*/}
      {/*        </CCol>*/}
      {/*        <CCol md={4}>*/}
      {/*          <CFormLabel>Left Date</CFormLabel>*/}
      {/*          <CFormInput*/}
      {/*            type="date"*/}
      {/*            value={leftDateFilter}*/}
      {/*            onChange={(e) => setLeftDateFilter(e.target.value)}*/}
      {/*          />*/}
      {/*        </CCol>*/}
      {/*        <CCol md={4}>*/}
      {/*          <CFormLabel>Issue Date</CFormLabel>*/}
      {/*          <CFormInput*/}
      {/*            type="date"*/}
      {/*            value={issueDateFilter}*/}
      {/*            onChange={(e) => setIssueDateFilter(e.target.value)}*/}
      {/*          />*/}
      {/*        </CCol>*/}
      {/*      </CForm>*/}

      {/*      <CTable hover className="mt-3">*/}
      {/*        <CTableHead>*/}
      {/*          <CTableRow>*/}
      {/*            <CTableHeaderCell>Student Name</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Father Name</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Admission No.</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Book No.</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Sr No.</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Admission Date</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Left Date</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Issue Date</CTableHeaderCell>*/}
      {/*            <CTableHeaderCell>Issued</CTableHeaderCell>*/}
      {/*          </CTableRow>*/}
      {/*        </CTableHead>*/}
      {/*        <CTableBody>*/}
      {/*          {filteredRequests.map((req) => (*/}
      {/*            <CTableRow key={req.id}>*/}
      {/*              <CTableDataCell>{req.studentName}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.fatherName}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.admissionNumber}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.bookNumber}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.srNumber}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.admissionDate}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.leftDate}</CTableDataCell>*/}
      {/*              <CTableDataCell>{req.issueDate || 'Not Issued'}</CTableDataCell>*/}
      {/*              <CTableDataCell>*/}
      {/*                {req.issued ? (*/}
      {/*                  'Yes'*/}
      {/*                ) : (*/}
      {/*                  <CButton color="warning" onClick={() => handleIssue(req)}>*/}
      {/*                    Issue*/}
      {/*                  </CButton>*/}
      {/*                )}*/}
      {/*              </CTableDataCell>*/}
      {/*            </CTableRow>*/}
      {/*          ))}*/}
      {/*        </CTableBody>*/}
      {/*      </CTable>*/}
      {/*    </CCardBody>*/}
      {/*  </CCard>*/}
      {/*</CCol>*/}
    </CRow>
  )
}

export default StudentTransferCertificate
