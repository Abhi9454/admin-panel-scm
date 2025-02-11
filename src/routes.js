import React from 'react'

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

//Notifications
const AllNotification = React.lazy(() => import('./views/notification/AllNotification'))
const AddNotification = React.lazy(() => import('./views/notification/AddNotification'))

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
  { path: '/school', name: 'School', element: Cards, exact: true },
  { path: '/school/class-title', name: 'Class Title', element: ClassTitle },
  { path: '/school/bus-title', name: 'Bus Title', element: BusTitle },
  { path: '/school/city-title', name: 'City Title', element: CityTitle },
  { path: '/school/game-title', name: 'Game Title', element: GameTitle },
  { path: '/school/hostel-title', name: 'Hostel Title', element: HostelTitle },
  { path: '/school/section-title', name: 'Section Title', element: SectionTitle },
  { path: '/school/group-title', name: 'Group Title', element: GroupTitle },
  { path: '/school/house-title', name: 'House Title', element: HouseTitle },
  { path: '/school/parent-profession', name: 'Parent Profession', element: ParentProfession },
  { path: '/school/job-department', name: 'Job Department', element: JobDepartment },
  { path: '/school/job-designation', name: 'Job Designation', element: JobDesignation },
  { path: '/school/state-title', name: 'State Title', element: StateTitle },
  { path: '/school/school-detail', name: 'School Detail', element: SchoolDetail },
  { path: '/student', name: 'Student', element: Cards, exact: true },
  { path: '/student/all-students', name: 'All Student', element: AllStudent },
  { path: '/student/add-student', name: 'Add Student', element: AddStudent },
  { path: '/student/edit-student', name: 'Edit Student', element: EditStudent },
  { path: '/student/left-student', name: 'Student Left Date', element: LeftStudent },
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

  { path: '/notifications', name: 'Notifications', element: Cards, exact: true },
  { path: '/notifications/all-notification', name: 'All Notifications', element: AllNotification },
  { path: '/notifications/add-notification', name: 'Add Notifications', element: AddNotification },
]

export default routes
