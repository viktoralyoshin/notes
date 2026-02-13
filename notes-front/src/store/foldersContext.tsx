import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import type { Folder } from '../types'
import * as foldersApi from '../api/folders'

// --- State ---

interface FoldersState {
  folders: Folder[]
  activeFolderId: string | null
  isLoading: boolean
}

const initialState: FoldersState = {
  folders: [],
  activeFolderId: null,
  isLoading: true,
}

// --- Actions ---

type FoldersAction =
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'UPDATE_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'REORDER_FOLDERS'; payload: Folder[] }
  | { type: 'SET_ACTIVE_FOLDER'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }

function foldersReducer(state: FoldersState, action: FoldersAction): FoldersState {
  switch (action.type) {
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload, isLoading: false }
    case 'ADD_FOLDER':
      return { ...state, folders: [action.payload, ...state.folders] }
    case 'UPDATE_FOLDER':
      return {
        ...state,
        folders: state.folders.map((f) =>
          f.id === action.payload.id ? action.payload : f
        ),
      }
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter((f) => f.id !== action.payload),
        activeFolderId: state.activeFolderId === action.payload ? null : state.activeFolderId,
      }
    case 'REORDER_FOLDERS':
      return { ...state, folders: action.payload }
    case 'SET_ACTIVE_FOLDER':
      return { ...state, activeFolderId: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

// --- Context ---

interface FoldersContextValue {
  state: FoldersState
  dispatch: React.Dispatch<FoldersAction>
  loadFolders: () => Promise<void>
  addFolder: (input: { name: string }) => Promise<void>
  editFolder: (id: string, input: { name: string }) => Promise<void>
  removeFolder: (id: string) => Promise<void>
  reorderFolders: (reorderedFolders: Folder[]) => Promise<void>
}

const FoldersContext = createContext<FoldersContextValue | null>(null)

export function FoldersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(foldersReducer, initialState)

  const loadFolders = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const folders = await foldersApi.fetchFolders()
      dispatch({ type: 'SET_FOLDERS', payload: folders })
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Load folders on mount
  useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const addFolder = useCallback(async (input: { name: string }) => {
    const folder = await foldersApi.createFolder(input)
    dispatch({ type: 'ADD_FOLDER', payload: folder })
  }, [])

  const editFolder = useCallback(async (id: string, input: { name: string }) => {
    const folder = await foldersApi.updateFolder(id, input)
    dispatch({ type: 'UPDATE_FOLDER', payload: folder })
  }, [])

  const removeFolder = useCallback(async (id: string) => {
    await foldersApi.deleteFolder(id)
    dispatch({ type: 'DELETE_FOLDER', payload: id })
  }, [])

  const reorderFolders = useCallback(async (reorderedFolders: Folder[]) => {
    // Optimistic update
    const updatedFolders = reorderedFolders.map((folder, index) => ({ ...folder, position: index }))
    dispatch({ type: 'REORDER_FOLDERS', payload: updatedFolders })

    try {
      await foldersApi.reorderFolders(updatedFolders.map((f) => f.id))
    } catch {
      // Revert on error by reloading
      await loadFolders()
    }
  }, [loadFolders])

  return (
    <FoldersContext.Provider value={{ state, dispatch, loadFolders, addFolder, editFolder, removeFolder, reorderFolders }}>
      {children}
    </FoldersContext.Provider>
  )
}

export function useFolders() {
  const context = useContext(FoldersContext)
  if (!context) {
    throw new Error('useFolders must be used within a FoldersProvider')
  }
  return context
}
