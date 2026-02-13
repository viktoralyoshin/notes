import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import * as sharingApi from '../../api/sharing'

interface ShareDialogProps {
  noteId: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareDialog({ noteId, isOpen, onClose }: ShareDialogProps) {
  const [shareLink, setShareLink] = useState<sharingApi.ShareLink | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && noteId) {
      loadShareLink()
    }
  }, [isOpen, noteId])

  const loadShareLink = async () => {
    setLoading(true)
    try {
      const link = await sharingApi.getShareLink(noteId)
      setShareLink(link)
    } catch {
      // No share link exists yet
      setShareLink(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    setLoading(true)
    try {
      const link = await sharingApi.createShareLink(noteId)
      setShareLink(link)
      toast.success('Share link created')
    } catch {
      toast.error('Failed to create share link')
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async () => {
    if (!confirm('Revoke share link? The link will stop working.')) return
    setLoading(true)
    try {
      await sharingApi.revokeShareLink(noteId)
      setShareLink(null)
      toast.success('Share link revoked')
    } catch {
      toast.error('Failed to revoke share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!shareLink) return
    const url = sharingApi.getShareUrl(shareLink.token)
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  if (!isOpen) return null

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
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl dark:shadow-black/40 animate-modal-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Share Note</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#333] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
        ) : shareLink ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Anyone with this link can view your note (read-only).
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={sharingApi.getShareUrl(shareLink.token)}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-[#333] outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <button
              onClick={handleRevoke}
              className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              Revoke Link
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a public link to share this note with anyone. They will be able to view it (read-only).
            </p>
            <button
              onClick={handleCreate}
              className="w-full px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Create Share Link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
