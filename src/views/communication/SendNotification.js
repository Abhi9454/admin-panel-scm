import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
  CAlert,
} from '@coreui/react'
import masterApi from '../../api/masterApi'
import notificationApi from '../../api/notificationApi'

const SendNotification = () => {
  const [audienceType, setAudienceType] = useState('students') // 'students' | 'teachers'
  const [targetType, setTargetType] = useState('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [notificationType, setNotificationType] = useState('general')
  const [targetId, setTargetId] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false)
  const [dropdownLoading, setDropdownLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchDropdowns()
  }, [])

  // Reset targetType when audience changes
  useEffect(() => {
    setTargetType(audienceType === 'students' ? 'all' : 'all_teachers')
    setTargetId('')
  }, [audienceType])

  // Reset targetId when targetType changes
  useEffect(() => {
    setTargetId('')
  }, [targetType])

  const fetchDropdowns = async () => {
    try {
      const [classData, sectionData] = await Promise.all([
        masterApi.getAll('classes'),
        masterApi.getAll('sections'),
      ])
      setClasses(classData.results || [])
      setSections(sectionData.results || [])
    } catch (error) {
      console.error('Error fetching dropdowns:', error)
    } finally {
      setDropdownLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !body) return

    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    const needsTargetId =
      (audienceType === 'students' && ['class', 'section', 'student'].includes(targetType)) ||
      (audienceType === 'teachers' && targetType === 'teacher')

    if (needsTargetId && !targetId) {
      setErrorMsg('Please provide a target ID for the selected target type.')
      setLoading(false)
      return
    }

    try {
      const payload = {
        title,
        body,
        notification_type: notificationType,
        target_type: targetType,
      }

      if (needsTargetId) {
        payload.target_id = targetId
      }

      if (audienceType === 'students') {
        if (attachment) {
          const formData = new FormData()
          Object.entries(payload).forEach(([k, v]) => formData.append(k, v))
          formData.append('attachment', attachment)
          await notificationApi.sendToStudents(formData)
        } else {
          await notificationApi.sendToStudents(payload)
        }
      } else {
        await notificationApi.sendToTeachers(payload)
      }

      setSuccessMsg('Notification sent successfully!')
      handleClear()
    } catch (error) {
      console.error('Error sending notification:', error)
      setErrorMsg(error?.response?.data?.detail || 'Failed to send notification. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setTitle('')
    setBody('')
    setNotificationType('general')
    setTargetId('')
    setAttachment(null)
    // Reset file input
    const fileInput = document.getElementById('notifAttachment')
    if (fileInput) fileInput.value = ''
  }

  const studentTargetOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'class', label: 'By Class' },
    { value: 'section', label: 'By Section' },
    { value: 'student', label: 'Specific Student' },
  ]

  const teacherTargetOptions = [
    { value: 'all_teachers', label: 'All Teachers' },
    { value: 'teacher', label: 'Specific Teacher' },
  ]

  const targetOptions = audienceType === 'students' ? studentTargetOptions : teacherTargetOptions

  const renderTargetIdField = () => {
    if (audienceType === 'students') {
      if (targetType === 'class') {
        return (
          <div className="mb-3">
            <CFormLabel htmlFor="targetClass">Select Class</CFormLabel>
            {dropdownLoading ? (
              <CSpinner size="sm" />
            ) : (
              <CFormSelect
                id="targetClass"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title}
                  </option>
                ))}
              </CFormSelect>
            )}
          </div>
        )
      }
      if (targetType === 'section') {
        return (
          <div className="mb-3">
            <CFormLabel htmlFor="targetSection">Select Section</CFormLabel>
            {dropdownLoading ? (
              <CSpinner size="sm" />
            ) : (
              <CFormSelect
                id="targetSection"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              >
                <option value="">-- Select Section --</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
              </CFormSelect>
            )}
          </div>
        )
      }
      if (targetType === 'student') {
        return (
          <div className="mb-3">
            <CFormLabel htmlFor="targetAdmNo">Admission Number</CFormLabel>
            <CFormInput
              type="text"
              id="targetAdmNo"
              placeholder="Enter student admission number"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          </div>
        )
      }
    }

    if (audienceType === 'teachers' && targetType === 'teacher') {
      return (
        <div className="mb-3">
          <CFormLabel htmlFor="targetEmpCode">Employee Code</CFormLabel>
          <CFormInput
            type="text"
            id="targetEmpCode"
            placeholder="Enter teacher employee code"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
        </div>
      )
    }

    return null
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Send Notification</strong>
          </CCardHeader>
          <CCardBody>
            {successMsg && (
              <CAlert color="success" dismissible onClose={() => setSuccessMsg('')}>
                {successMsg}
              </CAlert>
            )}
            {errorMsg && (
              <CAlert color="danger" dismissible onClose={() => setErrorMsg('')}>
                {errorMsg}
              </CAlert>
            )}

            <CForm onSubmit={handleSubmit}>
              {/* Audience Toggle */}
              <div className="mb-3">
                <CFormLabel>Send To</CFormLabel>
                <div className="d-flex gap-3">
                  <CButton
                    color={audienceType === 'students' ? 'primary' : 'outline-secondary'}
                    type="button"
                    onClick={() => setAudienceType('students')}
                  >
                    Students
                  </CButton>
                  <CButton
                    color={audienceType === 'teachers' ? 'primary' : 'outline-secondary'}
                    type="button"
                    onClick={() => setAudienceType('teachers')}
                  >
                    Teachers
                  </CButton>
                </div>
              </div>

              {/* Target Type */}
              <div className="mb-3">
                <CFormLabel htmlFor="targetType">Target</CFormLabel>
                <CFormSelect
                  id="targetType"
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                >
                  {targetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </CFormSelect>
              </div>

              {/* Dynamic Target ID Field */}
              {renderTargetIdField()}

              {/* Notification Type */}
              <div className="mb-3">
                <CFormLabel htmlFor="notificationType">Notification Type</CFormLabel>
                <CFormSelect
                  id="notificationType"
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="fee_reminder">Fee Reminder</option>
                  <option value="event">Event</option>
                  <option value="emergency">Emergency</option>
                </CFormSelect>
              </div>

              {/* Title */}
              <div className="mb-3">
                <CFormLabel htmlFor="notifTitle">Title</CFormLabel>
                <CFormInput
                  type="text"
                  id="notifTitle"
                  placeholder="Enter notification title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Body */}
              <div className="mb-3">
                <CFormLabel htmlFor="notifBody">Message</CFormLabel>
                <CFormTextarea
                  id="notifBody"
                  rows={4}
                  placeholder="Enter notification message"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              {/* Attachment (students only) */}
              {audienceType === 'students' && (
                <div className="mb-3">
                  <CFormLabel htmlFor="notifAttachment">Attachment (optional)</CFormLabel>
                  <CFormInput
                    type="file"
                    id="notifAttachment"
                    onChange={(e) => setAttachment(e.target.files[0] || null)}
                  />
                </div>
              )}

              <div className="d-flex gap-2">
                <CButton color="primary" type="submit" disabled={loading}>
                  {loading ? <CSpinner size="sm" className="me-1" /> : null}
                  {loading ? 'Sending...' : 'Send Notification'}
                </CButton>
                <CButton color="secondary" type="button" onClick={handleClear} disabled={loading}>
                  Clear
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SendNotification
