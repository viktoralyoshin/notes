import { NotesProvider, useNotes } from './store/notesContext'
import Layout from './components/Layout/Layout'
import NoteGrid from './components/NoteGrid/NoteGrid'
import type { Note } from './types'

function NotesApp() {
  const { filteredNotes, dispatch } = useNotes()

  const handleAddNote = () => {
    // TODO: implement note creation modal
  }

  const handleEdit = (_note: Note) => {
    // TODO: implement note editing modal
  }

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id })
  }

  return (
    <Layout onAddNote={handleAddNote}>
      <NoteGrid
        notes={filteredNotes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Layout>
  )
}

function App() {
  return (
    <NotesProvider>
      <NotesApp />
    </NotesProvider>
  )
}

export default App
