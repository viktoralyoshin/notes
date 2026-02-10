import { useNotes } from '../../store/notesContext'
import { useAuth } from '../../store/authContext'
import { NOTE_COLORS, type NoteColor } from '../../types'

interface SidebarProps {
  onAddNote: () => void
}

const colorOrder: NoteColor[] = ['yellow', 'orange', 'purple', 'blue', 'green']

export default function Sidebar({ onAddNote }: SidebarProps) {
  const { state, dispatch } = useNotes()
  const { logout } = useAuth()

  const handleColorClick = (color: NoteColor) => {
    dispatch({
      type: 'SET_ACTIVE_COLOR',
      payload: state.activeColor === color ? null : color,
    })
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col items-center gap-6 py-8 px-4 w-20 min-h-screen bg-white border-r border-gray-100 shrink-0">
        {/* Logo */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-gray-500 tracking-wide">Docket</span>
        </div>

        {/* Add button */}
        <button
          onClick={onAddNote}
          className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl hover:bg-gray-700 transition-colors cursor-pointer shadow-md"
          aria-label="Add note"
        >
          +
        </button>

        {/* Color filters */}
        <div className="flex flex-col gap-4 mt-4">
          {colorOrder.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`w-5 h-5 rounded-full ${NOTE_COLORS[color].dot} transition-all cursor-pointer ${
                state.activeColor === color
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  : 'hover:scale-110'
              }`}
              aria-label={`Filter by ${NOTE_COLORS[color].label}`}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout */}
        <button
          onClick={logout}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Logout"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={logout}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Logout"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {colorOrder.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className={`w-4 h-4 rounded-full ${NOTE_COLORS[color].dot} transition-all cursor-pointer ${
                state.activeColor === color
                  ? 'ring-2 ring-offset-1 ring-gray-400 scale-110'
                  : ''
              }`}
              aria-label={`Filter by ${NOTE_COLORS[color].label}`}
            />
          ))}
        </div>

        <button
          onClick={onAddNote}
          className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg hover:bg-gray-700 transition-colors cursor-pointer shadow-md"
          aria-label="Add note"
        >
          +
        </button>
      </div>
    </>
  )
}
