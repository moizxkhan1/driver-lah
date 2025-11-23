import { Voucher, Promotion, PromotionCategory, PromotionItem } from '@prisma/client';
import { prisma } from '../common/config/prisma';
import { AppError } from '../common/middleware/errorHandler';
import { ApplyDiscountInput, OrderItem, CreateOrderInput } from './order.schema';

type PromotionWithEligibility = Promotion & {
  eligibleCategories: PromotionCategory[];
  eligibleItems: PromotionItem[];
};

export interface DiscountResult {
  total: number;
  discountTotal: number;
  finalTotal: number;
  appliedVoucher?: { code: string; discount: number };
  appliedPromotion?: { code: string; discount: number; eligibleItems: string[] };
  ineligibleItems?: string[];
}

export class OrderService {
  async applyDiscount(input: ApplyDiscountInput): Promise<DiscountResult> {
    const { total, items, voucherCode, promotionCode } = input;

    let voucherDiscount = 0;
    let promotionDiscount = 0;
    let appliedVoucher: DiscountResult['appliedVoucher'];
    let appliedPromotion: DiscountResult['appliedPromotion'];
    let ineligibleItems: string[] = [];

    // Apply voucher
    if (voucherCode) {
      const voucher = await this.validateVoucher(voucherCode, total);
      voucherDiscount = this.calculateVoucherDiscount(voucher, total);
      appliedVoucher = { code: voucher.code, discount: voucherDiscount };
    }

    // Apply promotion
    if (promotionCode) {
      const promotion = await this.validatePromotion(promotionCode);
      const { discount, eligibleItems, ineligible } = this.calculatePromotionDiscount(
        promotion,
        items
      );
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

  async createOrder(input: CreateOrderInput): Promise<any> {
    const discountResult = await this.applyDiscount(input);

    return prisma.$transaction(async (tx) => {
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
      let voucherId: string | null = null;
      let promotionId: string | null = null;

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

  private async validateVoucher(code: string, orderTotal: number): Promise<Voucher> {
    const voucher = await prisma.voucher.findUnique({ where: { code } });

    if (!voucher) {
      throw new AppError('Voucher not found', 404);
    }

    if (!voucher.isActive) {
      throw new AppError('Voucher is inactive', 400);
    }

    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      throw new AppError('Voucher has expired', 400);
    }

    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      throw new AppError('Voucher usage limit exceeded', 400);
    }

    if (voucher.minOrderValue && orderTotal < voucher.minOrderValue) {
      throw new AppError(
        `Minimum order value of ${voucher.minOrderValue} required for this voucher`,
        400
      );
    }

    return voucher;
  }

  private async validatePromotion(code: string): Promise<PromotionWithEligibility> {
    const promotion = await prisma.promotion.findUnique({
      where: { code },
      include: {
        eligibleCategories: true,
        eligibleItems: true,
      },
    });

    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }

    if (!promotion.isActive) {
      throw new AppError('Promotion is inactive', 400);
    }

    if (promotion.expiresAt && promotion.expiresAt < new Date()) {
      throw new AppError('Promotion has expired', 400);
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new AppError('Promotion usage limit exceeded', 400);
    }

    return promotion;
  }

  private calculateVoucherDiscount(voucher: Voucher, total: number): number {
    if (voucher.discountType === 'PERCENT') {
      return (total * voucher.discountValue) / 100;
    }
    return Math.min(voucher.discountValue, total);
  }

  private calculatePromotionDiscount(
    promotion: PromotionWithEligibility,
    items: OrderItem[]
  ): { discount: number; eligibleItems: string[]; ineligible: string[] } {
    const eligibleCategoryIds = promotion.eligibleCategories.map((pc) => pc.categoryId);
    const eligibleItemIds = promotion.eligibleItems.map((pi) => pi.itemId);

    const hasEligibilityRules =
      eligibleCategoryIds.length > 0 || eligibleItemIds.length > 0;

    let eligibleItems: OrderItem[] = [];
    let ineligibleIds: string[] = [];

    if (hasEligibilityRules) {
      items.forEach((item) => {
        const categoryMatch = eligibleCategoryIds.includes(item.categoryId);
        const itemMatch = eligibleItemIds.includes(item.id);

        if (categoryMatch || itemMatch) {
          eligibleItems.push(item);
        } else {
          ineligibleIds.push(item.id);
        }
      });
    } else {
      // No eligibility rules means all items are eligible
      eligibleItems = items;
    }

    if (eligibleItems.length === 0) {
      return { discount: 0, eligibleItems: [], ineligible: ineligibleIds };
    }

    const eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    let discount: number;
    if (promotion.discountType === 'PERCENT') {
      discount = (eligibleSubtotal * promotion.discountValue) / 100;
    } else {
      discount = Math.min(promotion.discountValue, eligibleSubtotal);
    }

    return {
      discount,
      eligibleItems: eligibleItems.map((i) => i.id),
      ineligible: ineligibleIds,
    };
  }
}

export const orderService = new OrderService();
