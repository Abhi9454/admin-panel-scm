import React from 'react'
import { Route } from 'react-router-dom'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//School
const SchoolDetail = React.lazy(() => import('./views/school/SchoolDetail'))
const ClassTitle = React.lazy(() => import('./views/school/ClassTitle'))
const BusTitle = React.lazy(() => import('./views/school/BusTitle'))
const CityTitle = React.lazy(() => import('./views/school/CityTitle'))
const StateTitle = React.lazy(() => import('./views/school/StateTitle'))
const GameTitle = React.lazy(() => import('./views/school/GameTitle'))
const HostelTitle = React.lazy(() => import('./views/school/HostelTitle'))
const SectionTitle = React.lazy(() => import('./views/school/SectionTitle'))
const GroupTitle = React.lazy(() => import('./views/school/GroupTitle'))
const HouseTitle = React.lazy(() => import('./views/school/HouseTitle'))
const ParentProfession = React.lazy(() => import('./views/school/ParentProfession'))
const JobDepartment = React.lazy(() => import('./views/school/JobDepartment'))
const JobDesignation = React.lazy(() => import('./views/school/JobDesignation'))

//Student
const AllStudent = React.lazy(() => import('./views/student/AllStudent'))
const AddStudent = React.lazy(() => import('./views/student/AddStudent'))
const EditStudent = React.lazy(() => import('./views/student/EditStudent'))
const LeftStudent = React.lazy(() => import('./views/student/StudentLeftDate'))
const StudentAppDetails = React.lazy(() => import('./views/student/StudentAppDetails'))
const StudentTransferCertificate = React.lazy(
  () => import('./views/student/StudentTransferCertificate'),
)
const StudentAttendance = React.lazy(() => import('./views/student/StudentAttendance'))
const RefundableFees = React.lazy(() => import('./views/student/RefundableFees'))

//Teacher
const AllTeacher = React.lazy(() => import('./views/teacher/AllTeacher'))
const AddTeacher = React.lazy(() => import('./views/teacher/AddTeacher'))
const EditTeacher = React.lazy(() => import('./views/teacher/EditTeacher'))
const CreateSubject = React.lazy(() => import('./views/teacher/CreateSubject'))

//Account Management
const BalanceHeadL1 = React.lazy(() => import('./views/accounts/BalanceHeadL1'))
const LeaderHeadL2 = React.lazy(() => import('./views/accounts/LeaderHeadL2'))
const OpeningBalance = React.lazy(() => import('./views/accounts/OpeningBalance'))
const CashTransaction = React.lazy(() => import('./views/accounts/CashTransaction'))
const JournalTransaction = React.lazy(() => import('./views/accounts/JournalTransaction'))
const BankTransaction = React.lazy(() => import('./views/accounts/BankTransaction'))
const IncExpBalanceTransfer = React.lazy(() => import('./views/accounts/IncExpBalanceTransfer'))
const DepreciationBalanceTransfer = React.lazy(
  () => import('./views/accounts/DepreciationBalanceTransfer'),
)
const AccountSetUp = React.lazy(() => import('./views/accounts/AccountSetUp'))

//Receipts
const FeeClassMaster = React.lazy(() => import('./views/receipt/FeesClassMaster'))
const ReceiptBookTitle = React.lazy(() => import('./views/receipt/ReceiptBookTitle'))
const ReceiptHeadTitle = React.lazy(() => import('./views/receipt/ReceiptHeadTitle'))
const CreateFeesBill = React.lazy(() => import('./views/receipt/CreateFeesBill'))
const CreateFeesBillClassWise = React.lazy(() => import('./views/receipt/CreateMiscFee'))
const AddMiscFeeToStudent = React.lazy(() => import('./views/receipt/AddMiscFeeToStudent'))
const CreateConcessionTitle = React.lazy(() => import('./views/receipt/CreateConcessionTitle'))
const StudentFeeReceipt = React.lazy(() => import('./views/receipt/StudentFeeReceipt'))
const FeeLastDate = React.lazy(() => import('./views/receipt/FeesLastDate'))
const CancelFeeReceipt = React.lazy(() => import('./views/receipt/CancelFeeReceipt'))
const GeneralReceipt = React.lazy(() => import('./views/receipt/GeneralReceipt'))
const GeneralReceiptCancelled = React.lazy(() => import('./views/receipt/GeneralReceiptCancelled'))
const StudentConcession = React.lazy(() => import('./views/receipt/StudentConcession'))

