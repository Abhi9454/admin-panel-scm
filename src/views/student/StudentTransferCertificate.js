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
    {
      id: 1,
      studentName: 'Aarav Sharma',
      fatherName: 'Vikram Sharma',
      admissionNumber: 'A1023',
      bookNumber: 'B120',
      srNumber: 'S321',
      admissionDate: '2024-03-10',
      leftDate: '2025-01-15',
      issueDate: '',
      issued: false,
    },
    {
      id: 2,
      studentName: 'Sneha Verma',
      fatherName: 'Sunil Verma',
      admissionNumber: 'A1045',
      bookNumber: 'B122',
      srNumber: 'S322',
      admissionDate: '2023-05-12',
      leftDate: '2024-12-20',
      issueDate: '2025-01-10',
      issued: true,
    },
    {
      id: 3,
      studentName: 'Rohan Gupta',
      fatherName: 'Manoj Gupta',
      admissionNumber: 'A1078',
      bookNumber: 'B125',
      srNumber: 'S323',
      admissionDate: '2022-07-15',
      leftDate: '2024-06-18',
      issueDate: '',
      issued: false,
    },
    {
      id: 4,
      studentName: 'Ishika Patel',
      fatherName: 'Amit Patel',
      admissionNumber: 'A1090',
      bookNumber: 'B130',
      srNumber: 'S324',
      admissionDate: '2021-04-20',
      leftDate: '2023-12-22',
      issueDate: '2024-01-05',
      issued: true,
    },
    {
      id: 5,
      studentName: 'Varun Mehta',
      fatherName: 'Rakesh Mehta',
      admissionNumber: 'A1102',
      bookNumber: 'B135',
      srNumber: 'S325',
      admissionDate: '2020-09-18',
      leftDate: '2024-01-30',
      issueDate: '',
      issued: false,
    },
    {
      id: 6,
      studentName: 'Priya Yadav',
      fatherName: 'Dinesh Yadav',
      admissionNumber: 'A1123',
      bookNumber: 'B140',
      srNumber: 'S326',
      admissionDate: '2019-06-10',
      leftDate: '2023-11-15',
      issueDate: '2023-12-01',
      issued: true,
    },
    {
      id: 7,
      studentName: 'Kabir Reddy',
      fatherName: 'Kiran Reddy',
      admissionNumber: 'A1150',
      bookNumber: 'B145',
      srNumber: 'S327',
      admissionDate: '2022-08-25',
      leftDate: '2024-07-05',
      issueDate: '',
      issued: false,
    },
    {
      id: 8,
      studentName: 'Ananya Das',
      fatherName: 'Rajesh Das',
      admissionNumber: 'A1180',
      bookNumber: 'B150',
      srNumber: 'S328',
      admissionDate: '2021-05-30',
      leftDate: '2024-02-20',
      issueDate: '2024-03-01',
      issued: true,
    },
    {
      id: 9,
      studentName: 'Vikrant Choudhary',
      fatherName: 'Deepak Choudhary',
      admissionNumber: 'A1205',
      bookNumber: 'B155',
      srNumber: 'S329',
      admissionDate: '2023-10-12',
      leftDate: '2025-01-10',
      issueDate: '',
      issued: false,
    },
    {
      id: 10,
      studentName: 'Meera Nair',
      fatherName: 'Suresh Nair',
      admissionNumber: 'A1250',
      bookNumber: 'B160',
      srNumber: 'S330',
      admissionDate: '2020-01-05',
      leftDate: '2023-09-30',
      issueDate: '2023-10-10',
      issued: true,
    },
    {
      id: 11,
      studentName: 'Aryan Saxena',
      fatherName: 'Pankaj Saxena',
      admissionNumber: 'A1300',
      bookNumber: 'B165',
      srNumber: 'S331',
      admissionDate: '2018-07-20',
      leftDate: '2022-05-10',
      issueDate: '2022-06-01',
      issued: true,
    },
    {
      id: 12,
      studentName: 'Tanya Kapoor',
      fatherName: 'Prakash Kapoor',
      admissionNumber: 'A1350',
      bookNumber: 'B170',
      srNumber: 'S332',
      admissionDate: '2017-12-10',
      leftDate: '2022-10-15',
      issueDate: '',
      issued: false,
    },
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
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Previously Submitted Requests</strong>
          </CCardHeader>
          <CCardBody>
            <CForm className="row g-3">
              <CCol md={4}>
                <CFormLabel>Search</CFormLabel>
                <CFormInput
                  type="text"
                  placeholder="Search by name, admission no, book no, sr no"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Admission Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={admissionDateFilter}
                  onChange={(e) => setAdmissionDateFilter(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Left Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={leftDateFilter}
                  onChange={(e) => setLeftDateFilter(e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Issue Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={issueDateFilter}
                  onChange={(e) => setIssueDateFilter(e.target.value)}
                />
              </CCol>
            </CForm>

            <CTable hover className="mt-3">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Student Name</CTableHeaderCell>
                  <CTableHeaderCell>Father Name</CTableHeaderCell>
                  <CTableHeaderCell>Admission No.</CTableHeaderCell>
                  <CTableHeaderCell>Book No.</CTableHeaderCell>
                  <CTableHeaderCell>Sr No.</CTableHeaderCell>
                  <CTableHeaderCell>Admission Date</CTableHeaderCell>
                  <CTableHeaderCell>Left Date</CTableHeaderCell>
                  <CTableHeaderCell>Issue Date</CTableHeaderCell>
                  <CTableHeaderCell>Issued</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredRequests.map((req) => (
                  <CTableRow key={req.id}>
                    <CTableDataCell>{req.studentName}</CTableDataCell>
                    <CTableDataCell>{req.fatherName}</CTableDataCell>
                    <CTableDataCell>{req.admissionNumber}</CTableDataCell>
                    <CTableDataCell>{req.bookNumber}</CTableDataCell>
                    <CTableDataCell>{req.srNumber}</CTableDataCell>
                    <CTableDataCell>{req.admissionDate}</CTableDataCell>
                    <CTableDataCell>{req.leftDate}</CTableDataCell>
                    <CTableDataCell>{req.issueDate || 'Not Issued'}</CTableDataCell>
                    <CTableDataCell>
                      {req.issued ? (
                        'Yes'
                      ) : (
                        <CButton color="warning" onClick={() => handleIssue(req)}>
                          Issue
                        </CButton>
                      )}
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

export default StudentTransferCertificate
