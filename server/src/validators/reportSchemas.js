import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['LISTING', 'USER', 'CONVERSATION']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.enum(['SPAM_SCAM', 'PROHIBITED', 'MISLEADING', 'DUPLICATE', 'HARASSMENT', 'OTHER']),
  details: z.string().max(1000, 'Details cannot exceed 1000 characters').optional().nullable(),
});

export const resolveReportSchema = z.object({
  status: z.enum(['REVIEWED', 'RESOLVED', 'DISMISSED']),
  resolutionNotes: z.string().max(1000).optional().nullable(),
});
