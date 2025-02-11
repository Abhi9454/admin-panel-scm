import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'

// Sample notifications data
const initialNotifications = [
  {
    id: 1,
    date: '2024-02-10',
    heading: 'Exam Schedule Released',
    content: 'The final exam schedule has been published. Check the website for details.',
    status: 'Active',
    validUpto: '2024-03-15',
  },
  {
    id: 2,
    date: '2024-02-08',
    heading: 'Holiday Announcement',
    content: 'School will remain closed on 15th Feb due to a public holiday.',
    status: 'Inactive',
    validUpto: '2024-02-15',
  },
  {
    id: 3,
    date: '2024-02-05',
    heading: 'New Admission Open',
    content: 'Admissions for the academic year 2024-25 are now open. Apply soon!',
    status: 'Active',
    validUpto: '2024-04-30',
  },
  {
    id: 4,
    date: '2024-02-02',
    heading: 'Fee Payment Reminder',
    content: 'Students are requested to pay the pending fees by 28th Feb.',
    status: 'Active',
    validUpto: '2024-02-28',
  },
]

const AllNotification = () => {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedValidUpto, setSelectedValidUpto] = useState('')
  const navigate = useNavigate()

  // Function to handle edit
  const handleEdit = (id) => {
    alert(`Edit notification with ID: ${id}`)
    navigate('/notifications/edit', { state: { notificationId: id } })
  }

  // Function to update status (toggle between Active and Inactive)
  const handleUpdateStatus = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id
          ? { ...notif, status: notif.status === 'Active' ? 'Inactive' : 'Active' }
          : notif
      )
    )
  }

  // Function to delete notification
  const handleDelete = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  // Filtering logic
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.heading.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || notif.status === selectedStatus
    const matchesDate = selectedDate === '' || notif.date === selectedDate
    const matchesValidUpto = selectedValidUpto === '' || notif.validUpto === selectedValidUpto

    return matchesSearch && matchesStatus && matchesDate && matchesValidUpto
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Notifications</strong>
            {/* Search Input */}
            <CFormInput
              className="mt-2 mb-2"
              type="text"
              placeholder="Search by heading..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Filters */}
            <div className="row g-3">
              <CCol md={3}>
                <CFormLabel>Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Valid Upto</CFormLabel>
                <CFormInput
                  type="date"
                  value={selectedValidUpto}
                  onChange={(e) => setSelectedValidUpto(e.target.value)}
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Status</CFormLabel>
                <CFormSelect
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </CFormSelect>
              </CCol>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Notification Table */}
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Heading</CTableHeaderCell>
                  <CTableHeaderCell>Content</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Valid Upto</CTableHeaderCell>
                  <CTableHeaderCell>Action</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredNotifications.map((notif) => (
                  <CTableRow key={notif.id}>
                    <CTableDataCell>{notif.id}</CTableDataCell>
                    <CTableDataCell>{notif.date}</CTableDataCell>
                    <CTableDataCell>{notif.heading}</CTableDataCell>
                    <CTableDataCell>{notif.content}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color={notif.status === 'Active' ? 'success' : 'danger'}
                        onClick={() => handleUpdateStatus(notif.id)}
                      >
                        {notif.status}
                      </CButton>
                    </CTableDataCell>
                    <CTableDataCell>{notif.validUpto}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="warning"
                        className="me-2"
                        onClick={() => handleEdit(notif.id)}
                      >
                        Edit
                      </CButton>
                      <CButton color="danger" onClick={() => handleDelete(notif.id)}>
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filteredNotifications.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={7}>No records found.</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AllNotification
