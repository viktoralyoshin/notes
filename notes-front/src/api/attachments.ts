import { api } from './client'
import type { Attachment } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function uploadAttachment(noteId: string, file: File): Promise<Attachment> {
  const formData = new FormData()
  formData.append('file', file)

  const token = (api as any).token
  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to upload file' }))
    throw new Error(error.error || 'Failed to upload file')
  }

  return response.json()
}

export async function getAttachments(noteId: string): Promise<Attachment[]> {
  return api.get<Attachment[]>(`/notes/${noteId}/attachments`)
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  await api.delete(`/attachments/${attachmentId}`)
}

export function getAttachmentUrl(filename: string): string {
  return `${API_BASE_URL}/uploads/${filename}`
}