//Reports
const AllStudentReport = React.lazy(() => import('./views/reports/AllStudentReport'))
const AllAccountReport = React.lazy(() => import('./views/reports/accounts/AllAccountReport'))
const AllFeeReport = React.lazy(() => import('./views/reports/accounts/AllFeeReport'))
const DefaulterListReport = React.lazy(() => import('./views/reports/DefaulterReport'))
const ConcessionReport = React.lazy(() => import('./views/reports/ConcessionReport'))
const FeesAccountReport = React.lazy(() => import('./views/reports/FeesReport'))
const HeadMasterReport = React.lazy(() => import('./views/reports/HeadWiseReport'))
const RemarkMasterReport = React.lazy(() => import('./views/reports/RemarksMasterReport'))

//Books and Logs
const DayBook = React.lazy(() => import('./views/books/DayBook'))
const CashBook = React.lazy(() => import('./views/books/CashBook'))
const MonthlyBalance = React.lazy(() => import('./views/books/MonthlyBalance'))
const Ledger = React.lazy(() => import('./views/books/Ledger'))
const LedgerTDS = React.lazy(() => import('./views/books/LedgerTDS'))
const JournalBook = React.lazy(() => import('./views/books/JournalBook'))
const AccountStatement = React.lazy(() => import('./views/books/AccountStatement'))
const TrailBalance = React.lazy(() => import('./views/books/TrailBalance'))
const DepreciationDetails = React.lazy(() => import('./views/books/DepreciationDetails'))
const ProfitLossStatement = React.lazy(() => import('./views/books/ProfitLossStatement'))
const BalanceSheet = React.lazy(() => import('./views/books/BalanceSheet'))

//Notifications
const AllNotification = React.lazy(() => import('./views/notification/AllNotification'))
const AddNotification = React.lazy(() => import('./views/notification/AddNotification'))

//Transport
const TransportOwner = React.lazy(() => import('./views/transport/CreateTransportOwner'))
const BusRoute = React.lazy(() => import('./views/transport/CreateBusRoute'))
const BusStop = React.lazy(() => import('./views/transport/CreateBusStop'))
const AssignStudentWise = React.lazy(() => import('./views/transport/AssignFeeStudentWise'))
const AssignClassWise = React.lazy(() => import('./views/transport/AssignFeeClassWise'))

//Import
const StudentImport = React.lazy(() => import('./views/import/StudentImport'))

