import { useNotes } from '../../store/notesContext'
import { NOTE_COLORS, type NoteColor } from '../../types'

interface SidebarProps {
  onAddNote: () => void
  onOpenProfile: () => void
}

const colorOrder: NoteColor[] = ['yellow', 'orange', 'purple', 'blue', 'green']

export default function Sidebar({ onAddNote, onOpenProfile }: SidebarProps) {
  const { state, dispatch } = useNotes()

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

        {/* Favorites filter */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_FAVORITES' })}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer mt-2 ${
            state.showFavorites
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
          aria-label="Toggle favorites"
          title="Favorites"
        >
          <svg className="w-4 h-4" fill={state.showFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Profile"
          title="Profile"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </aside>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="Profile"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_FAVORITES' })}
            className={`w-5 h-5 flex items-center justify-center transition-all cursor-pointer ${
              state.showFavorites ? 'text-gray-900' : 'text-gray-400'
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
