import { useState } from 'react'
import { toast } from 'sonner'
import { AuthProvider, useAuth } from './store/authContext'
import { NotesProvider, useNotes } from './store/notesContext'
import Layout from './components/Layout/Layout'
import NoteGrid from './components/NoteGrid/NoteGrid'
import NoteEditor from './components/NoteEditor/NoteEditor'
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog'
import ProfileModal from './components/Profile/ProfileModal'
import AuthPage from './components/Auth/AuthPage'
import type { Note, NoteColor } from './types'

function NotesApp() {
  const { state, filteredNotes, addNote, editNote, toggleFavorite, removeNote } = useNotes()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleAddNote = () => {
    setEditingNote(null)
    setEditorOpen(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setEditorOpen(true)
  }

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await removeNote(deleteTarget)
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    }
    setDeleteTarget(null)
  }

  const handleSave = async (data: { title: string; content: string; color: NoteColor }) => {
    try {
      if (editingNote) {
        await editNote(editingNote.id, data)
        toast.success('Note updated')
      } else {
        await addNote(data)
        toast.success('Note created')
      }
    } catch {
      toast.error('Failed to save note')
    }
  }

  return (
    <>
      <Layout onAddNote={handleAddNote} onOpenProfile={() => setProfileOpen(true)}>
        <NoteGrid
          notes={filteredNotes}
          isLoading={state.isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onToggleFavorite={toggleFavorite}
        />
      </Layout>
      <NoteEditor
        note={editingNote}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
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
