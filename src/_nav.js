import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilHome,
  cilSettings,
  cilLocationPin,
  cilPeople,
  cilCalculator,
  cilCreditCard,
  cilBusAlt,
  cilSchool,
  cilChart,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // ==================== DASHBOARD ====================
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
  },

  // ==================== SETUP & CONFIGURATION ====================
  {
    component: CNavTitle,
    name: 'Setup & Configuration',
  },
  {
    component: CNavGroup,
    name: 'School Setup',
    to: '/auth',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'School Info',
        to: '/auth/auth-detail',
      },
      {
        component: CNavItem,
        name: 'Classes',
        to: '/auth/class-title',
      },
      {
        component: CNavItem,
        name: 'Sections',
        to: '/auth/section-title',
      },
      {
        component: CNavItem,
        name: 'Groups',
        to: '/auth/group-title',
      },
      {
        component: CNavItem,
        name: 'Houses',
        to: '/auth/house-title',
      },
      {
        component: CNavItem,
        name: 'Hostels',
        to: '/auth/hostel-title',
      },
      {
        component: CNavItem,
        name: 'Sports & Games',
        to: '/auth/game-title',
      },
      {
        component: CNavItem,
        name: 'States',
        to: '/auth/state-title',
      },
      {
        component: CNavItem,
        name: 'Cities',
        to: '/auth/city-title',
      },
      {
        component: CNavItem,
        name: 'Professions',
        to: '/auth/parent-profession',
      },
      {
        component: CNavItem,
        name: 'Departments',
        to: '/auth/job-department',
      },
      {
        component: CNavItem,
        name: 'Designations',
        to: '/auth/job-designation',
      },
    ],
  },

  // ==================== CORE OPERATIONS ====================
  {
    component: CNavTitle,
    name: 'Core Operations',
  },
  {
    component: CNavGroup,
    name: 'Students',
    to: '/student',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Directory',
        to: '/student/all-students',
      },
      {
        component: CNavItem,
        name: 'New Admission',
        to: '/student/add-student',
      },
      {
        component: CNavItem,
        name: 'Applications',
        to: '/student/student-application',
      },
      {
        component: CNavItem,
        name: 'Leaving Records',
        to: '/student/left-student',
      },
      {
        component: CNavItem,
        name: 'Transfer Certificates',
        to: '/student/transfer-certificate-student',
      },
      {
        component: CNavItem,
        name: 'Security Deposits',
        to: '/student/refundable-security',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Academics',
    icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Subjects',
        to: '/academics-management/add-subject',
      },
      {
        component: CNavItem,
        name: 'Subject Streams',
        to: '/academics-management/create-stream',
      },
      {
        component: CNavItem,
        name: 'Stream Assignment',
        to: '/academics-management/assign-stream',
      },
      {
        component: CNavItem,
        name: 'Activities',
        to: '/academics-management/student-activity',
      },
      {
        component: CNavItem,
        name: 'Remarks',
        to: '/academics-management/remarks',
      },
      {
        component: CNavItem,
        name: 'Primary Assessment',
        to: '/academics-management/marks-nur-to-3rd',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Transport',
    icon: <CIcon icon={cilBusAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Vehicle Owners',
        to: '/transport/transport-owner',
      },
      {
        component: CNavItem,
        name: 'Routes',
        to: '/transport/bus-route',
      },
      {
        component: CNavItem,
        name: 'Stops',
        to: '/transport/bus-stop',
      },
      {
        component: CNavItem,
        name: 'Student Assignment',
        to: '/transport/assign-student-wise',
      },
      {
        component: CNavItem,
        name: 'Class Assignment',
        to: '/transport/assign-class-wise',
      },
    ],
  },

  // ==================== FINANCIAL MANAGEMENT ====================
  {
    component: CNavTitle,
    name: 'Financial Management',
  },
  {
    component: CNavGroup,
    name: 'Accounting',
    to: '/accounts',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Chart of Accounts L1',
        to: '/accounts/balance-head-L1',
      },
      {
        component: CNavItem,
        name: 'Ledger Accounts L2',
        to: '/accounts/account-ledger-head-L2',
      },
      {
        component: CNavItem,
        name: 'Opening Balances',
        to: '/accounts/opening-balance',
      },
      {
        component: CNavItem,
        name: 'Cash Transactions',
        to: '/accounts/cash-transaction',
      },
      {
        component: CNavItem,
        name: 'Journal Entries',
        to: '/accounts/journal-transaction',
      },
      {
        component: CNavItem,
        name: 'Bank Transactions',
        to: '/accounts/bank-transaction',
      },
      {
        component: CNavItem,
        name: 'Income/Expense Transfer',
        to: '/accounts/inc-exp-balance-transfer',
      },
      {
        component: CNavItem,
        name: 'Depreciation Transfer',
        to: '/accounts/deprecation-transfer',
      },
      {
        component: CNavItem,
        name: 'Account Config',
        to: '/accounts/account-setup',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Fee Management',
    to: '/receipt',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Receipt Books',
        to: '/receipt/create-receipt-book',
      },
      {
        component: CNavItem,
        name: 'Fee Heads',
        to: '/receipt/create-receipt-head',
      },
      {
        component: CNavItem,
        name: 'Fee Structure',
        to: '/receipt/create-fees-bill',
      },
      {
        component: CNavItem,
        name: 'Misc Fees',
        to: '/receipt/create-misc-fee',
      },
      {
        component: CNavItem,
        name: 'Concession Head',
        to: '/receipt/create-concession-title',
      },
      {
        component: CNavItem,
        name: 'Student Concessions',
        to: '/receipt/student-concession',
      },
      {
        component: CNavItem,
        name: 'Fee Collection',
        to: '/receipt/student-fee-receipt',
      },
      {
        component: CNavItem,
        name: 'Due Dates',
        to: '/receipt/fee-last-date',
      },
      {
        component: CNavItem,
        name: 'Cancelled Receipts',
        to: '/receipt/fee-receipt-cancelled',
      },
      {
        component: CNavItem,
        name: 'General Receipts',
        to: '/receipt/general-receipt',
      },
      {
        component: CNavItem,
        name: 'Cancelled General',
        to: '/receipt/general-receipt-cancelled',
      },
    ],
  },

  // ==================== REPORTS & ANALYTICS ====================
  {
    component: CNavTitle,
    name: 'Reports & Analytics',
  },
  {
    component: CNavGroup,
    name: 'Reports',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Student Reports',
        to: '/report/all-students',
      },
      {
        component: CNavItem,
        name: 'Fee Defaulters',
        to: '/report/defaulter-list',
      },
      {
        component: CNavItem,
        name: 'Concession Analysis',
        to: '/report/concession-report',
      },
      {
        component: CNavItem,
        name: 'Fee Accounts',
        to: '/report/fee-account',
      },
      {
        component: CNavItem,
        name: 'Head-wise Analysis',
        to: '/report/head-wise',
      },
      {
        component: CNavItem,
        name: 'Remarks Summary',
        to: '/report/remark-master',
      },
    ],
  },
]

export default _nav
