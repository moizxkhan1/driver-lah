import { z } from 'zod';
export declare const createPromotionSchema: z.ZodObject<{
    code: z.ZodString;
    discountType: z.ZodEnum<{
        PERCENT: "PERCENT";
        FIXED: "FIXED";
    }>;
    discountValue: z.ZodNumber;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    eligibleCategories: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    eligibleItemIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const updatePromotionSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    discountType: z.ZodOptional<z.ZodEnum<{
        PERCENT: "PERCENT";
        FIXED: "FIXED";
    }>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    expiresAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    eligibleCategories: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
    eligibleItemIds: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>>;
}, z.core.$strip>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
//# sourceMappingURL=promotion.schema.d.ts.map