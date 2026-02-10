import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../store/authContext'
import { updateProfile, changePassword } from '../../api/auth'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout } = useAuth()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) setName(user.name || '')
    setCurrentPassword('')
    setNewPassword('')
  }, [user, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !user) return null

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateProfile(name)
      toast.success('Profile updated')
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Email (readonly) */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 font-medium mb-1 block">Email</label>
          <div className="px-4 py-2.5 rounded-lg bg-gray-50 text-sm text-gray-400 border border-gray-100">
            {user.email}
          </div>
        </div>

        {/* Update name */}
        <form onSubmit={handleUpdateProfile} className="mb-6">
          <label className="text-xs text-gray-500 font-medium mb-1 block">Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 text-sm text-gray-700 border border-gray-200 outline-none focus:border-gray-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword}>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Change password</label>
          <div className="flex flex-col gap-2">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 outline-none focus:border-gray-400 transition-colors"
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-sm text-gray-700 placeholder-gray-400 border border-gray-200 outline-none focus:border-gray-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Change password
            </button>
          </div>
        </form>

        {/* Logout */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => { logout(); onClose() }}
            className="w-full py-2.5 text-red-500 text-sm font-medium hover:text-red-600 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
