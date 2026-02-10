import type { FastifyInstance } from 'fastify'
import { registerSchema, loginSchema } from './auth.schema.js'
import { registerUser, loginUser, refreshTokens, logoutUser, getMe } from './auth.service.js'
import type { JwtPayload } from '../../types/index.js'

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Validation error', details: parsed.error.flatten() })
    }

    try {
      const result = await registerUser(fastify, reply, parsed.data)
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
      const result = await loginUser(fastify, reply, parsed.data)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // POST /api/auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies.refresh_token

    if (!refreshToken) {
      return reply.status(401).send({ error: 'No refresh token' })
    }

    try {
      const result = await refreshTokens(fastify, reply, refreshToken)
      return reply.send(result)
    } catch (err: any) {
      return reply.status(err.statusCode || 500).send({ error: err.message })
    }
  })

  // POST /api/auth/logout
  fastify.post('/logout', async (request, reply) => {
    const refreshToken = request.cookies.refresh_token

    try {
      const result = await logoutUser(fastify, reply, refreshToken)
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
