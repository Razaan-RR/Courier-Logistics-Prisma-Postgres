import { prisma } from '../config/prisma.js'
import { Prisma } from '../generated/prisma/client.js'

interface CreateAuditLogParams {
  actorId: string
  action: string
  entity: string
  entityId: string
  oldData?: unknown
  newData?: unknown
  ipAddress?: string
  userAgent?: string
}

export const createAuditLog = async (
  {
    actorId,
    action,
    entity,
    entityId,
    oldData,
    newData,
    ipAddress,
    userAgent,
  }: CreateAuditLogParams,
  client: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  return client.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      oldData: oldData as any,
      newData: newData as any,
      ipAddress,
      userAgent,
    },
  })
}
