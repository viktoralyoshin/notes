import type { FastifyInstance } from 'fastify'
import type { CreateNoteInput, UpdateNoteInput, ReorderNotesInput, NotesQuery } from './notes.schema.js'
import type { Prisma } from '@prisma/client'

export async function getNotes(fastify: FastifyInstance, userId: string, query: NotesQuery) {
  const where: Prisma.NoteWhereInput = { userId }

  if (query.color) {
    where.color = query.color
  }

  if (query.favorite === 'true') {
    where.isFavorite = true
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { content: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  return fastify.prisma.note.findMany({
    where,
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function getNoteById(fastify: FastifyInstance, id: string, userId: string) {
  const note = await fastify.prisma.note.findUnique({ where: { id } })

  if (!note || note.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  return note
}

export async function createNote(fastify: FastifyInstance, userId: string, input: CreateNoteInput) {
  // Shift all existing notes down by 1
  await fastify.prisma.note.updateMany({
    where: { userId },
    data: { position: { increment: 1 } },
  })

  return fastify.prisma.note.create({
    data: {
      title: input.title,
      content: input.content,
      color: input.color,
      isFavorite: input.isFavorite,
      position: 0,
      userId,
    },
  })
}

export async function updateNote(
  fastify: FastifyInstance,
  id: string,
  userId: string,
  input: UpdateNoteInput,
) {
  // Check ownership
  const existing = await fastify.prisma.note.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  return fastify.prisma.note.update({
    where: { id },
    data: input,
  })
}

export async function deleteNote(fastify: FastifyInstance, id: string, userId: string) {
  const existing = await fastify.prisma.note.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  await fastify.prisma.note.delete({ where: { id } })
  return { success: true }
}

export async function reorderNotes(fastify: FastifyInstance, userId: string, input: ReorderNotesInput) {
  const { orderedIds } = input

  // Verify all notes belong to this user
  const notes = await fastify.prisma.note.findMany({
    where: { userId },
    select: { id: true },
  })
  const userNoteIds = new Set(notes.map((n) => n.id))

  for (const id of orderedIds) {
    if (!userNoteIds.has(id)) {
      throw { statusCode: 400, message: `Note ${id} not found or not owned by user` }
    }
  }

  // Batch update positions
  await fastify.prisma.$transaction(
    orderedIds.map((id, index) =>
      fastify.prisma.note.update({
        where: { id },
        data: { position: index },
      }),
    ),
  )

  return { success: true }
}
