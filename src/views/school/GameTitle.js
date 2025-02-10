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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'

const initialGame = [
  { id: 1, name: 'Cricket', sequence: 5 },
  { id: 2, name: 'Hockey', sequence: 5 },
]

const GameTitle = () => {
  const [gameName, setGameName] = useState('')
  const [sequence, setSequence] = useState('')
  const [games, setGames] = useState(initialGame)
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!gameName || !sequence) return

    if (editingId !== null) {
      setGames(
        games.map((game) =>
          game.id === editingId ? { id: editingId, name: gameName, sequence: parseInt(sequence) } : game
        )
      )
      setEditingId(null)
    } else {
      const newGame = {
        id: games.length + 1,
        name: gameName,
        sequence: parseInt(sequence),
      }
      setGames([...games, newGame])
    }

    setGameName('')
    setSequence('')
  }

  const handleEdit = (id) => {
    const gameToEdit = games.find((game) => game.id === id)
    if (gameToEdit) {
      setGameName(gameToEdit.name)
      setSequence(gameToEdit.sequence.toString())
      setEditingId(id)
    }
  }

  const handleClear = () => {
    setGameName('')
    setSequence('')
    setEditingId(null)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editingId ? 'Edit Game' : 'Add New Game'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <CFormLabel htmlFor="gameName">Game Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="gameName"
                  placeholder="Enter Game Name"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <CFormLabel htmlFor="sequence">Sequence Number</CFormLabel>
                <CFormInput
                  type="number"
                  id="sequence"
                  placeholder="Enter Sequence Number"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                />
              </div>
              <CButton color={editingId ? 'warning' : 'success'} type="submit">
                {editingId ? 'Update Game' : 'Add Game'}
              </CButton>
              {editingId && (
                <CButton color="secondary" className="ms-2" onClick={handleClear}>
                  Clear
                </CButton>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All Games</strong>
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
                  {games.map((game) => (
                    <CTableRow key={game.id}>
                      <CTableDataCell>{game.name}</CTableDataCell>
                      <CTableDataCell>{game.sequence}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => handleEdit(game.id)}>
                          Edit
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
    </CRow>
  )
}

export default GameTitle
