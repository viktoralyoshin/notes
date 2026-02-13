import type { FastifyInstance } from 'fastify'
import { uploadAttachment, getAttachmentsByNote, deleteAttachment } from './attachments.service.js'
import type { JwtPayload } from '../../types/index.js'

export default async function attachmentsRoutes(fastify: FastifyInstance) {
  // All attachment routes require authentication
  fastify.addHook('preHandler', fastify.authenticate)

  // POST /api/notes/:noteId/attachments - Upload file
  fastify.post('/:noteId/attachments', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { noteId } = request.params as { noteId: string }

    try {
      const data = await request.file()
      if (!data) {
        return reply.status(400).send({ error: 'No file provided' })
      }

      const attachment = await uploadAttachment(fastify, noteId, userId, data)
      return reply.status(201).send(attachment)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // GET /api/notes/:noteId/attachments - List attachments
  fastify.get('/:noteId/attachments', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { noteId } = request.params as { noteId: string }

    try {
      const attachments = await getAttachmentsByNote(fastify, noteId, userId)
      return reply.send(attachments)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // DELETE /api/attachments/:id - Delete attachment
  fastify.delete('/attachments/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }

    try {
      const result = await deleteAttachment(fastify, id, userId)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })
}
