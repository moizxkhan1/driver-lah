import { z } from 'zod';

export const createVoucherSchema = z.object({
  code: z.string().min(1).max(50),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateVoucherSchema = createVoucherSchema.partial();

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
