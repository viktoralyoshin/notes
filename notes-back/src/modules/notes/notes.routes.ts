import type { FastifyInstance } from 'fastify'
import { createNoteSchema, updateNoteSchema, notesQuerySchema, reorderNotesSchema } from './notes.schema.js'
import { getNotes, getNoteById, createNote, updateNote, deleteNote, reorderNotes } from './notes.service.js'
import type { JwtPayload } from '../../types/index.js'

export default async function notesRoutes(fastify: FastifyInstance) {
  // All notes routes require authentication
  fastify.addHook('preHandler', fastify.authenticate)

  // GET /api/notes
  fastify.get('/', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const parsed = notesQuerySchema.safeParse(request.query)
    const query = parsed.success ? parsed.data : {}

    const notes = await getNotes(fastify, userId, query)
    return reply.send(notes)
  })

  // GET /api/notes/:id
  fastify.get('/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }

    try {
      const note = await getNoteById(fastify, id, userId)
      return reply.send(note)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // POST /api/notes
  fastify.post('/', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const parsed = createNoteSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    const note = await createNote(fastify, userId, parsed.data)
    return reply.status(201).send(note)
  })

  // PATCH /api/notes/:id
  fastify.patch('/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }
    const parsed = updateNoteSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const note = await updateNote(fastify, id, userId, parsed.data)
      return reply.send(note)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // PATCH /api/notes/reorder
  fastify.patch('/reorder', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const parsed = reorderNotesSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const result = await reorderNotes(fastify, userId, parsed.data)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // DELETE /api/notes/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }

    try {
      const result = await deleteNote(fastify, id, userId)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })
}
