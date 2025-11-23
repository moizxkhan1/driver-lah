import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  price: z.number().positive(),
  qty: z.number().int().positive(),
});

export const applyDiscountSchema = z.object({
  total: z.number().positive(),
  currency: z.string().optional().default('USD'),
  items: z.array(orderItemSchema),
  voucherCode: z.string().optional(),
  promotionCode: z.string().optional(),
});

export const createOrderSchema = applyDiscountSchema;

export type OrderItem = z.infer<typeof orderItemSchema>;
export type ApplyDiscountInput = z.input<typeof applyDiscountSchema>;
export type CreateOrderInput = z.input<typeof createOrderSchema>;
