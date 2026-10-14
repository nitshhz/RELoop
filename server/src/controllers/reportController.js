import { prisma } from '../config/prisma.js';
import { apiSuccess } from '../utils/apiResponse.js';

export async function createReport(req, res, next) {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        targetType,
        targetId,
        reason,
        details,
      },
    });

    return apiSuccess(res, { report }, 'Report submitted. Our moderation team will review it.', 201);
  } catch (err) {
    next(err);
  }
}
