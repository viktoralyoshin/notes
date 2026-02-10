import { useState } from 'react'
import { NotesProvider, useNotes } from './store/notesContext'
import Layout from './components/Layout/Layout'
import NoteGrid from './components/NoteGrid/NoteGrid'
import NoteEditor from './components/NoteEditor/NoteEditor'
import type { Note, NoteColor } from './types'

function NotesApp() {
  const { filteredNotes, dispatch } = useNotes()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleAddNote = () => {
    setEditingNote(null)
    setEditorOpen(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id })
  }

  const handleSave = (data: { title: string; content: string; color: NoteColor }) => {
    const now = new Date().toISOString().split('T')[0]

    if (editingNote) {
      dispatch({
        type: 'UPDATE_NOTE',
        payload: {
          ...editingNote,
          ...data,
          updatedAt: now,
        },
      })
    } else {
      dispatch({
        type: 'ADD_NOTE',
        payload: {
          id: crypto.randomUUID(),
          ...data,
          createdAt: now,
          updatedAt: now,
        },
      })
    }
  }

  return (
    <>
      <Layout onAddNote={handleAddNote}>
        <NoteGrid
          notes={filteredNotes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Layout>
      <NoteEditor
        note={editingNote}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </>
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
