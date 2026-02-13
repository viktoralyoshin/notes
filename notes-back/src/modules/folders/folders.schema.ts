import { z } from 'zod'

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Folder name is too long'),
})

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  position: z.number().int().min(0).optional(),
})

export const reorderFoldersSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
})

export type CreateFolderInput = z.infer<typeof createFolderSchema>
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>
export type ReorderFoldersInput = z.infer<typeof reorderFoldersSchema>
