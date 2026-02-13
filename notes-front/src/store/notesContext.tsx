import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { Note, NoteColor, SortOption } from '../types'
import * as notesApi from '../api/notes'

// --- State ---

interface NotesState {
  notes: Note[]
  searchQuery: string
  activeColor: NoteColor | null
  activeFolderId: string | null
  showFavorites: boolean
  sortBy: SortOption
  isLoading: boolean
}

const initialState: NotesState = {
  notes: [],
  searchQuery: '',
  activeColor: null,
  activeFolderId: null,
  showFavorites: false,
  sortBy: 'manual',
  isLoading: true,
}

// --- Actions ---

type NotesAction =
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'REORDER_NOTES'; payload: Note[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_COLOR'; payload: NoteColor | null }
  | { type: 'SET_ACTIVE_FOLDER'; payload: string | null }
  | { type: 'TOGGLE_FAVORITES' }
  | { type: 'SET_SORT'; payload: SortOption }
  | { type: 'SET_LOADING'; payload: boolean }

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.payload, isLoading: false }
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] }
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? action.payload : n
        ),
      }
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
      }
    case 'REORDER_NOTES':
      return { ...state, notes: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_ACTIVE_COLOR':
      return { ...state, activeColor: action.payload }
    case 'SET_ACTIVE_FOLDER':
      return { ...state, activeFolderId: action.payload }
    case 'TOGGLE_FAVORITES':
      return { ...state, showFavorites: !state.showFavorites }
    case 'SET_SORT':
      return { ...state, sortBy: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

// --- Context ---

interface NotesContextValue {
  state: NotesState
  dispatch: React.Dispatch<NotesAction>
  filteredNotes: Note[]
  loadNotes: () => Promise<void>
  addNote: (input: { title: string; content: string; color: NoteColor; folderId?: string | null }) => Promise<void>
  editNote: (id: string, input: { title?: string; content?: string; color?: NoteColor; folderId?: string | null }) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  removeNote: (id: string) => Promise<void>
  reorderNotes: (reorderedNotes: Note[]) => Promise<void>
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState)

  const loadNotes = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const notes = await notesApi.fetchNotes()
      dispatch({ type: 'SET_NOTES', payload: notes })
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Load notes on mount
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const addNote = useCallback(async (input: { title: string; content: string; color: NoteColor; folderId?: string | null }) => {
    const note = await notesApi.createNote(input)
    dispatch({ type: 'ADD_NOTE', payload: note })
  }, [])

  const editNote = useCallback(async (id: string, input: { title?: string; content?: string; color?: NoteColor; folderId?: string | null }) => {
    const note = await notesApi.updateNote(id, input)
    dispatch({ type: 'UPDATE_NOTE', payload: note })
  }, [])

  const toggleFavorite = useCallback(async (id: string) => {
    const existing = state.notes.find((n) => n.id === id)
    if (!existing) return
    const note = await notesApi.updateNote(id, { isFavorite: !existing.isFavorite })
    dispatch({ type: 'UPDATE_NOTE', payload: note })
  }, [state.notes])

  const removeNote = useCallback(async (id: string) => {
    await notesApi.deleteNote(id)
    dispatch({ type: 'DELETE_NOTE', payload: id })
  }, [])

  const reorderNotes = useCallback(async (reorderedNotes: Note[]) => {
    // Optimistic update
    const updatedNotes = reorderedNotes.map((note, index) => ({ ...note, position: index }))
    dispatch({ type: 'REORDER_NOTES', payload: updatedNotes })

    try {
      await notesApi.reorderNotes(updatedNotes.map((n) => n.id))
    } catch {
      // Revert on error by reloading
      await loadNotes()
    }
  }, [loadNotes])

  // Compute filtered & sorted notes
  const colorOrder: Record<string, number> = { yellow: 0, orange: 1, purple: 2, blue: 3, green: 4 }

  const filteredNotes = state.notes
    .filter((note) => {
      const matchesColor = !state.activeColor || note.color === state.activeColor
      const matchesFavorite = !state.showFavorites || note.isFavorite
      const matchesFolder = state.activeFolderId === null || note.folderId === state.activeFolderId
      const matchesSearch =
        !state.searchQuery ||
        note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
      return matchesColor && matchesFavorite && matchesFolder && matchesSearch
    })
    .sort((a, b) => {
      switch (state.sortBy) {
        case 'manual':
          return a.position - b.position
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'color':
          return (colorOrder[a.color] ?? 99) - (colorOrder[b.color] ?? 99)
        default:
          return 0
      }
    })

  return (
    <NotesContext.Provider value={{ state, dispatch, filteredNotes, loadNotes, addNote, editNote, toggleFavorite, removeNote, reorderNotes }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}
