import { api } from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export interface ShareLink {
  id: string
  token: string
  noteId: string
  expiresAt: string | null
  createdAt: string
}

export interface SharedNote {
  id: string
  title: string
  content: string
  color: string
  createdAt: string
  updatedAt: string
  attachments: Array<{
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    noteId: string
    createdAt: string
  }>
}

export async function createShareLink(noteId: string): Promise<ShareLink> {
  return api.post<ShareLink>(`/notes/${noteId}/share`, {})
}

export async function getShareLink(noteId: string): Promise<ShareLink | null> {
  try {
    return await api.get<ShareLink>(`/notes/${noteId}/share`)
  } catch {
    return null
  }
}

export async function revokeShareLink(noteId: string): Promise<void> {
  await api.delete(`/notes/${noteId}/share`)
}

export async function getSharedNote(token: string): Promise<SharedNote> {
  const response = await fetch(`${API_BASE_URL}/api/shared/${token}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to load shared note' }))
    throw new Error(error.error || 'Failed to load shared note')
  }
  return response.json()
}

export function getShareUrl(token: string): string {
  return `${window.location.origin}/shared/${token}`
}
