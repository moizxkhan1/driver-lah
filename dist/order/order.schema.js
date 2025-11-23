"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.applyDiscountSchema = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    categoryId: zod_1.z.string(),
    price: zod_1.z.number().positive(),
    qty: zod_1.z.number().int().positive(),
});
exports.applyDiscountSchema = zod_1.z.object({
    total: zod_1.z.number().positive(),
    currency: zod_1.z.string().optional().default('USD'),
    items: zod_1.z.array(exports.orderItemSchema),
    voucherCode: zod_1.z.string().optional(),
    promotionCode: zod_1.z.string().optional(),
});
exports.createOrderSchema = exports.applyDiscountSchema;
//# sourceMappingURL=order.schema.js.map