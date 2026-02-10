import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { Note, NoteColor } from '../types'
import * as notesApi from '../api/notes'

// --- State ---

interface NotesState {
  notes: Note[]
  searchQuery: string
  activeColor: NoteColor | null
  isLoading: boolean
}

const initialState: NotesState = {
  notes: [],
  searchQuery: '',
  activeColor: null,
  isLoading: true,
}

// --- Actions ---

type NotesAction =
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_COLOR'; payload: NoteColor | null }
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
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_ACTIVE_COLOR':
      return { ...state, activeColor: action.payload }
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
  addNote: (input: { title: string; content: string; color: NoteColor }) => Promise<void>
  editNote: (id: string, input: { title?: string; content?: string; color?: NoteColor }) => Promise<void>
  removeNote: (id: string) => Promise<void>
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

  const addNote = useCallback(async (input: { title: string; content: string; color: NoteColor }) => {
    const note = await notesApi.createNote(input)
    dispatch({ type: 'ADD_NOTE', payload: note })
  }, [])

  const editNote = useCallback(async (id: string, input: { title?: string; content?: string; color?: NoteColor }) => {
    const note = await notesApi.updateNote(id, input)
    dispatch({ type: 'UPDATE_NOTE', payload: note })
  }, [])

  const removeNote = useCallback(async (id: string) => {
    await notesApi.deleteNote(id)
    dispatch({ type: 'DELETE_NOTE', payload: id })
  }, [])

  // Compute filtered notes (search + color filter on client side for instant feedback)
  const filteredNotes = state.notes.filter((note) => {
    const matchesColor = !state.activeColor || note.color === state.activeColor
    const matchesSearch =
      !state.searchQuery ||
      note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
    return matchesColor && matchesSearch
  })

  return (
    <NotesContext.Provider value={{ state, dispatch, filteredNotes, loadNotes, addNote, editNote, removeNote }}>
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
