import type { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export interface JwtPayload {
  id: string
  email: string
}
