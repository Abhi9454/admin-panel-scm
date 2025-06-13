import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CNavLink,
  CNavItem,
  useColorModes,
  CCol,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilContrast, cilMoon, cilSun } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import apiService from 'src/api/schoolManagementApi'
import { SessionContext } from 'src/context/SessionContext'

const AppHeader = () => {
  const headerRef = useRef()
  const [sessions, setSessions] = useState([])
  const [defaultSession, setDefaultSession] = useState('')
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { setSession } = useContext(SessionContext)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
    fetchInitialData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(value)
    setDefaultSession(value)
    setSession(value)
  }

  const fetchInitialData = async () => {
    try {
      const [sessionData, defaultSessionData] = await Promise.all([
        apiService.getAll('session/all'),
        apiService.getAll('school-detail/session'),
      ])
      setSessions(sessionData)
      setDefaultSession(defaultSessionData)
      localStorage.setItem('session', defaultSessionData)
      setSession(defaultSessionData)
    } catch (error) {
      console.error('Error fetching initial data:', error)
    }
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        {/*<CHeaderToggler*/}
        {/*  onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}*/}
        {/*  style={{ marginInlineStart: '-14px' }}*/}
        {/*>*/}
        {/*  <CIcon icon={cilMenu} size="lg" />*/}
        {/*</CHeaderToggler>*/}
        <CHeaderNav className="d-none d-md-flex">
          <CCol>
            <div className="fw-bold d-inline-block h4">Springer High School, Punjab</div>
          </CCol>
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          <CNavItem>
            <CFormSelect id="sessionId" onChange={handleChange} value={defaultSession}>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </CFormSelect>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
