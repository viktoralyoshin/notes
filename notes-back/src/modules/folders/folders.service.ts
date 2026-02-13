import type { FastifyInstance } from 'fastify'
import type { CreateFolderInput, UpdateFolderInput, ReorderFoldersInput } from './folders.schema.js'

export async function getFolders(fastify: FastifyInstance, userId: string) {
  return fastify.prisma.folder.findMany({
    where: { userId },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  })
}

export async function getFolderById(fastify: FastifyInstance, id: string, userId: string) {
  const folder = await fastify.prisma.folder.findUnique({ where: { id } })

  if (!folder || folder.userId !== userId) {
    throw { statusCode: 404, message: 'Folder not found' }
  }

  return folder
}

export async function createFolder(fastify: FastifyInstance, userId: string, input: CreateFolderInput) {
  // Shift all existing folders down by 1
  await fastify.prisma.folder.updateMany({
    where: { userId },
    data: { position: { increment: 1 } },
  })

  return fastify.prisma.folder.create({
    data: {
      name: input.name,
      position: 0,
      userId,
    },
  })
}

export async function updateFolder(
  fastify: FastifyInstance,
  id: string,
  userId: string,
  input: UpdateFolderInput,
) {
  // Check ownership
  const existing = await fastify.prisma.folder.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw { statusCode: 404, message: 'Folder not found' }
  }

  return fastify.prisma.folder.update({
    where: { id },
    data: input,
  })
}

export async function deleteFolder(fastify: FastifyInstance, id: string, userId: string) {
  const existing = await fastify.prisma.folder.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    throw { statusCode: 404, message: 'Folder not found' }
  }

  // Notes in this folder will have folderId set to null (onDelete: SetNull)
  await fastify.prisma.folder.delete({ where: { id } })
  return { success: true }
}

export async function reorderFolders(fastify: FastifyInstance, userId: string, input: ReorderFoldersInput) {
  const { orderedIds } = input

  // Verify all folders belong to this user
  const folders = await fastify.prisma.folder.findMany({
    where: { userId },
    select: { id: true },
  })
  const userFolderIds = new Set(folders.map((f) => f.id))

  for (const id of orderedIds) {
    if (!userFolderIds.has(id)) {
      throw { statusCode: 400, message: `Folder ${id} not found or not owned by user` }
    }
  }

  // Batch update positions
  await fastify.prisma.$transaction(
    orderedIds.map((id, index) =>
      fastify.prisma.folder.update({
        where: { id },
        data: { position: index },
      }),
    ),
  )

  return { success: true }
}
