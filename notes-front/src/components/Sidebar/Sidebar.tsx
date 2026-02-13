import { useState } from 'react'
import { useNotes } from '../../store/notesContext'
import { useFolders } from '../../store/foldersContext'
import { useDarkMode } from '../../hooks/useDarkMode'
import { NOTE_COLORS, type NoteColor } from '../../types'
import { toast } from 'sonner'

interface SidebarProps {
  onAddNote: () => void
  onOpenProfile: () => void
}

const colorOrder: NoteColor[] = ['yellow', 'orange', 'purple', 'blue', 'green']

export default function Sidebar({ onAddNote, onOpenProfile }: SidebarProps) {
  const { state, dispatch } = useNotes()
  const { state: foldersState, dispatch: foldersDispatch, addFolder, editFolder, removeFolder } = useFolders()
  const { isDark, toggle: toggleDark } = useDarkMode()
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleColorClick = (color: NoteColor) => {
    dispatch({
      type: 'SET_ACTIVE_COLOR',
      payload: state.activeColor === color ? null : color,
    })
  }

  const handleFolderClick = (folderId: string) => {
    const newActiveFolderId = foldersState.activeFolderId === folderId ? null : folderId
    foldersDispatch({
      type: 'SET_ACTIVE_FOLDER',
      payload: newActiveFolderId,
    })
    dispatch({
      type: 'SET_ACTIVE_FOLDER',
      payload: newActiveFolderId,
    })
  }

  const handleAddFolder = async () => {
    const name = prompt('Enter folder name:')
    if (!name?.trim()) return
    try {
      await addFolder({ name: name.trim() })
      toast.success('Folder created')
    } catch {
      toast.error('Failed to create folder')
    }
  }

  const handleEditFolder = (id: string, currentName: string) => {
    setEditingFolderId(id)
    setEditingName(currentName)
  }

  const handleSaveEdit = async () => {
    if (!editingFolderId || !editingName.trim()) return
    try {
      await editFolder(editingFolderId, { name: editingName.trim() })
      toast.success('Folder renamed')
      setEditingFolderId(null)
      setEditingName('')
    } catch {
      toast.error('Failed to rename folder')
    }
  }

  const handleDeleteFolder = async (id: string, name: string) => {
    if (!confirm(`Delete folder "${name}"? Notes inside will not be deleted.`)) return
    try {
      await removeFolder(id)
      toast.success('Folder deleted')
    } catch {
      toast.error('Failed to delete folder')
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col gap-6 py-8 px-6 w-64 min-h-screen bg-white dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-[#2a2a2a] shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">Docket</span>
          <button
            onClick={onAddNote}
            className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Add note"
          >
            +
          </button>
        </div>

        {/* Folders */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Folders</span>
            <button
              onClick={handleAddFolder}
              className="w-5 h-5 rounded flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              aria-label="Add folder"
            >
              +
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {foldersState.folders.map((folder) => (
              <div
                key={folder.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  foldersState.activeFolderId === folder.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleFolderClick(folder.id)}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {editingFolderId === folder.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') {
                        setEditingFolderId(null)
                        setEditingName('')
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent border-b border-current outline-none text-sm"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm truncate">{folder.name}</span>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEditFolder(folder.id, folder.name)}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="Rename folder"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    aria-label="Delete folder"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="w-full">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 block">Filters</span>
          
          {/* Favorites */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITES' })}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer mb-2 ${
              state.showFavorites
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill={state.showFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="text-sm">Favorites</span>
          </button>

          {/* Colors */}
          <div className="flex items-center gap-2 px-3">
            {colorOrder.map((color) => (
              <button
                key={color}
                onClick={() => handleColorClick(color)}
                className={`w-5 h-5 rounded-full ${NOTE_COLORS[color].dot} transition-all cursor-pointer ${
                  state.activeColor === color
                    ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                    : 'hover:scale-110'
                }`}
                aria-label={`Filter by ${NOTE_COLORS[color].label}`}
              />
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          aria-label="Profile"
          title="Profile"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-[#2a2a2a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors cursor-pointer"
            aria-label="Profile"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>

          {/* Dark mode toggle (mobile) */}
          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITES' })}
            className={`w-5 h-5 flex items-center justify-center transition-all cursor-pointer ${
              state.showFavorites ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
            }`}
            aria-label="Toggle favorites"
          >
            <svg className="w-4 h-4" fill={state.showFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          {colorOrder.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`w-4 h-4 rounded-full ${NOTE_COLORS[color].dot} transition-all cursor-pointer ${
                state.activeColor === color
                  ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500 scale-110'
                  : ''
              }`}
              aria-label={`Filter by ${NOTE_COLORS[color].label}`}
            />
          ))}
        </div>

        <button
          onClick={onAddNote}
          className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors cursor-pointer shadow-md"
          aria-label="Add note"
        >
          +
        </button>
      </div>
    </>
  )
}
