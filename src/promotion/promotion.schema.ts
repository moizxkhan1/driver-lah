import { z } from 'zod';

export const createPromotionSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().positive(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional().default(true),
  eligibleCategories: z.array(z.string()).optional().default([]),
  eligibleItemIds: z.array(z.string()).optional().default([]),
});

export const updatePromotionSchema = createPromotionSchema.partial();

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
