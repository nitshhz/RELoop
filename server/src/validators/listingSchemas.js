import { z } from 'zod';

export const ConditionEnum = z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']);
export const ListingStatusEnum = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'ACTIVE',
  'RESERVED',
  'SOLD',
  'REJECTED',
  'EXPIRED',
  'REMOVED',
]);

export const createListingSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than zero').max(10000000, 'Price exceeds maximum allowed limit'),
  categoryId: z.string().uuid('Invalid category ID'),
  condition: ConditionEnum.default('GOOD'),
  brand: z.string().trim().max(60).optional().nullable(),
  model: z.string().trim().max(60).optional().nullable(),
  specifications: z.record(z.any()).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
  isDraft: z.boolean().optional().default(false),
});

export const updateListingSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).optional(),
  price: z.coerce.number().positive('Price must be greater than zero').max(10000000).optional(),
  categoryId: z.string().uuid().optional(),
  condition: ConditionEnum.optional(),
  brand: z.string().trim().max(60).optional().nullable(),
  model: z.string().trim().max(60).optional().nullable(),
  specifications: z.record(z.any()).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
});

export const listingStatusChangeSchema = z.object({
  status: z.enum(['ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'REMOVED']),
});

/**
 * Calculates listing completeness score (0-100)
 */
export function calculateCompleteness(listing, imageCount = 0) {
  let score = 0;
  if (listing.title && listing.title.length >= 5) score += 15;
  if (listing.description && listing.description.length >= 30) score += 20;
  if (listing.price && listing.price > 0) score += 15;
  if (listing.categoryId) score += 10;
  if (listing.condition) score += 10;
  if (listing.brand || listing.model) score += 10;
  if (listing.location) score += 5;
  if (imageCount >= 1) score += 10;
  if (imageCount >= 3) score += 5;
  return Math.min(100, score);
}
