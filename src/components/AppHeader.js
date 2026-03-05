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
import schoolManagementApi from 'src/api/schoolManagementApi'
import { SessionContext } from 'src/context/SessionContext'

const AppHeader = () => {
  const headerRef = useRef()
  const [sessions, setSessions] = useState([])
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { sessionId, setCurrentSession } = useContext(SessionContext)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
    fetchSessions()
  }, [])

  /**
   * Fetch all sessions from the public endpoint.
   * If no session is already cached, auto-select the one flagged is_active.
   */
  const fetchSessions = async () => {
    try {
      const data = await schoolManagementApi.getSchoolDetailSession()
      const list = data.sessions || []
      setSessions(list)

      // Only auto-select if nothing is cached yet
      const cached = localStorage.getItem('session_id')
      if (!cached) {
        const active = list.find((s) => s.is_active)
        if (active) {
          setCurrentSession(active.rec_id, active.session)
        } else if (list.length > 0) {
          // Fallback: pick the first session
          setCurrentSession(list[0].rec_id, list[0].session)
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const handleSessionChange = (e) => {
    const recId = e.target.value
    const found = sessions.find((s) => String(s.rec_id) === recId)
    if (found) {
      setCurrentSession(found.rec_id, found.session)
    }
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderNav className="d-none d-md-flex">
          <CCol>
            <div className="fw-bold d-inline-block h4">Springer High School, Punjab</div>
          </CCol>
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          <CNavItem>
            <CFormSelect
              id="sessionId"
              onChange={handleSessionChange}
              value={sessionId}
              style={{ minWidth: '130px' }}
            >
              {sessions.length === 0 && (
                <option value="">Loading sessions...</option>
              )}
              {sessions.map((s) => (
                <option key={s.rec_id} value={String(s.rec_id)}>
                  {s.session}{s.is_active ? ' ★' : ''}
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
