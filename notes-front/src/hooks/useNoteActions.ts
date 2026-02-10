import { useNotes } from '../store/notesContext'
import type { NoteColor } from '../types'

export function useNoteActions() {
  const { state, dispatch } = useNotes()

  const addNote = (title: string, content: string, color: NoteColor) => {
    const now = new Date().toISOString().split('T')[0]
    dispatch({
      type: 'ADD_NOTE',
      payload: {
        id: crypto.randomUUID(),
        title,
        content,
        color,
        createdAt: now,
        updatedAt: now,
      },
    })
  }

  const updateNote = (id: string, updates: { title?: string; content?: string; color?: NoteColor }) => {
    const existing = state.notes.find((n) => n.id === id)
    if (!existing) return

    dispatch({
      type: 'UPDATE_NOTE',
      payload: {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    })
  }

  const deleteNote = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id })
  }

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }

  const setActiveColor = (color: NoteColor | null) => {
    dispatch({ type: 'SET_ACTIVE_COLOR', payload: color })
  }

  return { addNote, updateNote, deleteNote, setSearchQuery, setActiveColor }
}