//Academics
const CreateSubjectTitle = React.lazy(() => import('./views/academics/CreateSubjectTitle'))
const CreateSubjectStream = React.lazy(() => import('./views/academics/CreateSubjectStream'))
const AssignStream = React.lazy(() => import('./views/academics/AssignStream'))
const StudentMarks = React.lazy(() => import('./views/academics/StudentMarks'))
const UserSetup = React.lazy(() => import('./views/academics/UserSetup'))
const RemarksMaster = React.lazy(() => import('./views/academics/RemarksMaster'))
const MarksNurToT = React.lazy(() => import('./views/academics/StudentMarksNurToT'))
const StudentActivity = React.lazy(() => import('./views/academics/StudentActivity'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/homepage', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/auth', name: 'School', element: Cards, exact: true },
  { path: '/auth/class-title', name: 'Class Title', element: ClassTitle },
  { path: '/auth/bus-title', name: 'Bus Title', element: BusTitle },
  { path: '/auth/city-title', name: 'City Title', element: CityTitle },
  { path: '/auth/game-title', name: 'Game Title', element: GameTitle },
  { path: '/auth/hostel-title', name: 'Hostel Title', element: HostelTitle },
  { path: '/auth/section-title', name: 'Section Title', element: SectionTitle },
  { path: '/auth/group-title', name: 'Group Title', element: GroupTitle },
  { path: '/auth/house-title', name: 'House Title', element: HouseTitle },
  { path: '/auth/parent-profession', name: 'Parent Profession', element: ParentProfession },
  { path: '/auth/job-department', name: 'Job Department', element: JobDepartment },
  { path: '/auth/job-designation', name: 'Job Designation', element: JobDesignation },
  { path: '/auth/state-title', name: 'State Title', element: StateTitle },
  { path: '/auth/auth-detail', name: 'School Detail', element: SchoolDetail },
  { path: '/student', name: 'Student', element: Cards, exact: true },
  { path: '/student/all-students', name: 'All Student', element: AllStudent },
  { path: '/student/add-student', name: 'Add Student', element: AddStudent },
  { path: '/student/edit-student', name: 'Edit Student', element: EditStudent },
  { path: '/student/left-student', name: 'Student Left Date', element: LeftStudent },
  {
    path: '/student/student-application',
    name: 'Student Application Activity',
    element: StudentAppDetails,
  },
  {
    path: '/student/transfer-certificate-student',
    name: 'Student Transfer Certificate',
    element: StudentTransferCertificate,
  },
  {
    path: '/student/student-attendance',
    name: 'Student Attendance',
    element: StudentAttendance,
  },
  {
    path: '/student/refundable-security',
    name: 'Refundable Security',
    element: RefundableFees,
  },
  { path: '/teachers', name: 'Teachers', element: Cards, exact: true },
  { path: '/teacher/all-teachers', name: 'All Teachers', element: AllTeacher },
  { path: '/teacher/add-teacher', name: 'Add Teacher', element: AddTeacher },
  { path: '/teacher/edit-teacher', name: 'Edit Teacher', element: EditTeacher },
  { path: '/teacher/create-subject', name: 'Subject', element: CreateSubject },

  { path: '/finances', name: 'Finance and Invoices', element: Cards, exact: true },

  { path: '/accounts', name: 'Accounts', element: Cards, exact: true },
  { path: '/accounts/balance-head-L1', name: 'Balance Head L1', element: BalanceHeadL1 },
  { path: '/accounts/account-ledger-head-L2', name: 'Leader Head L2', element: LeaderHeadL2 },
  { path: '/accounts/opening-balance', name: 'Opening Balance', element: OpeningBalance },
  { path: '/accounts/cash-transaction', name: 'Cash Transaction', element: CashTransaction },
  {
    path: '/accounts/journal-transaction',
    name: 'Journal Transaction',
    element: JournalTransaction,
  },
  {
    path: '/accounts/bank-transaction',
    name: 'Bank Transaction',
    element: BankTransaction,
  },
  {
    path: '/accounts/inc-exp-balance-transfer',
    name: 'Income Expenses Balance Transfer',
    element: IncExpBalanceTransfer,
  },
  {
    path: '/accounts/deprecation-transfer',
    name: 'Depreciation Balance Transfer',
    element: DepreciationBalanceTransfer,
  },
  {
    path: '/accounts/account-setup',
    name: 'Account Setup',
    element: AccountSetUp,
  },

  { path: '/books-and-logs', name: 'Books and Logs', element: Cards, exact: true },
  {
    path: '/books-and-logs/day-book',
    name: 'Day Book',
    element: DayBook,
  },
  {
    path: '/books-and-logs/cash-book',
    name: 'Cash Book',
    element: CashBook,
  },
  {
    path: '/books-and-logs/monthly-balance',
    name: 'Monthly Balance',
    element: MonthlyBalance,
  },
  {
    path: '/books-and-logs/ledger',
    name: 'Ledger',
    element: Ledger,
  },
  {
    path: '/books-and-logs/ledger-tds',
    name: 'Ledger TDS',
    element: LedgerTDS,
  },
  {
    path: '/books-and-logs/journal-book',
    name: 'Journal Book',
    element: JournalBook,
  },
  {
    path: '/books-and-logs/account-statement',
    name: 'Account Statement',
    element: AccountStatement,
  },
  {
    path: '/books-and-logs/trail-balance',
    name: 'Trail Balance',
    element: TrailBalance,
  },
  {
    path: '/books-and-logs/deprecation-details',
    name: 'Depreciation Details',
    element: DepreciationDetails,
  },
  {
    path: '/books-and-logs/profit-loss-statement',
    name: 'Profit Loss Statement',
    element: ProfitLossStatement,
  },
  {
    path: '/books-and-logs/balance-sheet',
    name: 'Balance Sheet',
    element: BalanceSheet,
  },
  { path: '/notifications', name: 'Notifications', element: Cards, exact: true },
  { path: '/notifications/all-notification', name: 'All Notifications', element: AllNotification },
  { path: '/notifications/add-notification', name: 'Add Notifications', element: AddNotification },

  { path: '/receipt', name: 'Receipt', element: Cards, exact: true },
  { path: '/receipt/fee-class-master', name: 'Fee Class Master', element: FeeClassMaster },
  { path: '/receipt/create-receipt-book', name: 'Receipt Book Title', element: ReceiptBookTitle },
  { path: '/receipt/create-receipt-head', name: 'Receipt Head Title', element: ReceiptHeadTitle },
  { path: '/receipt/create-fees-bill', name: 'Create Fees Bill', element: CreateFeesBill },
  {
    path: '/receipt/create-misc-fee',
    name: 'Create Misc Fee',
    element: CreateFeesBillClassWise,
  },
  {
    path: '/receipt/create-misc-fee/add-misc-fee-student',
    name: 'Add Misc Fee Student',
    element: AddMiscFeeToStudent,
  },
  {
    path: '/receipt/create-concession-title',
    name: 'Create Concession Title',
    element: CreateConcessionTitle,
  },
  {
    path: '/receipt/student-fee-receipt',
    name: 'Student Fee Receipt',
    element: StudentFeeReceipt,
  },
  {
    path: '/receipt/fee-last-date',
    name: 'Fee Last Date',
    element: FeeLastDate,
  },
  {
    path: '/receipt/fee-receipt-cancelled',
    name: 'Cancel Fee Receipt',
    element: CancelFeeReceipt,
  },
  {
    path: '/receipt/general-receipt',
    name: 'General Receipt',
    element: GeneralReceipt,
  },
  {
    path: '/receipt/general-receipt-cancelled',
    name: 'Cancel General Receipt',
    element: GeneralReceiptCancelled,
  },
  {
    path: '/receipt/student-concession',
    name: 'Student Concession',
    element: StudentConcession,
  },

  { path: '/reports', name: 'Reports', element: Cards, exact: true },
  {
    path: '/report/all-students',
    name: 'All Students',
    element: AllStudentReport,
  },
  {
    path: '/report/accounts',
    name: 'Accounts Reports',
    element: AllAccountReport,
  },
  {
    path: '/report/fee-reports',
    name: 'Fee Reports',
    element: AllFeeReport,
  },
  {
    path: '/report/concession-report',
    name: 'Concession Report',
    element: ConcessionReport,
  },
  {
    path: '/report/fee-account',
    name: 'Fees Account',
    element: FeesAccountReport,
  },
  {
    path: '/report/head-wise',
    name: 'Head Wise',
    element: HeadMasterReport,
  },
  {
    path: '/report/remark-master',
    name: 'Remark Master Report',
    element: RemarkMasterReport,
  },
  { path: '/academics-management', name: 'Academics Management', element: Cards, exact: true },
  {
    path: '/academics-management/add-subject',
    name: 'Add Subject',
    element: CreateSubjectTitle,
  },
  {
    path: '/academics-management/create-stream',
    name: 'Create Subject Stream',
    element: CreateSubjectStream,
  },
  {
    path: '/academics-management/user-setup',
    name: 'User Setup',
    element: UserSetup,
  },
  {
    path: '/academics-management/assign-stream',
    name: 'Assign Stream',
    element: AssignStream,
  },
  {
    path: '/academics-management/student-marks',
    name: 'StudentMarks',
    element: StudentMarks,
  },
  {
    path: '/academics-management/marks-nur-to-3rd',
    name: 'Student Marks Nur to -3rd',
    element: MarksNurToT,
  },
  {
    path: '/academics-management/remarks',
    name: 'Remarks Master',
    element: RemarksMaster,
  },
  {
    path: '/academics-management/student-activity',
    name: 'Student Activity',
    element: StudentActivity,
  },
  { path: '/transport-management', name: 'Transport Management', element: Cards, exact: true },
  {
    path: '/transport/transport-owner',
    name: 'Transport Owner',
    element: TransportOwner,
  },
  {
    path: '/transport/bus-route',
    name: 'Bus Route',
    element: BusRoute,
  },
  {
    path: '/transport/bus-stop',
    name: 'Bus Stop',
    element: BusStop,
  },
  {
    path: '/transport/assign-student-wise',
    name: 'Students Wise',
    element: AssignStudentWise,
  },
  {
    path: '/transport/assign-class-wise',
    name: 'Class Wise',
    element: AssignClassWise,
  },
  { path: '/import', name: 'Import', element: Cards, exact: true },
  {
    path: '/import/students',
    name: 'Student Import',
    element: StudentImport,
  },
]

export default routes
