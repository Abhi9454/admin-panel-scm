import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CContainer,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CBadge,
  CProgress,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
} from '@coreui/react'
import importManagementApi from '../../api/importManagementApi'

const StudentImportExcel = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importHistory, setImportHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [importStats, setImportStats] = useState(null)

  // Updated sample data
  const sampleData = [
    {
      Name: 'Akash Singh',
      Class: 'NUR',
      Section: 'A',
      Group: 'GEN',
      DOB: '15/08/2023',
      Gender: 'Male',
      Type: 'new',
      'Admission Number': '4001',
      State: 'Punjab',
      City: 'Amritsar',
    },
    {
      Name: 'Priya Sharma',
      Class: 'LKG',
      Section: 'B',
      Group: 'GEN',
      DOB: '22/03/2022',
      Gender: 'Female',
      Type: 'old',
      'Admission Number': '3458',
      State: 'Haryana',
      City: 'Gurugram',
    },
  ]

  const requiredColumns = [
    { key: 'Name', description: 'Full name of the student' },
    {
      key: 'Class',
      description: 'Use exact class name as stored in portal (e.g., NUR, LKG, UKG, I, II)',
    },
    { key: 'Section', description: 'Use exact section name as stored in portal (e.g., A, B, C)' },
    {
      key: 'Group',
      description: 'Use exact group name as stored in portal (e.g., GEN, SC, ST, OBC)',
    },
    { key: 'DOB', description: 'Date of Birth in DD/MM/YYYY format' },
    { key: 'Gender', description: 'Use exactly: Male or Female' },
    { key: 'Type', description: 'Use exactly: old or new' },
    { key: 'Admission Number', description: 'Unique admission number for the student' },
    { key: 'State', description: 'Use exact state name as stored in portal' },
    { key: 'City', description: 'Use exact city name as stored in portal' },
  ]

  useEffect(() => {
    loadImportStats()
  }, [])

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (
        file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file.type !== 'application/vnd.ms-excel'
      ) {
        setError('Please select a valid Excel file (.xlsx or .xls)')
        setSelectedFile(null)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size should not exceed 10MB')
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setError(null)
      setSuccess(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', selectedFile)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await importManagementApi.create('student/upload', formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response && response.success) {
        setSuccess(
          `File uploaded successfully! Batch ID: ${response.importBatchId}.
           Total Records: ${response.totalRecords}.
           ${response.processingNote || 'File will be processed at 11:00 PM.'}`,
        )

        setTimeout(() => {
          setSelectedFile(null)
          setUploadProgress(0)
          document.getElementById('fileInput').value = ''
          loadImportStats()
        }, 2000)
      } else {
        setError(response?.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload failed:', error)

      // Better error handling for different error types
      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`
        setError(errorMessage)
      } else if (error.request) {
        // Network error
        setError('Network error. Please check your connection and try again.')
      } else {
        // Other error
        setError(error.message || 'Failed to upload file. Check the format of excel is as expected.')
      }
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const loadImportHistory = async () => {
    try {
      setLoadingHistory(true)
      const response = await importManagementApi.getAll('student/history')

      if (response.success) {
        setImportHistory(response.imports || [])
      } else {
        setError('Failed to load import history')
      }
    } catch (error) {
      console.error('Failed to load import history:', error)
      setError('Failed to load import history')
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadImportStats = async () => {
    try {
      const response = await importManagementApi.getAll('student/stats')
      if (response.success) {
        setImportStats(response.statistics)
      }
    } catch (error) {
      console.error('Failed to load import stats:', error)
    }
  }

  const handleShowHistory = () => {
    setShowHistory(!showHistory)
    if (!showHistory && importHistory.length === 0) {
      loadImportHistory()
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)
    document.getElementById('fileInput').value = ''
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success'
      case 'FAILED':
        return 'danger'
      case 'IN_PROGRESS':
        return 'warning'
      case 'PARTIAL_SUCCESS':
        return 'info'
      case 'UPLOADED':
        return 'secondary'
      default:
        return 'light'
    }
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const downloadSampleExcel = () => {
    const headers = requiredColumns.map((col) => col.key).join(',')
    const sampleRow1 = sampleData[0] ? Object.values(sampleData[0]).join(',') : ''
    const sampleRow2 = sampleData[1] ? Object.values(sampleData[1]).join(',') : ''

    const csvContent = [headers, sampleRow1, sampleRow2].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'student_import_sample.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <CContainer fluid className="px-2">
      {/* Alerts */}
      {error && (
        <CAlert color="danger" dismissible onClose={() => setError(null)} className="mb-2">
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" dismissible onClose={() => setSuccess(null)} className="mb-2">
          {success}
        </CAlert>
      )}

      {/* Import Stats Summary */}
      {importStats && (
        <CCard className="mb-2 shadow-sm">
          <CCardHeader className="py-1">
            <h6 className="mb-0 fw-bold text-primary">Import Statistics</h6>
          </CCardHeader>
          <CCardBody className="py-2">
            <CRow className="text-center">
              <CCol sm={2}>
                <CBadge color="primary" className="p-2">
                  <div>Total: {importStats.totalImports}</div>
                </CBadge>
              </CCol>
              <CCol sm={2}>
                <CBadge color="success" className="p-2">
                  <div>Completed: {importStats.completedImports}</div>
                </CBadge>
              </CCol>
              <CCol sm={2}>
                <CBadge color="danger" className="p-2">
                  <div>Failed: {importStats.failedImports}</div>
                </CBadge>
              </CCol>
              <CCol sm={2}>
                <CBadge color="warning" className="p-2">
                  <div>In Progress: {importStats.inProgressImports}</div>
                </CBadge>
              </CCol>
              <CCol sm={2}>
                <CBadge color="info" className="p-2">
                  <div>Partial: {importStats.partialImports}</div>
                </CBadge>
              </CCol>
              <CCol sm={2}>
                <CBadge color="secondary" className="p-2">
                  <div>Pending: {importStats.pendingImports}</div>
                </CBadge>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* Main Upload Card */}
      <CCard className="mb-3 shadow-sm">
        <CCardHeader className="py-2">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-primary">Student Data Import via Excel</h5>
            <CBadge color="info">Bulk Import</CBadge>
          </div>
        </CCardHeader>
        <CCardBody className="py-3">
          <CRow className="g-3 align-items-end">
            <CCol md={4}>
              <CFormInput
                id="fileInput"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label className="small text-muted mt-1">
                Select Excel file (.xlsx or .xls) - Max size: 10MB
              </label>
            </CCol>
            <CCol md={2}>
              <CButton
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-100"
              >
                {uploading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </CButton>
            </CCol>
            <CCol md={2}>
              <CButton
                color="outline-secondary"
                onClick={handleReset}
                disabled={uploading}
                className="w-100"
              >
                Reset
              </CButton>
            </CCol>
            <CCol md={2}>
              <CButton
                color="outline-info"
                onClick={handleShowHistory}
                disabled={uploading}
                className="w-100"
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </CButton>
            </CCol>
            <CCol md={2}>
              <CButton color="outline-primary" onClick={downloadSampleExcel} className="w-100">
                Download Sample
              </CButton>
            </CCol>
          </CRow>

          {/* Upload Progress */}
          {uploading && (
            <CRow className="mt-3">
              <CCol>
                <CProgress className="mb-2">
                  <CProgress value={uploadProgress} color="success">
                    {uploadProgress}%
                  </CProgress>
                </CProgress>
                <small className="text-muted">Uploading file...</small>
              </CCol>
            </CRow>
          )}

          {/* File Selected Info */}
          {selectedFile && (
            <CRow className="mt-3 p-2 bg-dark rounded">
              <CCol sm={6}>
                <small className="text-success">
                  <strong>Selected File:</strong> {selectedFile.name}
                </small>
              </CCol>
              <CCol sm={3}>
                <small className="text-muted">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </small>
              </CCol>
              <CCol sm={3}>
                <small className="text-muted">Type: {selectedFile.type || 'Excel'}</small>
              </CCol>
            </CRow>
          )}

          {/* Important Notice */}
          <CAlert color="warning" className="mt-3 mb-0">
            <strong>Processing Schedule:</strong>
            <br />
            • Files are processed automatically every night at 11:00 PM
            <br />
            • Updated student details will be available after 12:00 midnight
            <br />• Make sure to upload your file before 11:00 PM for same-day processing
          </CAlert>
        </CCardBody>
      </CCard>

      {/* Import History */}
      {showHistory && (
        <CCard className="mb-3 shadow-sm">
          <CCardHeader className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold text-primary">Import History</h6>
              {loadingHistory && <CSpinner size="sm" />}
            </div>
          </CCardHeader>
          <CCardBody className="py-2">
            {importHistory.length === 0 ? (
              <div className="text-center py-3 text-muted">No import history found</div>
            ) : (
              <CTable bordered hover responsive size="sm">
                <CTableHead className="table-dark">
                  <CTableRow>
                    <CTableHeaderCell>Batch ID</CTableHeaderCell>
                    <CTableHeaderCell>Filename</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Total Records</CTableHeaderCell>
                    <CTableHeaderCell>Success</CTableHeaderCell>
                    <CTableHeaderCell>Failed</CTableHeaderCell>
                    <CTableHeaderCell>Uploaded At</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {importHistory.map((importRecord, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="small font-monospace">
                        {importRecord.importBatchId}
                      </CTableDataCell>
                      <CTableDataCell className="small">
                        {importRecord.originalFilename}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusColor(importRecord.importStatus)}>
                          {importRecord.importStatus}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        {importRecord.totalRecords || 0}
                      </CTableDataCell>
                      <CTableDataCell className="text-center text-success">
                        {importRecord.successRecords || 0}
                      </CTableDataCell>
                      <CTableDataCell className="text-center text-danger">
                        {importRecord.failureRecords || 0}
                      </CTableDataCell>
                      <CTableDataCell className="small">
                        {formatDateTime(importRecord.created)}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* Download Sample Button - Separate from Accordion */}
      <CRow className="mb-2">
        <CCol>
          <CButton color="outline-success" onClick={downloadSampleExcel} className="w-100">
            Download Sample CSV Template
          </CButton>
        </CCol>
      </CRow>

      {/* Instructions and Sample Data */}
      <CCard className="shadow-sm">
        <CCardHeader className="py-2">
          <h6 className="mb-0 fw-bold text-primary">Excel Format Instructions</h6>
        </CCardHeader>
        <CCardBody className="py-2">
          <CAccordion>
            <CAccordionItem itemKey="columns">
              <CAccordionHeader>
                <strong>Required Columns & Format</strong>
              </CAccordionHeader>
              <CAccordionBody>
                <CTable bordered hover responsive size="sm">
                  <CTableHead className="table-dark">
                    <CTableRow>
                      <CTableHeaderCell>Column Name</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell>Example</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {requiredColumns.map((col, index) => (
                      <CTableRow key={index}>
                        <CTableDataCell className="fw-bold">{col.key}</CTableDataCell>
                        <CTableDataCell className="small">{col.description}</CTableDataCell>
                        <CTableDataCell className="small text-muted">
                          {sampleData[0] && sampleData[0][col.key]}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CAccordionBody>
            </CAccordionItem>

            <CAccordionItem itemKey="sample">
              <CAccordionHeader>
                <strong>Sample Data Format</strong>
              </CAccordionHeader>
              <CAccordionBody>
                <CTable bordered hover responsive size="sm">
                  <CTableHead className="table-success">
                    <CTableRow>
                      {requiredColumns.map((col) => (
                        <CTableHeaderCell key={col.key} className="small">
                          {col.key}
                        </CTableHeaderCell>
                      ))}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {sampleData.map((row, index) => (
                      <CTableRow key={index}>
                        {requiredColumns.map((col) => (
                          <CTableDataCell key={col.key} className="small">
                            {row[col.key]}
                          </CTableDataCell>
                        ))}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CAccordionBody>
            </CAccordionItem>

            <CAccordionItem itemKey="notes">
              <CAccordionHeader>
                <strong>Important Notes</strong>
              </CAccordionHeader>
              <CAccordionBody>
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-danger">Critical Requirements:</h6>
                    <ul className="small">
                      <li>
                        Use exact names as stored in the portal for Class, Section, Group, City, and
                        State
                      </li>
                      <li>Gender must be exactly "Male" or "Female"</li>
                      <li>Type must be exactly "old" or "new"</li>
                      <li>Date format must be DD/MM/YYYY</li>
                      <li>All columns are mandatory</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-info">Tips:</h6>
                    <ul className="small">
                      <li>Keep the first row as column headers</li>
                      <li>Remove any empty rows</li>
                      <li>Check for spelling mistakes</li>
                      <li>Ensure admission numbers are unique</li>
                      <li>File size should not exceed 10MB</li>
                    </ul>
                  </div>
                </div>
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default StudentImportExcel
