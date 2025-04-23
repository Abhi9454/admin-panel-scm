import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilExternalLink,
  cilStar,
  cilBank,
  cilUser,
  cilTextSquare,
  cilMoney,
  cilBalanceScale,
  cilBook,
  cilBusAlt,
  cilPrint,
  cilAlignCenter,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/dashboard',
  },
  {
    component: CNavTitle,
    name: 'Master Step UP',
  },
  {
    component: CNavGroup,
    name: 'School Management',
    to: '/auth',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Details',
        to: '/auth/auth-detail',
      },
      {
        component: CNavItem,
        name: 'Class Title',
        to: '/auth/class-title',
      },
      {
        component: CNavItem,
        name: 'Section Title',
        to: '/auth/section-title',
      },
      {
        component: CNavItem,
        name: 'Group Title',
        to: '/auth/group-title',
      },
      {
        component: CNavItem,
        name: 'House Title',
        to: '/auth/house-title',
      },
      {
        component: CNavItem,
        name: 'Bus Title',
        to: '/auth/bus-title',
      },
      {
        component: CNavItem,
        name: 'Hostel Title',
        to: '/auth/hostel-title',
      },
      {
        component: CNavItem,
        name: 'Game Title',
        to: '/auth/game-title',
      },
      {
        component: CNavItem,
        name: 'City Title',
        to: '/auth/city-title',
      },
      {
        component: CNavItem,
        name: 'State Title',
        to: '/auth/state-title',
      },
      {
        component: CNavItem,
        name: 'Parent Profession',
        to: '/auth/parent-profession',
      },
      {
        component: CNavItem,
        name: 'Job Department',
        to: '/auth/job-department',
      },
      {
        component: CNavItem,
        name: 'Job Designation',
        to: '/auth/job-designation',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Student Management',
    to: '/student',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Students',
        to: '/student/all-students',
      },
      {
        component: CNavItem,
        name: 'Student Admission',
        to: '/student/add-student',
      },
      {
        component: CNavItem,
        name: 'Student Application',
        to: '/student/student-application',
      },
      {
        component: CNavItem,
        name: 'Student Left Date',
        to: '/student/left-student',
      },
      // {
      //   component: CNavItem,
      //   name: 'Student Attendance',
      //   to: '/student/student-attendance',
      // },
      {
        component: CNavItem,
        name: 'Transfer Certificate',
        to: '/student/transfer-certificate-student',
      },
      {
        component: CNavItem,
        name: 'Refundable Security',
        to: '/student/refundable-security',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Teachers Management',
    icon: <CIcon icon={cilTextSquare} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Teachers',
        to: '/teacher/all-teachers',
      },
      {
        component: CNavItem,
        name: 'Add Teacher',
        to: '/teacher/add-teacher',
      },
      {
        component: CNavItem,
        name: 'Create Subject',
        to: '/teacher/create-subject',
      },
      {
        component: CNavItem,
        name: 'Teacher Allocation',
        to: '/forms/checks-radios',
      },
      {
        component: CNavItem,
        name: 'TT Class Wise',
        to: '/forms/range',
      },
      {
        component: CNavItem,
        name: 'TT Period Wise',
        to: '/forms/range',
      },
      {
        component: CNavItem,
        name: 'Teacher Schedule',
        to: '/forms/input-group',
      },
      {
        component: CNavItem,
        name: 'Teacher Substitution',
        to: '/forms/floating-labels',
      },
      {
        component: CNavItem,
        name: 'Mutual Transfer',
        href: 'https://coreui.io/react/docs/forms/date-range-picker/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Finance & Invoices ',
    to: '/finances',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: <React.Fragment>{'Fess Collection'}</React.Fragment>,
        href: '/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Invoices',
        to: '/finances/invoices',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Account Management',
    to: '/accounts',
    icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Balance Head L1',
        to: '/accounts/balance-head-L1',
      },
      {
        component: CNavItem,
        name: 'Ledger Head L2',
        to: '/accounts/account-ledger-head-L2',
      },
      {
        component: CNavItem,
        name: 'Opening Balance',
        to: '/accounts/opening-balance',
      },
      {
        component: CNavItem,
        name: 'Cash Transaction',
        to: '/accounts/cash-transaction',
      },
      {
        component: CNavItem,
        name: 'Journal Transaction',
        to: '/accounts/journal-transaction',
      },
      {
        component: CNavItem,
        name: 'Bank Transaction',
        to: '/accounts/bank-transaction',
      },
      // {
      //   component: CNavItem,
      //   name: 'Fee Receipt Transfer',
      //   to: '/',
      // },
      {
        component: CNavItem,
        name: 'Inc./Exp Balance Transfer',
        to: '/accounts/inc-exp-balance-transfer',
      },
      {
        component: CNavItem,
        name: 'Deprecation Transfer',
        to: '/accounts/deprecation-transfer',
      },
      {
        component: CNavItem,
        name: 'Account Setup',
        to: '/accounts/account-setup',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Receipt',
    to: '/receipt',
    icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Fee Class Master',
      //   to: '/receipt/fee-class-master',
      // },
      {
        component: CNavItem,
        name: 'Create Receipt Book',
        to: '/receipt/create-receipt-book',
      },
      {
        component: CNavItem,
        name: 'Create Receipt Head',
        to: '/receipt/create-receipt-head',
      },
      {
        component: CNavItem,
        name: 'Create Fees Bill',
        to: '/receipt/create-fees-bill',
      },
      {
        component: CNavItem,
        name: 'Misc Fee Bill',
        to: '/receipt/create-misc-fee',
      },
      {
        component: CNavItem,
        name: 'Create Concession Title',
        to: '/receipt/create-concession-title',
      },
      {
        component: CNavItem,
        name: 'Student Concession',
        to: '/receipt/student-concession',
      },
      {
        component: CNavItem,
        name: 'Fees Collection',
        to: '/receipt/student-fee-receipt',
      },
      {
        component: CNavItem,
        name: 'Personal Money Class Wise',
        to: '/receipt/account-setup',
      },
      {
        component: CNavItem,
        name: 'Personal Money Student Wise',
        to: '/receipt/account-setup',
      },
      {
        component: CNavItem,
        name: 'Fees Last Date',
        to: '/receipt/fee-last-date',
      },
      {
        component: CNavItem,
        name: 'Fees Receipt Cancelled',
        to: '/receipt/fee-receipt-cancelled',
      },
      {
        component: CNavItem,
        name: 'General Receipt',
        to: '/receipt/general-receipt',
      },
      {
        component: CNavItem,
        name: 'General Receipt Cancelled',
        to: '/receipt/general-receipt-cancelled',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Books and Logs',
    to: '/books-and-logs',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Day Book',
        to: '/books-and-logs/day-book',
      },
      {
        component: CNavItem,
        name: 'Cash Book',
        to: '/books-and-logs/cash-book',
      },
      {
        component: CNavItem,
        name: 'Journal Book',
        to: '/books-and-logs/journal-book',
      },
      {
        component: CNavItem,
        name: 'Ledger',
        to: '/books-and-logs/ledger',
      },
      {
        component: CNavItem,
        name: 'Ledger TDS',
        to: '/books-and-logs/ledger-tds',
      },
      {
        component: CNavItem,
        name: 'Account Statement',
        to: '/books-and-logs/account-statement',
      },
      {
        component: CNavItem,
        name: 'Trail Balance',
        to: '/books-and-logs/trail-balance',
      },
      {
        component: CNavItem,
        name: 'Monthly Balance',
        to: '/books-and-logs/monthly-balance',
      },
      {
        component: CNavItem,
        name: 'Deprecation Details',
        to: '/books-and-logs/deprecation-details',
      },
      {
        component: CNavItem,
        name: 'P&L Statement',
        to: '/books-and-logs/profit-loss-statement',
      },
      {
        component: CNavItem,
        name: 'Balance Sheet',
        to: '/books-and-logs/balance-sheet',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Transportation',
    icon: <CIcon icon={cilBusAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Transport Owner',
        to: '/notifications/alerts',
      },
      {
        component: CNavItem,
        name: 'Bus Route',
        to: '/notifications/badges',
      },
      {
        component: CNavItem,
        name: 'Bus Stop',
        to: '/notifications/modals',
      },
      {
        component: CNavItem,
        name: 'Students Wise',
        to: '/notifications/toasts',
      },
      {
        component: CNavItem,
        name: 'Class Wise',
        to: '/notifications/toasts',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Academics',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Subject Title',
        to: '/notifications/alerts',
      },
      {
        component: CNavItem,
        name: 'Subject Stream',
        to: '/notifications/badges',
      },
      {
        component: CNavItem,
        name: 'Assign Stream',
        to: '/notifications/modals',
      },
      {
        component: CNavItem,
        name: 'Marks Details',
        to: '/notifications/toasts',
      },
      {
        component: CNavItem,
        name: 'Student Activity',
        to: '/notifications/toasts',
      },
      {
        component: CNavItem,
        name: 'Remarks Master',
        to: '/notifications/toasts',
      },
      {
        component: CNavItem,
        name: 'Nur to 3rd',
        to: '/notifications/toasts',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reports',
    icon: <CIcon icon={cilPrint} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Fees Collection',
        to: '/notifications/alerts',
      },
      {
        component: CNavItem,
        name: 'Defaulters List',
        to: '/notifications/badges',
      },
      {
        component: CNavItem,
        name: 'Concession Report',
        to: '/notifications/modals',
      },
      {
        component: CNavItem,
        name: 'Student Account',
        to: '/notifications/toasts',
      },
      {
        component: CNavItem,
        name: 'Head Wise',
        to: '/notifications/toasts',
      },
      {
        component: CNavItem,
        name: 'Remarks Master',
        to: '/notifications/toasts',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Notification',
    icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
    items: [
      {
        component: CNavItem,
        name: 'Add Notification',
        to: '/notifications/add-notification',
      },
      {
        component: CNavItem,
        name: 'All Notification',
        to: '/notifications/all-notification',
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Extras',
  },
  {
    component: CNavGroup,
    name: 'Session Management',
    icon: <CIcon icon={cilAlignCenter} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Docs',
        to: '/register',
      },
      {
        component: CNavItem,
        name: 'Change Password',
        to: '/login',
      },
      {
        component: CNavItem,
        name: 'Logout',
        to: '/register',
      },
    ],
  },
]

export default _nav
