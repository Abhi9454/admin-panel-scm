import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import apiService from '../../api/receiptManagementApi'
import schoolManagementApi from '../../api/schoolManagementApi'

const FeeLastDate = () => {
  const [receiptBooks, setReceiptBooks] = useState([])
  const [terms, setTerms] = useState([])
  const [classes, setClasses] = useState([])
  const [groups, setGroups] = useState([])
  const [feeLastDates, setFeeLastDates] = useState([])
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    receiptBookId: '',
    termId: '',
    classId: '',
    groupId: '',
    lastDate: '',
  })

  useEffect(() => {
    apiService.getAll('receipt-book/all').then((res) => setReceiptBooks(res))
    schoolManagementApi.getAll('term/all').then((res) => setTerms(res))
    schoolManagementApi.getAll('class/all').then((res) => setClasses(res))
    schoolManagementApi.getAll('group/all').then((res) => setGroups(res))
    fetchFeeLastDates()
  }, [])

  const fetchFeeLastDates = () => {
    apiService.getAll('fee-last-date/all').then((res) => setFeeLastDates(res))
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) {
      apiService.update(`fee-last-date/update/${editId}`, formData).then(() => {
        fetchFeeLastDates()
        resetForm()
      })
    } else {
      apiService.create('fee-last-date/add', formData).then(() => {
        fetchFeeLastDates()
        resetForm()
      })
    }
  }

  const handleEdit = (fee) => {
    setEditId(fee.id)
    setFormData({
      receiptBookId: fee.receiptBookId,
      termId: fee.termId,
      classId: fee.classId,
      groupId: fee.groupId,
      lastDate: fee.lastDate,
    })
  }

  const resetForm = () => {
    setEditId(null)
    setFormData({ receiptBookId: '', termId: '', classId: '', groupId: '', lastDate: '' })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>{editId ? 'Edit' : 'Add'} Fee Last Date</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Receipt Book</CFormLabel>
                  <CFormSelect
                    name="receiptBookId"
                    value={formData.receiptBookId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Receipt Book</option>
                    {receiptBooks.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.receiptName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Term</CFormLabel>
                  <CFormSelect
                    name="termId"
                    value={formData.termId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Term</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Class</CFormLabel>
                  <CFormSelect
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Group</CFormLabel>
                  <CFormSelect
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Group</option>
                    {groups.map((grp) => (
                      <option key={grp.id} value={grp.id}>
                        {grp.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={3}>
                  <CFormLabel>Last Date</CFormLabel>
                  <CFormInput
                    type="date"
                    name="lastDate"
                    value={formData.lastDate}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>

              <CButton type="submit" color="primary">
                {editId ? 'Update' : 'Submit'}
              </CButton>
              {editId && (
                <CButton color="secondary" onClick={resetForm} className="ms-2">
                  Cancel
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Fee Last Date Records</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>#</CTableHeaderCell>
                  <CTableHeaderCell>Receipt Book</CTableHeaderCell>
                  <CTableHeaderCell>Term</CTableHeaderCell>
                  <CTableHeaderCell>Class</CTableHeaderCell>
                  <CTableHeaderCell>Group</CTableHeaderCell>
                  <CTableHeaderCell>Last Date</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {feeLastDates.map((fee, index) => (
                  <CTableRow key={fee.id}>
                    <CTableDataCell>{index + 1}</CTableDataCell>
                    <CTableDataCell>{fee.receiptBookName}</CTableDataCell>
                    <CTableDataCell>{fee.termName}</CTableDataCell>
                    <CTableDataCell>{fee.className}</CTableDataCell>
                    <CTableDataCell>{fee.groupName}</CTableDataCell>
                    <CTableDataCell>{fee.lastDate}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" size="sm" onClick={() => handleEdit(fee)}>
                        Edit
                      </CButton>
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

export default FeeLastDate
