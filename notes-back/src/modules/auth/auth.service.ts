import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import type { FastifyInstance, FastifyReply } from 'fastify'
import type { RegisterInput, LoginInput, UpdateProfileInput, ChangePasswordInput } from './auth.schema.js'

const SALT_ROUNDS = 10
const ACCESS_TOKEN_EXPIRES = '15m'
const REFRESH_TOKEN_DAYS = 30

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex')
}

function setRefreshCookie(reply: FastifyReply, token: string) {
  reply.setCookie('refresh_token', token, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60,
  })
}

function clearRefreshCookie(reply: FastifyReply) {
  reply.clearCookie('refresh_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/api/auth',
  })
}

async function createTokenPair(fastify: FastifyInstance, reply: FastifyReply, userId: string, email: string) {
  // Access token — short-lived, sent in response body
  const accessToken = fastify.jwt.sign(
    { id: userId, email },
    { expiresIn: ACCESS_TOKEN_EXPIRES },
  )

  // Refresh token — long-lived, stored in httpOnly cookie + DB
  const refreshToken = generateRefreshToken()
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000)

  await fastify.prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  })

  setRefreshCookie(reply, refreshToken)

  return accessToken
}

export async function registerUser(fastify: FastifyInstance, reply: FastifyReply, input: RegisterInput) {
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

  const accessToken = await createTokenPair(fastify, reply, user.id, user.email)

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
  }
}

export async function loginUser(fastify: FastifyInstance, reply: FastifyReply, input: LoginInput) {
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

  const accessToken = await createTokenPair(fastify, reply, user.id, user.email)

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
  }
}

export async function refreshTokens(fastify: FastifyInstance, reply: FastifyReply, refreshToken: string) {
  // Find the token in DB
  const stored = await fastify.prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  })

  if (!stored) {
    throw { statusCode: 401, message: 'Invalid refresh token' }
  }

  // Check expiration
  if (stored.expiresAt < new Date()) {
    await fastify.prisma.refreshToken.delete({ where: { id: stored.id } })
    throw { statusCode: 401, message: 'Refresh token expired' }
  }

  // Token rotation — delete old, create new pair
  await fastify.prisma.refreshToken.delete({ where: { id: stored.id } })

  const accessToken = await createTokenPair(fastify, reply, stored.user.id, stored.user.email)

  return {
    user: { id: stored.user.id, email: stored.user.email, name: stored.user.name },
    accessToken,
  }
}

export async function logoutUser(fastify: FastifyInstance, reply: FastifyReply, refreshToken: string | undefined) {
  if (refreshToken) {
    await fastify.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })
  }

  clearRefreshCookie(reply)
  return { success: true }
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

export async function updateProfile(fastify: FastifyInstance, userId: string, input: UpdateProfileInput) {
  const user = await fastify.prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: { id: true, email: true, name: true, createdAt: true },
  })
  return user
}

export async function changePassword(fastify: FastifyInstance, userId: string, input: ChangePasswordInput) {
  const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw { statusCode: 404, message: 'User not found' }
  }

  const valid = await bcrypt.compare(input.currentPassword, user.password)
  if (!valid) {
    throw { statusCode: 400, message: 'Current password is incorrect' }
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS)
  await fastify.prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })

  return { success: true }
}
