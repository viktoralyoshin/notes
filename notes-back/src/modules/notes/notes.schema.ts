import { z } from 'zod'

const noteColorEnum = z.enum(['yellow', 'orange', 'purple', 'green', 'blue'])

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().default(''),
  color: noteColorEnum.default('yellow'),
})

export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  color: noteColorEnum.optional(),
})

export const notesQuerySchema = z.object({
  color: noteColorEnum.optional(),
  search: z.string().optional(),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type NotesQuery = z.infer<typeof notesQuerySchema>
