import type { FastifyInstance } from 'fastify'

export async function createShareLink(fastify: FastifyInstance, noteId: string, userId: string) {
  // Check ownership
  const note = await fastify.prisma.note.findUnique({ where: { id: noteId } })
  if (!note || note.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  // Check if share link already exists
  const existing = await fastify.prisma.shareLink.findUnique({ where: { noteId } })
  if (existing) {
    return existing
  }

  // Create new share link
  return fastify.prisma.shareLink.create({
    data: {
      noteId,
    },
  })
}

export async function getShareLink(fastify: FastifyInstance, noteId: string, userId: string) {
  const note = await fastify.prisma.note.findUnique({ where: { id: noteId } })
  if (!note || note.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  return fastify.prisma.shareLink.findUnique({ where: { noteId } })
}

export async function revokeShareLink(fastify: FastifyInstance, noteId: string, userId: string) {
  const note = await fastify.prisma.note.findUnique({ where: { id: noteId } })
  if (!note || note.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  const shareLink = await fastify.prisma.shareLink.findUnique({ where: { noteId } })
  if (!shareLink) {
    throw { statusCode: 404, message: 'Share link not found' }
  }

  await fastify.prisma.shareLink.delete({ where: { id: shareLink.id } })
  return { success: true }
}

export async function getSharedNote(fastify: FastifyInstance, token: string) {
  const shareLink = await fastify.prisma.shareLink.findUnique({
    where: { token },
    include: {
      note: {
        include: {
          attachments: true,
        },
      },
    },
  })

  if (!shareLink) {
    throw { statusCode: 404, message: 'Shared note not found' }
  }

  // Check expiration
  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    throw { statusCode: 410, message: 'Share link has expired' }
  }

  return shareLink.note
}
