import { prisma } from '../config/prisma.js';
export const createAuditLog = async ({ actorId, action, entity, entityId, oldData, newData, ipAddress, userAgent, }, client = prisma) => {
    return client.auditLog.create({
        data: {
            actorId,
            action,
            entity,
            entityId,
            oldData: oldData,
            newData: newData,
            ipAddress,
            userAgent,
        },
    });
};
//# sourceMappingURL=audit.service.js.map