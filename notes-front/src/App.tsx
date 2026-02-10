import { useState } from 'react'
import { AuthProvider, useAuth } from './store/authContext'
import { NotesProvider, useNotes } from './store/notesContext'
import Layout from './components/Layout/Layout'
import NoteGrid from './components/NoteGrid/NoteGrid'
import NoteEditor from './components/NoteEditor/NoteEditor'
import AuthPage from './components/Auth/AuthPage'
import type { Note, NoteColor } from './types'

function NotesApp() {
  const { filteredNotes, addNote, editNote, removeNote } = useNotes()
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

  const handleDelete = async (id: string) => {
    await removeNote(id)
  }

  const handleSave = async (data: { title: string; content: string; color: NoteColor }) => {
    if (editingNote) {
      await editNote(editingNote.id, data)
    } else {
      await addNote(data)
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

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <NotesProvider>
      <NotesApp />
    </NotesProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
