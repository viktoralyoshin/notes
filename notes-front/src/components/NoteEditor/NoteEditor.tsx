import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useFolders } from '../../store/foldersContext'
import type { Note, NoteColor, Attachment } from '../../types'
import { NOTE_COLORS } from '../../types'
import * as attachmentsApi from '../../api/attachments'

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
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setColor(note.color)
      setFolderId(note.folderId)
      // Load attachments
      loadAttachments(note.id)
    } else {
      setTitle('')
      setContent('')
      setColor('yellow')
      setFolderId(foldersState.activeFolderId)
      setAttachments([])
    }
  }, [note, isOpen, foldersState.activeFolderId])

  const loadAttachments = async (noteId: string) => {
    try {
      const data = await attachmentsApi.getAttachments(noteId)
      setAttachments(data)
    } catch {
      // Ignore errors, note might not exist yet
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !note) return
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const attachment = await attachmentsApi.uploadAttachment(note.id, file)
      setAttachments([...attachments, attachment])
      toast.success('File uploaded')
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await attachmentsApi.deleteAttachment(attachmentId)
      setAttachments(attachments.filter((a) => a.id !== attachmentId))
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

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
        <div className="flex flex-col gap-4 mb-4">
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

        {/* Attachments */}
        {note && (
          <div className="mb-4 pb-4 border-b border-black/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 font-medium">Attachments:</span>
              <label className="px-3 py-1 text-xs bg-black/10 hover:bg-black/20 rounded cursor-pointer transition-colors">
                {uploading ? 'Uploading...' : '+ Upload'}
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
            {attachments.length > 0 && (
              <div className="flex flex-col gap-2">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 p-2 bg-black/5 rounded">
                    {att.mimeType.startsWith('image/') && (
                      <img
                        src={attachmentsApi.getAttachmentUrl(att.filename)}
                        alt={att.originalName}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">{att.originalName}</p>
                      <p className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      aria-label="Delete"
                    >
                      <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
