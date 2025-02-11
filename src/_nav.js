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
    to: '/school',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Details',
        to: '/school/school-detail',
      },
      {
        component: CNavItem,
        name: 'Class Title',
        to: '/school/class-title',
      },
      {
        component: CNavItem,
        name: 'Section Title',
        to: '/school/section-title',
      },
      {
        component: CNavItem,
        name: 'Group Title',
        to: '/school/group-title',
      },
      {
        component: CNavItem,
        name: 'House Title',
        to: '/school/house-title',
      },
      {
        component: CNavItem,
        name: 'Bus Title',
        to: '/school/bus-title',
      },
      {
        component: CNavItem,
        name: 'Hostel Title',
        to: '/school/hostel-title',
      },
      {
        component: CNavItem,
        name: 'Game Title',
        to: '/school/game-title',
      },
      {
        component: CNavItem,
        name: 'City Title',
        to: '/school/city-title',
      },
      {
        component: CNavItem,
        name: 'State Title',
        to: '/school/state-title',
      },
      {
        component: CNavItem,
        name: 'Parent Profession',
        to: '/school/parent-profession',
      },
      {
        component: CNavItem,
        name: 'Job Department',
        to: '/school/job-department',
      },
      {
        component: CNavItem,
        name: 'Job Designation',
        to: '/school/job-designation',
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
        name: 'Student Left Date',
        to: '/student/left-student',
      },
      {
        component: CNavItem,
        name: 'Student Attendance',
        to: '/student/student-attendance',
      },
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
    to: '/buttons',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: (
          <React.Fragment>
            {'Fess Collection'}
            <CIcon icon={cilExternalLink} size="sm" className="ms-2" />
          </React.Fragment>
        ),
        href: 'https://coreui.io/react/docs/components/loading-button/',
        badge: {
          color: 'danger',
          text: 'PRO',
        },
      },
      {
        component: CNavItem,
        name: 'Invoices',
        to: '/buttons/buttons',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Account Management',
    icon: <CIcon icon={cilBalanceScale} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Balance Head L1',
        to: '/icons/coreui-icons',
      },
      {
        component: CNavItem,
        name: 'Ledger Head L2',
        to: '/icons/flags',
      },
      {
        component: CNavItem,
        name: 'Opening Balance',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Cash Transaction',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Journal Transaction',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Bank Transaction',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Fee Receipt',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Inc./Exp Balance',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Deprecation Transfer',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Account Setup',
        to: '/icons/brands',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Books and Logs',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Day Book',
        to: '/icons/coreui-icons',
      },
      {
        component: CNavItem,
        name: 'Cash Book',
        to: '/icons/flags',
      },
      {
        component: CNavItem,
        name: 'Journal Book',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Ledger',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Ledger TDS',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Account Statement',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Cash Statement',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Trail Balance',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Monthly Balance',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Deprecation',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'P&L Statement',
        to: '/icons/brands',
      },
      {
        component: CNavItem,
        name: 'Balance Sheet',
        to: '/icons/brands',
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
