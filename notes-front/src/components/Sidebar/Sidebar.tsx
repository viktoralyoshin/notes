import { useNotes } from '../../store/notesContext'
import { NOTE_COLORS, type NoteColor } from '../../types'

interface SidebarProps {
  onAddNote: () => void
}

const colorOrder: NoteColor[] = ['yellow', 'orange', 'purple', 'blue', 'green']

export default function Sidebar({ onAddNote }: SidebarProps) {
  const { state, dispatch } = useNotes()

  const handleColorClick = (color: NoteColor) => {
    dispatch({
      type: 'SET_ACTIVE_COLOR',
      payload: state.activeColor === color ? null : color,
    })
  }

  return (
    <aside className="flex flex-col items-center gap-6 py-8 px-4 w-20 min-h-screen bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="mb-2">
        <span className="text-xs font-semibold text-gray-500 tracking-wide">Docket</span>
      </div>

      {/* Add button */}
      <button
        onClick={onAddNote}
        className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl hover:bg-gray-700 transition-colors cursor-pointer"
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
    </aside>
  )
}
