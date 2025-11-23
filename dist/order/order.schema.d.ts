import { z } from 'zod';
export declare const orderItemSchema: z.ZodObject<{
    id: z.ZodString;
    categoryId: z.ZodString;
    price: z.ZodNumber;
    qty: z.ZodNumber;
}, z.core.$strip>;
export declare const applyDiscountSchema: z.ZodObject<{
    total: z.ZodNumber;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        categoryId: z.ZodString;
        price: z.ZodNumber;
        qty: z.ZodNumber;
    }, z.core.$strip>>;
    voucherCode: z.ZodOptional<z.ZodString>;
    promotionCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodObject<{
    total: z.ZodNumber;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        categoryId: z.ZodString;
        price: z.ZodNumber;
        qty: z.ZodNumber;
    }, z.core.$strip>>;
    voucherCode: z.ZodOptional<z.ZodString>;
    promotionCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type ApplyDiscountInput = z.input<typeof applyDiscountSchema>;
export type CreateOrderInput = z.input<typeof createOrderSchema>;
//# sourceMappingURL=order.schema.d.ts.map