import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CCollapse,
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

  const studentRequests = []

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
    <CRow className="g-2">
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <CRow className="align-items-center">
              <CCol md={8}>
                <h6 className="mb-0 fw-bold text-primary">Transfer Certificate</h6>
                <small className="text-muted">
                  Create and manage student transfer certificates
                </small>
              </CCol>
              <CCol md={4} className="text-end">
                <CButton
                  color="outline-secondary"
                  size="sm"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="me-2"
                >
                  <CIcon icon={isFormOpen ? cilLevelUp : cilLevelDown} className="me-1" />
                  {isFormOpen ? 'Hide Form' : 'Show Form'}
                </CButton>
                <CBadge color="info">New Request</CBadge>
              </CCol>
            </CRow>
          </CCardHeader>

          <CCollapse visible={isFormOpen}>
            <CCardBody className="p-3">
              <CForm>
                <CRow className="g-2">
                  {/* Section 1: Basic Information */}
                  <CCol xs={12} className="mb-2">
                    <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                      📝 Basic Information
                    </h6>
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      type="text"
                      id="admissionnumber"
                      floatingClassName="mb-2"
                      floatingLabel="Admission Number"
                    />
                  </CCol>
                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      type="text"
                      id="booknumber"
                      floatingClassName="mb-2"
                      floatingLabel="Book Number"
                    />
                  </CCol>
                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      type="text"
                      id="srno"
                      floatingClassName="mb-2"
                      floatingLabel="Sr Number"
                    />
                  </CCol>
                  <CCol lg={3} md={6}>
                    <CFormInput
                      size="sm"
                      type="date"
                      id="admissionDate"
                      floatingClassName="mb-2"
                      floatingLabel="Admission Date"
                    />
                  </CCol>

                  {/* Section 2: Student Details */}
                  <CCol xs={12} className="mb-2 mt-3">
                    <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                      👤 Student Details
                    </h6>
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormInput
                      size="sm"
                      type="text"
                      id="name"
                      floatingClassName="mb-2"
                      floatingLabel="Student Name"
                    />
                  </CCol>
                  <CCol lg={4} md={6}>
                    <CFormInput
                      size="sm"
                      type="text"
                      id="fatherName"
                      floatingClassName="mb-2"
                      floatingLabel="Father Name"
                    />
                  </CCol>
                  <CCol lg={4} md={6}>
                    <CFormInput
                      size="sm"
                      type="date"
                      id="dob"
                      floatingClassName="mb-2"
                      floatingLabel="Date of Birth"
                    />
                  </CCol>

                  {/* Section 3: Academic & Personal Info */}
                  <CCol xs={12} className="mb-2 mt-3">
                    <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                      🎓 Academic & Personal Information
                    </h6>
                  </CCol>

                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      id="games"
                      floatingClassName="mb-2"
                      floatingLabel="Games"
                    >
                      <option>Choose...</option>
                      <option>Cricket</option>
                      <option>Football</option>
                      <option>Basketball</option>
                      <option>Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      id="concession"
                      floatingClassName="mb-2"
                      floatingLabel="Concession"
                    >
                      <option>Choose...</option>
                      <option>Yes</option>
                      <option>No</option>
                    </CFormSelect>
                  </CCol>
                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      id="nationality"
                      floatingClassName="mb-2"
                      floatingLabel="Nationality"
                    >
                      <option>Indian</option>
                      <option>Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol lg={3} md={6}>
                    <CFormSelect
                      size="sm"
                      id="caste"
                      floatingClassName="mb-2"
                      floatingLabel="SC/ST"
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </CFormSelect>
                  </CCol>

                  {/* Section 4: Promotion Details */}
                  <CCol xs={12} className="mb-2 mt-3">
                    <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                      📈 Promotion Details
                    </h6>
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormSelect
                      size="sm"
                      id="qualified"
                      floatingClassName="mb-2"
                      floatingLabel="Qualified for Promotion"
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </CFormSelect>
                  </CCol>
                  <CCol lg={4} md={6}>
                    <CFormSelect
                      size="sm"
                      id="classpromoted"
                      floatingClassName="mb-2"
                      floatingLabel="Class for Promotion"
                    >
                      <option>Choose...</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                      <option>7</option>
                      <option>8</option>
                      <option>9</option>
                      <option>10</option>
                      <option>11</option>
                      <option>12</option>
                      <option>None</option>
                    </CFormSelect>
                  </CCol>

                  {/* Section 5: Application Details */}
                  <CCol xs={12} className="mb-2 mt-3">
                    <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                      📅 Application Details
                    </h6>
                  </CCol>

                  <CCol lg={4} md={6}>
                    <CFormInput
                      size="sm"
                      type="date"
                      id="dateApplied"
                      floatingClassName="mb-2"
                      floatingLabel="Date Applied"
                    />
                  </CCol>
                  <CCol lg={4} md={6}>
                    <CFormInput
                      size="sm"
                      type="date"
                      id="issueDate"
                      floatingClassName="mb-2"
                      floatingLabel="Issue Date"
                    />
                  </CCol>

                  {/* Section 6: Additional Information */}
                  <CCol xs={12} className="mb-2 mt-3">
                    <h6 className="text-muted fw-semibold mb-2 border-bottom pb-1">
                      📄 Additional Information
                    </h6>
                  </CCol>

                  <CCol lg={6} md={12}>
                    <CFormInput
                      size="sm"
                      type="text"
                      id="reasonLeaving"
                      floatingClassName="mb-2"
                      floatingLabel="Reason for Leaving"
                      placeholder="Enter reason for leaving school"
                    />
                  </CCol>
                  <CCol lg={6} md={12}>
                    <CFormTextarea
                      size="sm"
                      id="remarks"
                      floatingClassName="mb-2"
                      floatingLabel="Remarks"
                      rows={2}
                      placeholder="Enter any additional remarks"
                    />
                  </CCol>

                  {/* Submit Button */}
                  <CCol xs={12} className="pt-3 border-top mt-3">
                    <div className="d-flex gap-2 align-items-center">
                      <CButton color="primary" type="submit" className="px-4">
                        Add Request
                      </CButton>
                      <CButton color="outline-secondary" type="button">
                        Clear Form
                      </CButton>
                      <div className="ms-auto">
                        <small className="text-muted">
                          Fill all required fields to create transfer certificate request
                        </small>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCollapse>
        </CCard>
      </CCol>

      {/* Previously Submitted Requests Section - Currently Commented Out */}
      {/*
      <CCol xs={12}>
        <CCard className="shadow-sm">
          <CCardHeader className="py-2 px-3">
            <h6 className="mb-0 fw-bold text-primary">Previously Submitted Requests</h6>
          </CCardHeader>
          <CCardBody className="p-3">
            <CForm>
              <CRow className="g-2 mb-3">
                <CCol lg={3} md={6}>
                  <CFormInput
                    size="sm"
                    type="text"
                    floatingClassName="mb-2"
                    floatingLabel="Search"
                    placeholder="Search by name, admission no, book no, sr no"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </CCol>
                <CCol lg={3} md={6}>
                  <CFormInput
                    size="sm"
                    type="date"
                    floatingClassName="mb-2"
                    floatingLabel="Admission Date"
                    value={admissionDateFilter}
                    onChange={(e) => setAdmissionDateFilter(e.target.value)}
                  />
                </CCol>
                <CCol lg={3} md={6}>
                  <CFormInput
                    size="sm"
                    type="date"
                    floatingClassName="mb-2"
                    floatingLabel="Left Date"
                    value={leftDateFilter}
                    onChange={(e) => setLeftDateFilter(e.target.value)}
                  />
                </CCol>
                <CCol lg={3} md={6}>
                  <CFormInput
                    size="sm"
                    type="date"
                    floatingClassName="mb-2"
                    floatingLabel="Issue Date"
                    value={issueDateFilter}
                    onChange={(e) => setIssueDateFilter(e.target.value)}
                  />
                </CCol>
              </CRow>
            </CForm>

            <div className="table-responsive">
              <CTable hover small>
                <CTableHead className="table-light">
                  <CTableRow>
                    <CTableHeaderCell className="py-2 fw-semibold">Student Name</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Father Name</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Admission No.</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Book No.</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Sr No.</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Admission Date</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Left Date</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Issue Date</CTableHeaderCell>
                    <CTableHeaderCell className="py-2 fw-semibold">Status</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredRequests.map((req) => (
                    <CTableRow key={req.id}>
                      <CTableDataCell className="py-2">{req.studentName}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.fatherName}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.admissionNumber}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.bookNumber}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.srNumber}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.admissionDate}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.leftDate}</CTableDataCell>
                      <CTableDataCell className="py-2">{req.issueDate || 'Not Issued'}</CTableDataCell>
                      <CTableDataCell className="py-2">
                        {req.issued ? (
                          <CBadge color="success">Issued</CBadge>
                        ) : (
                          <CButton size="sm" color="warning" onClick={() => handleIssue(req)}>
                            Issue
                          </CButton>
                        )}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      */}
    </CRow>
  )
}

export default StudentTransferCertificate
