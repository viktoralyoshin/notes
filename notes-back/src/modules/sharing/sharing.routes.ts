import type { FastifyInstance } from 'fastify'
import { createShareLink, getShareLink, revokeShareLink, getSharedNote } from './sharing.service.js'
import type { JwtPayload } from '../../types/index.js'

export default async function sharingRoutes(fastify: FastifyInstance) {
  // POST /api/notes/:noteId/share - Create share link (protected)
  fastify.post('/:noteId/share', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { noteId } = request.params as { noteId: string }

    try {
      const shareLink = await createShareLink(fastify, noteId, userId)
      return reply.status(201).send(shareLink)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // GET /api/notes/:noteId/share - Get share link (protected)
  fastify.get('/:noteId/share', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { noteId } = request.params as { noteId: string }

    try {
      const shareLink = await getShareLink(fastify, noteId, userId)
      return reply.send(shareLink)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // DELETE /api/notes/:noteId/share - Revoke share link (protected)
  fastify.delete('/:noteId/share', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { noteId } = request.params as { noteId: string }

    try {
      const result = await revokeShareLink(fastify, noteId, userId)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // GET /api/shared/:token - Get shared note by token (PUBLIC)
  fastify.get('/shared/:token', async (request, reply) => {
    const { token } = request.params as { token: string }

    try {
      const note = await getSharedNote(fastify, token)
      return reply.send(note)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })
}
