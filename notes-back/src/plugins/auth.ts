import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { env } from '../config/env.js'

export default fp(async (fastify: FastifyInstance) => {
  await fastify.register(cookie)

  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })
})
