"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVoucherSchema = exports.createVoucherSchema = void 0;
const zod_1 = require("zod");
exports.createVoucherSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50),
    discountType: zod_1.z.enum(['PERCENT', 'FIXED']),
    discountValue: zod_1.z.number().positive(),
    minOrderValue: zod_1.z.number().positive().optional(),
    usageLimit: zod_1.z.number().int().positive().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateVoucherSchema = exports.createVoucherSchema.partial();
//# sourceMappingURL=voucher.schema.js.map