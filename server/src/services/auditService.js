import { prisma } from '../config/prisma.js';

export async function logAdminAction({ adminId, action, targetType, targetId, reason = null, metadata = null }) {
  try {
    return await prisma.auditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId: String(targetId),
        reason,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
      },
    });
  } catch (err) {
    console.error('[AuditLog Error]', err);
    // Don't crash request if audit log fails, but log error
    return null;
  }
}
