import React, { useState, useEffect, useRef } from 'react'
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
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilUser,
  cilEducation,
  cilPaperclip,
  cilSend,
  cilCheckAlt,
  cilX,
} from '@coreui/icons'
import notificationApi from 'src/api/notificationApi'
import masterApi from 'src/api/masterApi'
import teacherManagementApi from 'src/api/teacherManagementApi'

// ─── Checkbox Dropdown ────────────────────────────────────────────────────────
const CheckboxDropdown = ({ label, items, selected, onToggle, onSelectAll, allLabel = 'All' }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allSelected = items.length > 0 && selected.length === items.length
  const someSelected = selected.length > 0 && !allSelected

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '6px 12px', border: '1px solid #ced4da',
          borderRadius: 6, background: '#fff', textAlign: 'left', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 14,
        }}
      >
        <span>
          {someSelected || allSelected
            ? allSelected ? allLabel : `${selected.length} selected`
            : label}
        </span>
        <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', zIndex: 1000, width: '100%', maxHeight: 280,
          overflowY: 'auto', background: '#fff', border: '1px solid #ced4da',
          borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,.12)', top: '110%',
        }}>
          {/* Select All row */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            cursor: 'pointer', fontWeight: 600,
            borderBottom: '1px solid #f0f0f0',
            background: allSelected ? '#e8f5e9' : 'transparent',
          }}>
            <input type="checkbox" checked={allSelected} onChange={onSelectAll} />
            {allLabel}
          </label>
          {items.map(item => (
            <label key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
              cursor: 'pointer',
              background: selected.includes(item.id) ? '#f0f4ff' : 'transparent',
            }}>
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              <span style={{ fontSize: 13 }}>{item.label}</span>
            </label>
          ))}
          {items.length === 0 && (
            <div style={{ padding: '12px', color: '#999', fontSize: 13 }}>No items found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Student Checkbox List ────────────────────────────────────────────────────
const StudentCheckList = ({ students, selected, onToggle, onSelectAll }) => {
  const allSelected = students.length > 0 && selected.length === students.length
  return (
    <div style={{
      border: '1px solid #ced4da', borderRadius: 6, maxHeight: 260,
      overflowY: 'auto', background: '#fafafa',
    }}>
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid #e0e0e0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#f5f5f5', position: 'sticky', top: 0, zIndex: 1,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13 }}>
          <input type="checkbox" checked={allSelected} onChange={onSelectAll} />
          Select All ({students.length} students)
        </label>
        <CBadge color="primary">{selected.length} selected</CBadge>
      </div>
      {students.map(s => (
        <label key={s.adm_no} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
          cursor: 'pointer', fontSize: 13,
          background: selected.includes(s.adm_no) ? '#e8f0fe' : 'transparent',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <input
            type="checkbox"
            checked={selected.includes(s.adm_no)}
            onChange={() => onToggle(s.adm_no)}
          />
          <span style={{ flex: 1 }}>{s.name}</span>
          <span style={{ color: '#888', fontSize: 12 }}>{s.class_title} - {s.section_title}</span>
          <span style={{ color: '#aaa', fontSize: 11 }}>#{s.adm_no}</span>
        </label>
      ))}
      {students.length === 0 && (
        <div style={{ padding: 16, color: '#999', fontSize: 13, textAlign: 'center' }}>
          No students loaded
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const NOTIF_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'result', label: 'Result' },
  { value: 'fee', label: 'Fee' },
  { value: 'homework', label: 'Homework' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'document', label: 'Document' },
  { value: 'exam', label: 'Exam' },
  { value: 'event', label: 'Event' },
]

const ATTACH_TYPES = [
  { value: 'none', label: 'No Attachment' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
  { value: 'link', label: 'Link / URL' },
]

const AddNotification = () => {
  // ── Audience ──
  const [audience, setAudience] = useState('all') // 'all' | 'teachers' | 'class'

  // Teacher targeting
  const [teachers, setTeachers] = useState([])
  const [selectedTeachers, setSelectedTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)

  // Class targeting
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(false)

  // ── Category & Template ──
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [templateLoading, setTemplateLoading] = useState(false)

  // ── Compose ──
  const [notifType, setNotifType] = useState('general')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  // ── Attachment ──
  const [attachType, setAttachType] = useState('none')
  const [attachUrl, setAttachUrl] = useState('')
  const [attachName, setAttachName] = useState('')

  // ── UI state ──
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'danger', msg }

  // ─── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    notificationApi.getCategories().then(setCategories).catch(() => {})
    masterApi.getAll('classes').then(res => {
      const list = Array.isArray(res) ? res : res?.results ?? []
      setClasses(list)
    }).catch(() => {})
  }, [])

  // Load teachers when tab switches to 'teachers'
  useEffect(() => {
    if (audience !== 'teachers') return
    if (teachers.length > 0) return
    setTeachersLoading(true)
    teacherManagementApi.getAll({ page_size: 200 })
      .then(res => {
        const list = Array.isArray(res) ? res : res?.results ?? []
        setTeachers(list.map(t => ({
          id: t.emp_code,
          label: `${t.name || t.teacher_name || t.emp_code}`,
        })))
      })
      .catch(() => {})
      .finally(() => setTeachersLoading(false))
  }, [audience])

  // Load sections when class changes
  useEffect(() => {
    if (!selectedClass) { setSections([]); setSelectedSection(''); return }
    masterApi.getAll('sections').then(res => {
      const list = Array.isArray(res) ? res : res?.results ?? []
      setSections(list)
    }).catch(() => {})
    setSelectedSection('')
    setStudents([])
    setSelectedStudents([])
  }, [selectedClass])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAudienceChange = (val) => {
    setAudience(val)
    setSelectedTeachers([])
    setSelectedStudents([])
    setStudents([])
    setSelectedClass('')
    setSelectedSection('')
  }

  const toggleTeacher = (id) => {
    setSelectedTeachers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }
  const selectAllTeachers = () => {
    setSelectedTeachers(
      selectedTeachers.length === teachers.length ? [] : teachers.map(t => t.id)
    )
  }

  const toggleStudent = (adm_no) => {
    setSelectedStudents(prev =>
      prev.includes(adm_no) ? prev.filter(x => x !== adm_no) : [...prev, adm_no]
    )
  }
  const selectAllStudents = () => {
    setSelectedStudents(
      selectedStudents.length === students.length ? [] : students.map(s => s.adm_no)
    )
  }

  const loadStudents = async () => {
    if (!selectedClass) return
    setStudentsLoading(true)
    try {
      const data = await notificationApi.getStudentsByClass(
        selectedClass,
        selectedSection || null,
      )
      setStudents(Array.isArray(data) ? data : [])
      setSelectedStudents([])
    } catch {
      setToast({ type: 'danger', msg: 'Failed to load students.' })
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleCategoryChange = async (catId) => {
    setSelectedCategory(catId)
    if (!catId) return
    const cat = categories.find(c => String(c.id) === String(catId))
    if (!cat?.template_id) return
    setTemplateLoading(true)
    try {
      const preview = await notificationApi.getTemplatePreview(catId)
      if (preview?.template_found) {
        setTitle(preview.title || '')
        setBody(preview.body || '')
      }
    } catch {
      // silently fail
    } finally {
      setTemplateLoading(false)
    }
  }

  // ─── Build payload & send ─────────────────────────────────────────────────
  const buildStudentPayload = () => {
    const base = {
      title,
      body,
      notification_type: notifType,
      category_id: selectedCategory ? Number(selectedCategory) : undefined,
      attachment_type: attachType,
      attachment_url: attachType !== 'none' && attachUrl ? attachUrl : null,
      attachment_name: attachType !== 'none' && attachName ? attachName : null,
    }

    if (audience === 'all') {
      return { ...base, target_type: 'all' }
    }
    if (audience === 'class') {
      if (selectedStudents.length > 0 && selectedStudents.length < students.length) {
        return { ...base, target_type: 'student_list', targets: selectedStudents }
      }
      if (selectedSection) {
        return { ...base, target_type: 'class_list', targets: [{ class_id: Number(selectedClass), section_id: Number(selectedSection) }] }
      }
      return { ...base, target_type: 'class', target_id: String(selectedClass) }
    }
    return null
  }

  const buildTeacherPayload = () => ({
    title,
    body,
    notification_type: notifType,
    category_id: selectedCategory ? Number(selectedCategory) : undefined,
    attachment_type: attachType,
    attachment_url: attachType !== 'none' && attachUrl ? attachUrl : null,
    attachment_name: attachType !== 'none' && attachName ? attachName : null,
    target_type: selectedTeachers.length > 0 && selectedTeachers.length < teachers.length
      ? 'teacher_list'
      : 'all',
    ...(selectedTeachers.length > 0 && selectedTeachers.length < teachers.length
      ? { targets: selectedTeachers }
      : {}),
  })

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setToast({ type: 'danger', msg: 'Title and body are required.' })
      return
    }
    setSending(true)
    setToast(null)
    try {
      if (audience === 'all') {
        await Promise.all([
          notificationApi.sendToStudents(buildStudentPayload()),
          notificationApi.sendToTeachers(buildTeacherPayload()),
        ])
      } else if (audience === 'teachers') {
        await notificationApi.sendToTeachers(buildTeacherPayload())
      } else {
        await notificationApi.sendToStudents(buildStudentPayload())
      }
      setToast({ type: 'success', msg: 'Notification sent successfully!' })
      // reset compose
      setTitle(''); setBody(''); setAttachUrl(''); setAttachName(''); setAttachType('none')
      setSelectedCategory(''); setSelectedStudents([]); setSelectedTeachers([])
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to send notification.'
      setToast({ type: 'danger', msg })
    } finally {
      setSending(false)
    }
  }

  // ─── Derived ──────────────────────────────────────────────────────────────
  const canSend = title.trim() && body.trim() && !sending

  const audienceSummary = () => {
    if (audience === 'all') return 'All Students & Teachers'
    if (audience === 'teachers') {
      if (selectedTeachers.length === 0) return 'Teachers — none selected'
      if (selectedTeachers.length === teachers.length) return 'All Teachers'
      return `${selectedTeachers.length} teacher(s) selected`
    }
    if (audience === 'class') {
      const cls = classes.find(c => String(c.id) === String(selectedClass))
      const sec = sections.find(s => String(s.id) === String(selectedSection))
      if (!cls) return 'Class — not selected'
      let base = cls.title
      if (sec) base += ` - ${sec.title}`
      if (selectedStudents.length > 0) base += ` (${selectedStudents.length} students)`
      return base
    }
    return ''
  }

  // ─── Styles ───────────────────────────────────────────────────────────────
  const tabStyle = (active) => ({
    flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', fontWeight: 600,
    fontSize: 13, borderRadius: 8, transition: 'all .2s',
    background: active ? '#321fdb' : '#f0f2f5',
    color: active ? '#fff' : '#555',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  })

  const sectionLabel = { fontWeight: 600, fontSize: 13, color: '#444', marginBottom: 4 }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4" style={{ borderRadius: 12, boxShadow: '0 2px 16px rgba(50,31,219,.07)' }}>
          <CCardHeader style={{ background: 'linear-gradient(135deg,#321fdb 0%,#5b51e8 100%)', color: '#fff', borderRadius: '12px 12px 0 0', padding: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CIcon icon={cilSend} style={{ fontSize: 20 }} />
              <strong style={{ fontSize: 17 }}>Send Notification</strong>
            </div>
            <div style={{ fontSize: 13, opacity: .8, marginTop: 2 }}>{audienceSummary()}</div>
          </CCardHeader>

          <CCardBody style={{ padding: '24px' }}>
            {toast && (
              <CAlert color={toast.type} dismissible onClose={() => setToast(null)} style={{ marginBottom: 20 }}>
                {toast.msg}
              </CAlert>
            )}

            <CForm>

              {/* ── Step 1: Audience ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={sectionLabel}>
                  <CBadge color="primary" style={{ marginRight: 8 }}>1</CBadge>
                  Select Audience
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" style={tabStyle(audience === 'all')} onClick={() => handleAudienceChange('all')}>
                    <CIcon icon={cilPeople} /> All
                  </button>
                  <button type="button" style={tabStyle(audience === 'teachers')} onClick={() => handleAudienceChange('teachers')}>
                    <CIcon icon={cilUser} /> Teachers
                  </button>
                  <button type="button" style={tabStyle(audience === 'class')} onClick={() => handleAudienceChange('class')}>
                    <CIcon icon={cilEducation} /> Class
                  </button>
                </div>

                {/* Teachers sub-picker */}
                {audience === 'teachers' && (
                  <div style={{ marginTop: 14 }}>
                    <CFormLabel style={sectionLabel}>Select Teachers</CFormLabel>
                    {teachersLoading
                      ? <div style={{ padding: 8 }}><CSpinner size="sm" /> Loading teachers…</div>
                      : <CheckboxDropdown
                          label="Choose teachers…"
                          items={teachers}
                          selected={selectedTeachers}
                          onToggle={toggleTeacher}
                          onSelectAll={selectAllTeachers}
                          allLabel="All Teachers"
                        />
                    }
                  </div>
                )}

                {/* Class sub-picker */}
                {audience === 'class' && (
                  <div style={{ marginTop: 14 }}>
                    <CRow className="g-3">
                      <CCol md={4}>
                        <CFormLabel style={sectionLabel}>Class</CFormLabel>
                        <CFormSelect
                          value={selectedClass}
                          onChange={e => { setSelectedClass(e.target.value); setStudents([]); setSelectedStudents([]) }}
                        >
                          <option value="">Select class…</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel style={sectionLabel}>Section</CFormLabel>
                        <CFormSelect
                          value={selectedSection}
                          onChange={e => { setSelectedSection(e.target.value); setStudents([]); setSelectedStudents([]) }}
                          disabled={!selectedClass}
                        >
                          <option value="">All Sections</option>
                          {sections.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      <CCol md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <CButton
                          color="primary"
                          variant="outline"
                          onClick={loadStudents}
                          disabled={!selectedClass || studentsLoading}
                          style={{ width: '100%' }}
                        >
                          {studentsLoading ? <><CSpinner size="sm" /> Loading…</> : 'Load Students'}
                        </CButton>
                      </CCol>
                    </CRow>

                    {students.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        <StudentCheckList
                          students={students}
                          selected={selectedStudents}
                          onToggle={toggleStudent}
                          onSelectAll={selectAllStudents}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <hr style={{ borderColor: '#f0f0f0', margin: '0 0 24px' }} />

              {/* ── Step 2: Type & Category ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={sectionLabel}>
                  <CBadge color="primary" style={{ marginRight: 8 }}>2</CBadge>
                  Notification Type & Category
                </div>
                <CRow className="g-3" style={{ marginTop: 4 }}>
                  <CCol md={6}>
                    <CFormLabel>Notification Type</CFormLabel>
                    <CFormSelect value={notifType} onChange={e => setNotifType(e.target.value)}>
                      {NOTIF_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormLabel>
                      Category
                      {templateLoading && <CSpinner size="sm" style={{ marginLeft: 8 }} />}
                    </CFormLabel>
                    <CFormSelect value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>
                      <option value="">Select category…</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </CFormSelect>
                    {selectedCategory && categories.find(c => String(c.id) === String(selectedCategory))?.template_id && (
                      <small style={{ color: '#321fdb', fontSize: 11, marginTop: 3, display: 'block' }}>
                        ✓ Template auto-fetched — title &amp; body pre-filled
                      </small>
                    )}
                  </CCol>
                </CRow>
              </div>

              <hr style={{ borderColor: '#f0f0f0', margin: '0 0 24px' }} />

              {/* ── Step 3: Compose ── */}
              <div style={{ marginBottom: 24 }}>
                <div style={sectionLabel}>
                  <CBadge color="primary" style={{ marginRight: 8 }}>3</CBadge>
                  Compose Message
                </div>
                <CRow className="g-3" style={{ marginTop: 4 }}>
                  <CCol md={12}>
                    <CFormLabel>Title *</CFormLabel>
                    <CFormInput
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Notification title…"
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormLabel>Body *</CFormLabel>
                    <CFormTextarea
                      rows={5}
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      placeholder="Notification message body…"
                      style={{ resize: 'vertical' }}
                    />
                  </CCol>
                </CRow>
              </div>

              <hr style={{ borderColor: '#f0f0f0', margin: '0 0 24px' }} />

              {/* ── Step 4: Attachment ── */}
              <div style={{ marginBottom: 28 }}>
                <div style={sectionLabel}>
                  <CBadge color="primary" style={{ marginRight: 8 }}>4</CBadge>
                  <CIcon icon={cilPaperclip} style={{ marginRight: 4 }} />
                  Attachment (optional)
                </div>
                <CRow className="g-3" style={{ marginTop: 4 }}>
                  <CCol md={4}>
                    <CFormLabel>Attachment Type</CFormLabel>
                    <CFormSelect value={attachType} onChange={e => { setAttachType(e.target.value); setAttachUrl(''); setAttachName('') }}>
                      {ATTACH_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  {attachType !== 'none' && (
                    <>
                      <CCol md={5}>
                        <CFormLabel>Attachment URL</CFormLabel>
                        <CFormInput
                          value={attachUrl}
                          onChange={e => setAttachUrl(e.target.value)}
                          placeholder="https://…"
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Display Name</CFormLabel>
                        <CFormInput
                          value={attachName}
                          onChange={e => setAttachName(e.target.value)}
                          placeholder="e.g. Exam_Schedule.pdf"
                        />
                      </CCol>
                    </>
                  )}
                </CRow>
              </div>

              {/* ── Send ── */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <CButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!canSend}
                  style={{ padding: '10px 32px', fontWeight: 600, fontSize: 15 }}
                >
                  {sending
                    ? <><CSpinner size="sm" style={{ marginRight: 8 }} /> Sending…</>
                    : <><CIcon icon={cilSend} style={{ marginRight: 8 }} /> Send Notification</>
                  }
                </CButton>
                {!title.trim() || !body.trim()
                  ? <small style={{ color: '#dc3545' }}>Title and body are required</small>
                  : null
                }
              </div>

            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddNotification
