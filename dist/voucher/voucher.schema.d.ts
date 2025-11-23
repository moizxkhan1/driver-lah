import { z } from 'zod';
export declare const createVoucherSchema: z.ZodObject<{
    code: z.ZodString;
    discountType: z.ZodEnum<{
        PERCENT: "PERCENT";
        FIXED: "FIXED";
    }>;
    discountValue: z.ZodNumber;
    minOrderValue: z.ZodOptional<z.ZodNumber>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateVoucherSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    discountType: z.ZodOptional<z.ZodEnum<{
        PERCENT: "PERCENT";
        FIXED: "FIXED";
    }>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    minOrderValue: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    usageLimit: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    expiresAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, z.core.$strip>;
export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
//# sourceMappingURL=voucher.schema.d.ts.map