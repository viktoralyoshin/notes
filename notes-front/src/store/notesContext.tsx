import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { Note, NoteColor } from '../types'
import { mockNotes } from '../data/mockNotes'

// --- State ---

interface NotesState {
  notes: Note[]
  searchQuery: string
  activeColor: NoteColor | null
}

const STORAGE_KEY = 'docket-notes'

function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // ignore parse errors
  }
  return mockNotes
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

const initialState: NotesState = {
  notes: loadNotes(),
  searchQuery: '',
  activeColor: null,
}

// --- Actions ---

type NotesAction =
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTIVE_COLOR'; payload: NoteColor | null }

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
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
    default:
      return state
  }
}

// --- Context ---

interface NotesContextValue {
  state: NotesState
  dispatch: React.Dispatch<NotesAction>
  filteredNotes: Note[]
}

const NotesContext = createContext<NotesContextValue | null>(null)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notesReducer, initialState)

  // Persist notes to localStorage
  useEffect(() => {
    saveNotes(state.notes)
  }, [state.notes])

  // Compute filtered notes
  const filteredNotes = state.notes.filter((note) => {
    const matchesColor = !state.activeColor || note.color === state.activeColor
    const matchesSearch =
      !state.searchQuery ||
      note.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(state.searchQuery.toLowerCase())
    return matchesColor && matchesSearch
  })

  return (
    <NotesContext.Provider value={{ state, dispatch, filteredNotes }}>
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
