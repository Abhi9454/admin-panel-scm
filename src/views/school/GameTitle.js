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
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import apiService from '../../api/schoolManagementApi'

const GameTitle = () => {
  const [gameName, setGameName] = useState('')
  const [sequence, setSequence] = useState('')
  const [games, setGames] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const data = await apiService.getAll('game/all')
      setGames(data)
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!gameName || !sequence) return

    const newGame = { name: gameName, sequenceNumber: parseInt(sequence) }

    try {
      if (editingId !== null) {
        await apiService.update('game/update', editingId, newGame)
        setEditingId(null)
      } else {
        await apiService.create('game/add', newGame)
      }
      await fetchGames()
      handleClear()
    } catch (error) {
      console.error('Error saving game:', error)
    }
  }

  const handleEdit = (id) => {
    const gameToEdit = games.find((game) => game.id === id)
    if (gameToEdit) {
      setGameName(gameToEdit.name)
      setSequence(gameToEdit.sequenceNumber.toString())
      setEditingId(id)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiService.delete(`game/delete/${id}`)
      fetchGames()
    } catch (error) {
      console.error('Error deleting game:', error)
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
                    <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {games.map((game) => (
                    <CTableRow key={game.id}>
                      <CTableDataCell>{game.name}</CTableDataCell>
                      <CTableDataCell>{game.sequenceNumber}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" className="me-2" onClick={() => handleEdit(game.id)}>
                          Edit
                        </CButton>
                        <CButton color="danger" onClick={() => handleDelete(game.id)}>
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
    </CRow>
  )
}

export default GameTitle
