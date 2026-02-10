import type { FastifyInstance } from 'fastify'
import type { CreateNoteInput, UpdateNoteInput, NotesQuery } from './notes.schema.js'
import type { Prisma } from '@prisma/client'

export async function getNotes(fastify: FastifyInstance, userId: string, query: NotesQuery) {
  const where: Prisma.NoteWhereInput = { userId }

  if (query.color) {
    where.color = query.color
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { content: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  return fastify.prisma.note.findMany({
    where,
    orderBy: { createdAt: 'desc' },
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
  return fastify.prisma.note.create({
    data: {
      title: input.title,
      content: input.content,
      color: input.color,
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
