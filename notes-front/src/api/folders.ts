import { api } from './client'
import type { Folder } from '../types'

interface ApiFolder {
  id: string
  name: string
  position: number
  userId: string
  createdAt: string
  updatedAt: string
}

function toFolder(apiFolder: ApiFolder): Folder {
  return {
    id: apiFolder.id,
    name: apiFolder.name,
    position: apiFolder.position,
    userId: apiFolder.userId,
    createdAt: apiFolder.createdAt,
    updatedAt: apiFolder.updatedAt,
  }
}

export async function fetchFolders(): Promise<Folder[]> {
  const data = await api.get<ApiFolder[]>('/folders')
  return data.map(toFolder)
}

export async function createFolder(input: { name: string }): Promise<Folder> {
  const data = await api.post<ApiFolder>('/folders', input)
  return toFolder(data)
}

export async function updateFolder(id: string, input: { name?: string }): Promise<Folder> {
  const data = await api.patch<ApiFolder>(`/folders/${id}`, input)
  return toFolder(data)
}

export async function deleteFolder(id: string): Promise<void> {
  await api.delete(`/folders/${id}`)
}

export async function reorderFolders(orderedIds: string[]): Promise<void> {
  await api.patch('/folders/reorder', { orderedIds })
}
