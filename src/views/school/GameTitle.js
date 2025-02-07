import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { DocsComponents, DocsExample } from 'src/components'

const initialGame = [
  { id: 1, name: 'Cricket', sequence: 5 },
  { id: 2, name: 'Hockey', sequence: 5 },
]

const GameTitle = () => {
  const [gameName, setGameName] = useState('')
  const [sequence, setSequence] = useState('')

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [sequenceTerm, setSequenceFilter] = useState('All')

  const [games, setGames] = useState(initialGame)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!gameName || !sequence) return

    const newClass = {
      id: games.length + 1,
      name: gameName,
      sequence: parseInt(sequence),
    }

    setGames([...games, newClass])
    setGameName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    alert(`Edit class with ID: ${id}`)
  }

  const filteredClasses = games.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSequence = sequenceTerm === 'All' || cls.sequence.toString() === sequenceTerm
    return matchesSearch && matchesSequence
  })

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Game Title</strong>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput1">Game Name</CFormLabel>
                <CFormInput type="text" id="exampleFormControlInput1" placeholder="Game Name" />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="exampleFormControlInput2">Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  id="exampleFormControlInput2"
                  placeholder="Sequence Number"
                />
              </div>
              <div>
                <CButton color="success">Add Game</CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Classes</strong>
              <CFormInput
                className="mt-2 mb-2"
                type="text"
                placeholder="Search by Game name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">Game Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sequence</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filteredClasses.map((cls) => (
                    <CTableRow>
                      <CTableDataCell>{cls.name}</CTableDataCell>
                      <CTableDataCell>{cls.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(cls.id)}>
                          Edit
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {filteredClasses.length === 0 && (
                    <CTableRow>
                      <CTableDataCell>No records found.</CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CRow>
  )
}

export default GameTitle
