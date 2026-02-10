import type { FastifyInstance } from 'fastify'
import { registerSchema, loginSchema } from './auth.schema.js'
import { registerUser, loginUser, getMe } from './auth.service.js'
import type { JwtPayload } from '../../types/index.js'

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const result = await registerUser(fastify, parsed.data)
      return reply.status(201).send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const result = await loginUser(fastify, parsed.data)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // GET /api/auth/me
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.user as JwtPayload
      const user = await getMe(fastify, id)
      return reply.send(user)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })
}
