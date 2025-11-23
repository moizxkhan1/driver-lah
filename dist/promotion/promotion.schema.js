"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionSchema = exports.createPromotionSchema = void 0;
const zod_1 = require("zod");
exports.createPromotionSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50),
    discountType: zod_1.z.enum(['PERCENT', 'FIXED']),
    discountValue: zod_1.z.number().positive(),
    usageLimit: zod_1.z.number().int().positive().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
    eligibleCategories: zod_1.z.array(zod_1.z.string()).optional().default([]),
    eligibleItemIds: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
exports.updatePromotionSchema = exports.createPromotionSchema.partial();
//# sourceMappingURL=promotion.schema.js.map