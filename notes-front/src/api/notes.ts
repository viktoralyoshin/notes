import { api } from './client'
import type { Note, NoteColor } from '../types'

interface ApiNote {
  id: string
  title: string
  content: string
  color: string
  isFavorite: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

function toNote(apiNote: ApiNote): Note {
  return {
    id: apiNote.id,
    title: apiNote.title,
    content: apiNote.content,
    color: apiNote.color as NoteColor,
    isFavorite: apiNote.isFavorite,
    createdAt: apiNote.createdAt,
    updatedAt: apiNote.updatedAt,
  }
}

export async function fetchNotes(color?: NoteColor | null, search?: string): Promise<Note[]> {
  const params = new URLSearchParams()
  if (color) params.set('color', color)
  if (search) params.set('search', search)
  const query = params.toString()
  const endpoint = `/notes${query ? `?${query}` : ''}`

  const data = await api.get<ApiNote[]>(endpoint)
  return data.map(toNote)
}

export async function createNote(input: { title: string; content: string; color: NoteColor }): Promise<Note> {
  const data = await api.post<ApiNote>('/notes', input)
  return toNote(data)
}

export async function updateNote(id: string, input: { title?: string; content?: string; color?: NoteColor; isFavorite?: boolean }): Promise<Note> {
  const data = await api.patch<ApiNote>(`/notes/${id}`, input)
  return toNote(data)
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`)
}
