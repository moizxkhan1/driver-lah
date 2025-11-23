"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const prisma_1 = require("../common/config/prisma");
const errorHandler_1 = require("../common/middleware/errorHandler");
class OrderService {
    async applyDiscount(input) {
        const { total, items, voucherCode, promotionCode } = input;
        let voucherDiscount = 0;
        let promotionDiscount = 0;
        let appliedVoucher;
        let appliedPromotion;
        let ineligibleItems = [];
        // Apply voucher
        if (voucherCode) {
            const voucher = await this.validateVoucher(voucherCode, total);
            voucherDiscount = this.calculateVoucherDiscount(voucher, total);
            appliedVoucher = { code: voucher.code, discount: voucherDiscount };
        }
        // Apply promotion
        if (promotionCode) {
            const promotion = await this.validatePromotion(promotionCode);
            const { discount, eligibleItems, ineligible } = this.calculatePromotionDiscount(promotion, items);
            promotionDiscount = discount;
            ineligibleItems = ineligible;
            if (discount > 0) {
                appliedPromotion = {
                    code: promotion.code,
                    discount: promotionDiscount,
                    eligibleItems,
                };
            }
        }
        // Total discount (both can be applied)
        const totalDiscount = voucherDiscount + promotionDiscount;
        // Apply 50% max cap
        const maxDiscount = total * 0.5;
        const cappedDiscount = Math.min(totalDiscount, maxDiscount);
        const finalTotal = Math.max(0, total - cappedDiscount);
        return {
            total,
            discountTotal: cappedDiscount,
            finalTotal: Math.round(finalTotal * 100) / 100,
            appliedVoucher,
            appliedPromotion,
            ineligibleItems: ineligibleItems.length > 0 ? ineligibleItems : undefined,
        };
    }
    async createOrder(input) {
        const discountResult = await this.applyDiscount(input);
        return prisma_1.prisma.$transaction(async (tx) => {
            // Increment usage counts
            if (input.voucherCode) {
                await tx.voucher.update({
                    where: { code: input.voucherCode },
                    data: { usedCount: { increment: 1 } },
                });
            }
            if (input.promotionCode && discountResult.appliedPromotion) {
                await tx.promotion.update({
                    where: { code: input.promotionCode },
                    data: { usedCount: { increment: 1 } },
                });
            }
            // Get voucher and promotion IDs
            let voucherId = null;
            let promotionId = null;
            if (input.voucherCode) {
                const v = await tx.voucher.findUnique({ where: { code: input.voucherCode } });
                voucherId = v?.id || null;
            }
            if (input.promotionCode && discountResult.appliedPromotion) {
                const p = await tx.promotion.findUnique({ where: { code: input.promotionCode } });
                promotionId = p?.id || null;
            }
            // Create order with OrderItems
            const order = await tx.order.create({
                data: {
                    total: input.total,
                    currency: input.currency,
                    appliedVoucherId: voucherId,
                    appliedPromotionId: promotionId,
                    discountTotal: discountResult.discountTotal,
                    finalTotal: discountResult.finalTotal,
                    items: {
                        create: input.items.map((item) => ({
                            itemId: item.id,
                            qty: item.qty,
                            priceAtPurchase: item.price,
                        })),
                    },
                },
                include: {
                    appliedVoucher: true,
                    appliedPromotion: true,
                    items: {
                        include: {
                            item: true,
                        },
                    },
                },
            });
            return {
                ...order,
                discountBreakdown: {
                    voucherDiscount: discountResult.appliedVoucher?.discount || 0,
                    promotionDiscount: discountResult.appliedPromotion?.discount || 0,
                    totalDiscount: discountResult.discountTotal,
                },
            };
        });
    }
    async validateVoucher(code, orderTotal) {
        const voucher = await prisma_1.prisma.voucher.findUnique({ where: { code } });
        if (!voucher) {
            throw new errorHandler_1.AppError('Voucher not found', 404);
        }
        if (!voucher.isActive) {
            throw new errorHandler_1.AppError('Voucher is inactive', 400);
        }
        if (voucher.expiresAt && voucher.expiresAt < new Date()) {
            throw new errorHandler_1.AppError('Voucher has expired', 400);
        }
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            throw new errorHandler_1.AppError('Voucher usage limit exceeded', 400);
        }
        if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
            throw new errorHandler_1.AppError(`Minimum order value of ${voucher.minOrderValue} required for this voucher`, 400);
        }
        return voucher;
    }
    async validatePromotion(code) {
        const promotion = await prisma_1.prisma.promotion.findUnique({
            where: { code },
            include: {
                eligibleCategories: true,
                eligibleItems: true,
            },
        });
        if (!promotion) {
            throw new errorHandler_1.AppError('Promotion not found', 404);
        }
        if (!promotion.isActive) {
            throw new errorHandler_1.AppError('Promotion is inactive', 400);
        }
        if (promotion.expiresAt && promotion.expiresAt < new Date()) {
            throw new errorHandler_1.AppError('Promotion has expired', 400);
        }
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
            throw new errorHandler_1.AppError('Promotion usage limit exceeded', 400);
        }
        return promotion;
    }
    calculateVoucherDiscount(voucher, total) {
        if (voucher.discountType === 'PERCENT') {
            return (total * voucher.discountValue) / 100;
        }
        return Math.min(voucher.discountValue, total);
    }
    calculatePromotionDiscount(promotion, items) {
        const eligibleCategoryIds = promotion.eligibleCategories.map((pc) => pc.categoryId);
        const eligibleItemIds = promotion.eligibleItems.map((pi) => pi.itemId);
        const hasEligibilityRules = eligibleCategoryIds.length > 0 || eligibleItemIds.length > 0;
        let eligibleItems = [];
        let ineligibleIds = [];
        if (hasEligibilityRules) {
            items.forEach((item) => {
                const categoryMatch = eligibleCategoryIds.includes(item.categoryId);
                const itemMatch = eligibleItemIds.includes(item.id);
                if (categoryMatch || itemMatch) {
                    eligibleItems.push(item);
                }
                else {
                    ineligibleIds.push(item.id);
                }
            });
        }
        else {
            // No eligibility rules means all items are eligible
            eligibleItems = items;
        }
        if (eligibleItems.length === 0) {
            return { discount: 0, eligibleItems: [], ineligible: ineligibleIds };
        }
        const eligibleSubtotal = eligibleItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        let discount;
        if (promotion.discountType === 'PERCENT') {
            discount = (eligibleSubtotal * promotion.discountValue) / 100;
        }
        else {
            discount = Math.min(promotion.discountValue, eligibleSubtotal);
        }
        return {
            discount,
            eligibleItems: eligibleItems.map((i) => i.id),
            ineligible: ineligibleIds,
        };
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
//# sourceMappingURL=order.service.js.map