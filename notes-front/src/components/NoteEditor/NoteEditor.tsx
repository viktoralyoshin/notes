import { useState, useEffect } from 'react'
import { useFolders } from '../../store/foldersContext'
import type { Note, NoteColor } from '../../types'
import { NOTE_COLORS } from '../../types'

interface NoteEditorProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; content: string; color: NoteColor; folderId?: string | null }) => void
}

const colorOrder: NoteColor[] = ['yellow', 'orange', 'purple', 'green', 'blue']

export default function NoteEditor({ note, isOpen, onClose, onSave }: NoteEditorProps) {
  const { state: foldersState } = useFolders()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [color, setColor] = useState<NoteColor>('yellow')
  const [folderId, setFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setColor(note.color)
      setFolderId(note.folderId)
    } else {
      setTitle('')
      setContent('')
      setColor('yellow')
      setFolderId(foldersState.activeFolderId)
    }
  }, [note, isOpen, foldersState.activeFolderId])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSave = () => {
    if (!title.trim()) return
    onSave({ title: title.trim(), content: content.trim(), color, folderId })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className={`${NOTE_COLORS[color].bg} rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl dark:shadow-black/40 animate-modal-in transition-colors duration-300 dark:opacity-90`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title input */}
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-gray-800 font-medium text-base placeholder-gray-500/60 outline-none mb-3 border-b border-black/10 pb-2"
          autoFocus
        />

        {/* Content textarea */}
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          className="w-full bg-transparent text-gray-700 text-sm placeholder-gray-500/60 outline-none resize-none mb-4"
        />

        {/* Folder & Color picker */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Folder selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">Folder:</span>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || null)}
              className="flex-1 bg-transparent text-gray-700 text-sm border-b border-black/10 pb-1 outline-none cursor-pointer"
            >
              <option value="">No folder</option>
              {foldersState.folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 font-medium">Color:</span>
            {colorOrder.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full ${NOTE_COLORS[c].dot} transition-all cursor-pointer ${
                  color === c
                    ? 'ring-2 ring-offset-1 ring-gray-500 scale-110'
                    : 'hover:scale-110'
                }`}
                aria-label={NOTE_COLORS[c].label}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {note ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
