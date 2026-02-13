import type { FastifyInstance } from 'fastify'
import type { MultipartFile } from '@fastify/multipart'
import path from 'path'
import fs from 'fs/promises'
import { pipeline } from 'stream/promises'
import { createWriteStream } from 'fs'
import { randomBytes } from 'crypto'
import { UPLOADS_DIR } from '../../config/env.js'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function uploadAttachment(
  fastify: FastifyInstance,
  noteId: string,
  userId: string,
  file: MultipartFile,
) {
  // Check note ownership
  const note = await fastify.prisma.note.findUnique({ where: { id: noteId } })
  if (!note || note.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  // Validate file size
  if (file.file.bytesRead > MAX_FILE_SIZE) {
    throw { statusCode: 400, message: 'File too large (max 10MB)' }
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw { statusCode: 400, message: 'File type not allowed' }
  }

  // Generate unique filename
  const ext = path.extname(file.filename)
  const filename = `${randomBytes(16).toString('hex')}${ext}`
  const filepath = path.join(UPLOADS_DIR, filename)

  // Save file to disk
  await pipeline(file.file, createWriteStream(filepath))

  // Get file size
  const stats = await fs.stat(filepath)

  // Create DB record
  const attachment = await fastify.prisma.attachment.create({
    data: {
      filename,
      originalName: file.filename,
      mimeType: file.mimetype,
      size: stats.size,
      noteId,
    },
  })

  return attachment
}

export async function getAttachmentsByNote(fastify: FastifyInstance, noteId: string, userId: string) {
  // Check note ownership
  const note = await fastify.prisma.note.findUnique({ where: { id: noteId } })
  if (!note || note.userId !== userId) {
    throw { statusCode: 404, message: 'Note not found' }
  }

  return fastify.prisma.attachment.findMany({
    where: { noteId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function deleteAttachment(fastify: FastifyInstance, id: string, userId: string) {
  const attachment = await fastify.prisma.attachment.findUnique({
    where: { id },
    include: { note: true },
  })

  if (!attachment || attachment.note.userId !== userId) {
    throw { statusCode: 404, message: 'Attachment not found' }
  }

  // Delete file from disk
  const filepath = path.join(UPLOADS_DIR, attachment.filename)
  try {
    await fs.unlink(filepath)
  } catch {
    // File may not exist, continue anyway
  }

  // Delete DB record
  await fastify.prisma.attachment.delete({ where: { id } })

  return { success: true }
}
