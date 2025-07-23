import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilUser,
  cilMoney,
  cilChart,
  cilCalendar,
  cilBell,
  cilBook,
  cilBusAlt,
  cilCash,
  cilCreditCard,
  cilDataTransferUp,
  cilDataTransferDown,
  cilClock,
  cilHome,
  cilSchool,
  cilUserFemale,
  cilNoteAdd,
  cilCloudDownload,
} from '@coreui/icons'

import MainChart from './MainChart'

const Dashboard = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Quick action cards data
  const quickActions = [
    {
      title: 'All Students',
      count: '1,247',
      icon: cilPeople,
      color: 'primary',
      link: '/#/student/all-students',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'All Teachers',
      count: '89',
      icon: cilUser,
      color: 'success',
      link: '/teacher/all-teachers',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Generate Receipt',
      count: '₹2.4L',
      icon: cilCreditCard,
      color: 'warning',
      link: '#/receipt/student-fee-receipt',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      title: 'Generate Report',
      count: '12 Types',
      icon: cilChart,
      color: 'info',
      link: '#/report/all-students',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ]

  // Financial overview data
  const financialCards = [
    {
      title: 'Total Collection',
      amount: '₹12,45,650',
      percentage: '+12.5%',
      trend: 'up',
      icon: cilMoney,
      color: 'success',
      period: 'This Year',
    },
    {
      title: "Today's Collection",
      amount: '₹45,230',
      percentage: '+8.2%',
      trend: 'up',
      icon: cilCash,
      color: 'primary',
      period: 'Today',
    },
    {
      title: 'Monthly Collection',
      amount: '₹3,89,450',
      percentage: '+15.3%',
      trend: 'up',
      icon: cilDataTransferUp,
      color: 'info',
      period: 'This Month',
    },
    {
      title: 'Expenses This Month',
      amount: '₹1,23,800',
      percentage: '-5.1%',
      trend: 'down',
      icon: cilDataTransferDown,
      color: 'warning',
      period: 'This Month',
    },
  ]

  // Recent activities data
  const recentActivities = [
    {
      name: 'Rajesh Kumar',
      action: 'Fee Payment',
      amount: '₹12,500',
      time: '2 min ago',
      type: 'payment',
    },
    {
      name: 'Priya Sharma',
      action: 'New Admission',
      amount: 'Class 9',
      time: '15 min ago',
      type: 'admission',
    },
    {
      name: 'Amit Singh',
      action: 'Fee Payment',
      amount: '₹8,750',
      time: '1 hour ago',
      type: 'payment',
    },
    {
      name: 'Sneha Patel',
      action: 'Leave Request',
      amount: '2 days',
      time: '2 hours ago',
      type: 'leave',
    },
    {
      name: 'Vikram Yadav',
      action: 'Fee Payment',
      amount: '₹15,200',
      time: '3 hours ago',
      type: 'payment',
    },
  ]

  // Upcoming events
  const upcomingEvents = [
    { event: 'Parent-Teacher Meeting', date: 'Dec 28, 2024', time: '10:00 AM', priority: 'high' },
    { event: 'Annual Sports Day', date: 'Jan 5, 2025', time: '9:00 AM', priority: 'medium' },
    { event: 'Winter Break Starts', date: 'Dec 25, 2024', time: 'All Day', priority: 'low' },
    { event: 'Term End Exams', date: 'Jan 15, 2025', time: '9:00 AM', priority: 'high' },
  ]

  // Class-wise statistics
  const classStats = [
    { class: 'Nursery', students: 45, capacity: 50, percentage: 90 },
    { class: 'Class I', students: 48, capacity: 50, percentage: 96 },
    { class: 'Class II', students: 42, capacity: 50, percentage: 84 },
    { class: 'Class III', students: 47, capacity: 50, percentage: 94 },
    { class: 'Class IV', students: 44, capacity: 50, percentage: 88 },
    { class: 'Class V', students: 46, capacity: 50, percentage: 92 },
  ]

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
  }

  const { date, time } = formatDateTime(currentDateTime)

  return (
    <>
      {/* Header Section */}
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary fw-bold mb-1">Your Dashboard</h2>
              <p className="text-muted mb-0">
                Welcome back! Here's what's happening at your school today.
              </p>
            </div>
            <div className="text-end">
              <div className="fw-semibold text-primary">{time}</div>
              <small className="text-muted">{date}</small>
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Quick Action Cards */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <h5 className="text-muted fw-semibold mb-3 border-bottom pb-2">🚀 Quick Actions</h5>
        </CCol>
        {quickActions.map((action, index) => (
          <CCol lg={3} md={6} key={index} className="mb-3">
            <a href={action.link} style={{ textDecoration: 'none' }}>
              <CCard
                className="h-100 border-0 shadow-sm hover-lift"
                style={{
                  background: action.gradient,
                  color: 'white',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <CCardBody className="text-center p-4">
                  <CIcon icon={action.icon} size="3xl" className="mb-3 opacity-75" />
                  <p className="mb-0 opacity-90">{action.title}</p>
                </CCardBody>
              </CCard>
            </a>
          </CCol>
        ))}
      </CRow>

      {/* Financial Overview */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <h5 className="text-muted fw-semibold mb-3 border-bottom pb-2">💰 Financial Overview</h5>
        </CCol>
        {financialCards.map((card, index) => (
          <CCol lg={3} md={6} key={index} className="mb-3">
            <CCard className="h-100 border-0 shadow-sm">
              <CCardBody className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className={`p-3 rounded-3 bg-${card.color} bg-opacity-10`}>
                    <CIcon icon={card.icon} size="xl" className={`text-${card.color}`} />
                  </div>
                  <CBadge color={card.trend === 'up' ? 'success' : 'danger'} className="text-white">
                    {card.percentage}
                  </CBadge>
                </div>
                <h4 className="fw-bold text-dark mb-1">{card.amount}</h4>
                <p className="text-muted mb-1">{card.title}</p>
                <small className="text-muted">{card.period}</small>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      <CRow className="mb-4">
        {/* Fee Collection Chart */}
        {/*<CCol lg={8}>*/}
        {/*  <CCard className="h-100 border-0 shadow-sm">*/}
        {/*    <CCardHeader className="border-bottom-0 bg-transparent">*/}
        {/*      <div className="d-flex justify-content-between align-items-center">*/}
        {/*        <div>*/}
        {/*          <h5 className="fw-bold text-primary mb-1">📊 Fee Collection Trends</h5>*/}
        {/*          <small className="text-muted">January - December 2024</small>*/}
        {/*        </div>*/}
        {/*        <CButton color="primary" size="sm" className="d-none d-md-block">*/}
        {/*          <CIcon icon={cilCloudDownload} className="me-1" />*/}
        {/*          Export*/}
        {/*        </CButton>*/}
        {/*      </div>*/}
        {/*    </CCardHeader>*/}
        {/*    <CCardBody>*/}
        {/*      <MainChart />*/}
        {/*    </CCardBody>*/}
        {/*  </CCard>*/}
        {/*</CCol>*/}

        <CCol lg={6}>
          <CCard className="border-0 shadow-sm">
            <CCardHeader className="border-bottom-0 bg-transparent">
              <h6 className="fw-bold text-primary mb-0">🔔 Recent Activities</h6>
            </CCardHeader>
            <CCardBody className="p-0">
              <CTable className="mb-0" hover responsive>
                <CTableBody>
                  {recentActivities.map((activity, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="border-0 py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className={`me-3 p-2 rounded-circle bg-${
                              activity.type === 'payment'
                                ? 'success'
                                : activity.type === 'admission'
                                  ? 'primary'
                                  : 'warning'
                            } bg-opacity-10`}
                          >
                            <CIcon
                              icon={
                                activity.type === 'payment'
                                  ? cilMoney
                                  : activity.type === 'admission'
                                    ? cilUser
                                    : cilClock
                              }
                              className={`text-${
                                activity.type === 'payment'
                                  ? 'success'
                                  : activity.type === 'admission'
                                    ? 'primary'
                                    : 'warning'
                              }`}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold text-light">{activity.name}</div>
                            <small className="text-muted">
                              {activity.action} • {activity.amount}
                            </small>
                          </div>
                          <small className="text-muted">{activity.time}</small>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Calendar & Events */}
        <CCol lg={6}>
          <CCard className="h-100 border-0 shadow-sm">
            <CCardHeader className="border-bottom-0 bg-transparent">
              <h6 className="fw-bold text-primary mb-0">📅 Upcoming Events</h6>
            </CCardHeader>
            <CCardBody className="p-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="d-flex align-items-center mb-3 p-3 bg-primary rounded-3">
                  <div
                    className={`me-3 p-2 rounded-circle bg-${
                      event.priority === 'high'
                        ? 'danger'
                        : event.priority === 'medium'
                          ? 'warning'
                          : 'success'
                    } bg-opacity-10`}
                  >
                    <CIcon
                      icon={cilCalendar}
                      className={`text-${
                        event.priority === 'high'
                          ? 'danger'
                          : event.priority === 'medium'
                            ? 'warning'
                            : 'success'
                      }`}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark">{event.event}</div>
                    <small className="text-muted">
                      {event.date} • {event.time}
                    </small>
                  </div>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/*<CRow>*/}
      {/*  /!* Recent Activities *!/*/}
      {/*  <CCol lg={12}>*/}
      {/*    <CCard className="border-0 shadow-sm">*/}
      {/*      <CCardHeader className="border-bottom-0 bg-transparent">*/}
      {/*        <h6 className="fw-bold text-primary mb-0">🔔 Recent Activities</h6>*/}
      {/*      </CCardHeader>*/}
      {/*      <CCardBody className="p-0">*/}
      {/*        <CTable className="mb-0" hover responsive>*/}
      {/*          <CTableBody>*/}
      {/*            {recentActivities.map((activity, index) => (*/}
      {/*              <CTableRow key={index}>*/}
      {/*                <CTableDataCell className="border-0 py-3">*/}
      {/*                  <div className="d-flex align-items-center">*/}
      {/*                    <div*/}
      {/*                      className={`me-3 p-2 rounded-circle bg-${*/}
      {/*                        activity.type === 'payment'*/}
      {/*                          ? 'success'*/}
      {/*                          : activity.type === 'admission'*/}
      {/*                            ? 'primary'*/}
      {/*                            : 'warning'*/}
      {/*                      } bg-opacity-10`}*/}
      {/*                    >*/}
      {/*                      <CIcon*/}
      {/*                        icon={*/}
      {/*                          activity.type === 'payment'*/}
      {/*                            ? cilMoney*/}
      {/*                            : activity.type === 'admission'*/}
      {/*                              ? cilUser*/}
      {/*                              : cilClock*/}
      {/*                        }*/}
      {/*                        className={`text-${*/}
      {/*                          activity.type === 'payment'*/}
      {/*                            ? 'success'*/}
      {/*                            : activity.type === 'admission'*/}
      {/*                              ? 'primary'*/}
      {/*                              : 'warning'*/}
      {/*                        }`}*/}
      {/*                      />*/}
      {/*                    </div>*/}
      {/*                    <div className="flex-grow-1">*/}
      {/*                      <div className="fw-semibold text-light">{activity.name}</div>*/}
      {/*                      <small className="text-muted">*/}
      {/*                        {activity.action} • {activity.amount}*/}
      {/*                      </small>*/}
      {/*                    </div>*/}
      {/*                    <small className="text-muted">{activity.time}</small>*/}
      {/*                  </div>*/}
      {/*                </CTableDataCell>*/}
      {/*              </CTableRow>*/}
      {/*            ))}*/}
      {/*          </CTableBody>*/}
      {/*        </CTable>*/}
      {/*      </CCardBody>*/}
      {/*    </CCard>*/}
      {/*  </CCol>*/}
      {/*</CRow>*/}

      {/* Quick Stats Footer */}
      <CRow className="mt-4">
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm bg-secondary">
            <CCardBody className="py-3">
              <CRow className="text-center">
                <CCol md={3} sm={6} className="border-end">
                  <div className="fw-bold text-primary">📖</div>
                  <div className="fw-semibold">Active Courses</div>
                  <div className="text-muted">25</div>
                </CCol>
                <CCol md={3} sm={6} className="border-end">
                  <div className="fw-bold text-success">🚌</div>
                  <div className="fw-semibold">Active Buses</div>
                  <div className="text-muted">12</div>
                </CCol>
                <CCol md={3} sm={6} className="border-end">
                  <div className="fw-bold text-warning">🏠</div>
                  <div className="fw-semibold">School Houses</div>
                  <div className="text-muted">4</div>
                </CCol>
                <CCol md={3} sm={6}>
                  <div className="fw-bold text-info">📋</div>
                  <div className="fw-semibold">Pending Tasks</div>
                  <div className="text-muted">8</div>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.2s ease-in-out;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </>
  )
}

export default Dashboard
