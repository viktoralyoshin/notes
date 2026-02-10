import type { Note } from '../../types'
import { NOTE_COLORS } from '../../types'

interface NoteCardProps {
  note: Note
  index: number
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function NoteCard({ note, index, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {
  return (
    <div
      className={`note-card ${NOTE_COLORS[note.color].bg} rounded-2xl p-5 min-h-[180px] flex flex-col justify-between relative group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-black/30 cursor-pointer dark:opacity-90`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onEdit(note)}
    >
      {/* Favorite star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(note.id)
        }}
        className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full transition-all cursor-pointer ${
          note.isFavorite
            ? 'text-gray-900 opacity-100'
            : 'text-gray-600/40 opacity-0 group-hover:opacity-100 hover:text-gray-700'
        }`}
        aria-label={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg
          className="w-4.5 h-4.5"
          fill={note.isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 pr-6">
        <p className="text-gray-800 font-medium text-sm leading-relaxed line-clamp-6">
          {note.title}
        </p>
        {note.content && (
          <p className="text-gray-600/80 text-xs mt-2 leading-relaxed line-clamp-3">
            {note.content}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-600/70">{formatDate(note.createdAt)}</span>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(note)
            }}
            className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Edit note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
            className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
            aria-label="Delete note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
