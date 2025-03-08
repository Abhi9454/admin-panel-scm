import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormSelect,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi' // API service import
import receiptManagementApi from '../../api/receiptManagementApi'

const FeesClassMaster = () => {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [feesClasses, setFeesClasses] = useState([])
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [groups, setGroups] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchClasses()
    fetchSections()
    fetchGroups()
    fetchFeesClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await apiService.getAll('class/all')
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchSections = async () => {
    try {
      const data = await apiService.getAll('section/all')
      setSections(data)
    } catch (error) {
      console.error('Error fetching sections:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const data = await apiService.getAll('group/all')
      setGroups(data)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }
  const fetchFeesClasses = async () => {
    try {
      const data = await receiptManagementApi.getAll('fee-class-master/all')
      console.log('Data :', data)
      setFeesClasses(data)
    } catch (error) {
      console.error('Error fetching fees classes:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedClass || !selectedSection || !selectedGroup) return

    const newFeesClass = {
      classEntityId: parseInt(selectedClass),
      sectionEntityId: parseInt(selectedSection),
      groupEntityId: parseInt(selectedGroup),
    }

    try {
      if (editingId !== null) {
        await receiptManagementApi.update('fee-class-master', editingId, newFeesClass)
        setEditingId(null)
      } else {
        console.log('Data :', newFeesClass)
        await receiptManagementApi.create('fee-class-master/add', newFeesClass)
      }
      await fetchFeesClasses()
      handleClear()
    } catch (error) {
      console.error('Error saving fees class:', error)
    }
  }

  const handleEdit = (id) => {
    const feesClassToEdit = feesClasses.find((fc) => fc.id === id)
    if (feesClassToEdit) {
      setSelectedClass(feesClassToEdit.classId)
      setSelectedSection(feesClassToEdit.sectionId)
      setSelectedGroup(feesClassToEdit.groupId)
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record?')
    if (!confirmDelete) return
    try {
      await receiptManagementApi.delete(`fee-class-master/${id}`)
      fetchFeesClasses()
    } catch (error) {
      console.error('Error deleting fees class:', error)
    }
  }

  const handleClear = () => {
    setSelectedClass('')
    setSelectedSection('')
    setSelectedGroup('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Fees Class Master' : 'Add New Fees Class Master'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="class">Class</CFormLabel>
                <CFormSelect
                  id="class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="section">Section</CFormLabel>
                <CFormSelect
                  id="section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="group">Group</CFormLabel>
                <CFormSelect
                  id="group"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Select Group</option>
                  {groups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Fees Class ' : 'Add Fees Class'}
              </CButton>
              <CButton color="secondary" className="ms-2" onClick={handleClear}>
                Clear
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All Fees Class Master</strong>
          </CCardHeader>
          <CCardBody>
            <CTable hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Class</CTableHeaderCell>
                  <CTableHeaderCell>Section</CTableHeaderCell>
                  <CTableHeaderCell>Group</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {feesClasses.map((fc) => (
                  <CTableRow key={fc.id}>
                    <CTableDataCell>{fc.classEntity?.name}</CTableDataCell>
                    <CTableDataCell>{fc.section?.name}</CTableDataCell>
                    <CTableDataCell>{fc.group?.name}</CTableDataCell>
                    <CTableDataCell>
                      <CButton color="warning" className="me-2" onClick={() => handleEdit(fc.id)}>
                        Edit
                      </CButton>
                      <CButton color="danger" onClick={() => handleDelete(fc.id)}>
                        Delete
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FeesClassMaster
