import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'
import type { RegisterInput, LoginInput } from './auth.schema.js'

const SALT_ROUNDS = 10

export async function registerUser(fastify: FastifyInstance, input: RegisterInput) {
  const existing = await fastify.prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existing) {
    throw { statusCode: 409, message: 'Email already registered' }
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)

  const user = await fastify.prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
    },
  })

  const token = fastify.jwt.sign({ id: user.id, email: user.email })

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  }
}

export async function loginUser(fastify: FastifyInstance, input: LoginInput) {
  const user = await fastify.prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' }
  }

  const valid = await bcrypt.compare(input.password, user.password)

  if (!valid) {
    throw { statusCode: 401, message: 'Invalid email or password' }
  }

  const token = fastify.jwt.sign({ id: user.id, email: user.email })

  return {
    user: { id: user.id, email: user.email, name: user.name },
    token,
  }
}

export async function getMe(fastify: FastifyInstance, userId: string) {
  const user = await fastify.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  })

  if (!user) {
    throw { statusCode: 404, message: 'User not found' }
  }

  return user
}
