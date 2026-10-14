import { z } from 'zod';

export const createOfferSchema = z.object({
  listingId: z.string().uuid('Invalid listing ID'),
  amount: z.coerce.number().positive('Offer amount must be greater than zero').max(10000000, 'Amount exceeds maximum limit'),
});

export const counterOfferSchema = z.object({
  counterAmount: z.coerce.number().positive('Counter-offer amount must be greater than zero').max(10000000, 'Amount exceeds maximum limit'),
});

export const respondOfferSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
  counterAmount: z.coerce.number().positive().optional(),
});
