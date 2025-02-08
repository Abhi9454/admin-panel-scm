import React, {useState} from 'react'
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
  CFormSelect, CFormText,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

const StudentTransferCertificate = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Transfer Certificate</strong>
          </CCardHeader>
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
              <CCard className="mb-4 mt-4">
                <p className="text-body-secondary medium m-2">Last Year Details</p>
                <CCardBody>
                  <CForm className="row g-3">
                    <CCol md={6}>
                      <CFormLabel htmlFor="class">Class Studied</CFormLabel>
                      <CFormSelect id="class">
                        <option>Choose...</option>
                        <option>...</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="iffail">If Fail</CFormLabel>
                      <CFormSelect id="iffail">
                        <option>Once</option>
                        <option>Twice</option>
                        <option>None</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="board">School Board</CFormLabel>
                      <CFormSelect id="board">
                        <option>CBSE</option>
                        <option>ICSE</option>
                        <option>State Board</option>
                      </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                      <CFormLabel htmlFor="group">Subject Studied</CFormLabel>
                      <CFormSelect id="group">
                        <option>Maths</option>
                        <option>Commerce</option>
                        <option>Biology</option>
                        <option>General</option>
                      </CFormSelect>
                    </CCol>
                  </CForm>
                </CCardBody>
              </CCard>
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
              <CCol md={2}>
                <CFormLabel htmlFor="admissionDate">Total Working Days</CFormLabel>
                <CFormInput type="date" id="admissionDate" />
              </CCol>
              <CCol md={2}>
                <CFormLabel htmlFor="admissionDate">Total Days Present</CFormLabel>
                <CFormInput type="date" id="admissionDate" />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="classpromoted">Achievement</CFormLabel>
                <CFormSelect id="classpromoted">
                  <option>NCC Cadet</option>
                  <option>Boy Scout</option>
                  <option>Girl Guide</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="classpromoted">General Conduct</CFormLabel>
                <CFormSelect id="classpromoted">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Average</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
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
        </CCard>
      </CCol>
    </CRow>
  )
}

export default StudentTransferCertificate
