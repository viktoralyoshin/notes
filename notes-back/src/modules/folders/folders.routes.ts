import type { FastifyInstance } from 'fastify'
import { createFolderSchema, updateFolderSchema, reorderFoldersSchema } from './folders.schema.js'
import { getFolders, getFolderById, createFolder, updateFolder, deleteFolder, reorderFolders } from './folders.service.js'
import type { JwtPayload } from '../../types/index.js'

export default async function foldersRoutes(fastify: FastifyInstance) {
  // All folder routes require authentication
  fastify.addHook('preHandler', fastify.authenticate)

  // GET /api/folders
  fastify.get('/', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const folders = await getFolders(fastify, userId)
    return reply.send(folders)
  })

  // GET /api/folders/:id
  fastify.get('/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }

    try {
      const folder = await getFolderById(fastify, id, userId)
      return reply.send(folder)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // POST /api/folders
  fastify.post('/', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const parsed = createFolderSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    const folder = await createFolder(fastify, userId, parsed.data)
    return reply.status(201).send(folder)
  })

  // PATCH /api/folders/:id
  fastify.patch('/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }
    const parsed = updateFolderSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const folder = await updateFolder(fastify, id, userId, parsed.data)
      return reply.send(folder)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // PATCH /api/folders/reorder
  fastify.patch('/reorder', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const parsed = reorderFoldersSchema.safeParse(request.body)

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const result = await reorderFolders(fastify, userId, parsed.data)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // DELETE /api/folders/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id: userId } = request.user as JwtPayload
    const { id } = request.params as { id: string }

    try {
      const result = await deleteFolder(fastify, id, userId)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })
}
