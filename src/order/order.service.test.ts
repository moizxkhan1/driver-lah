import { OrderService } from './order.service';
import { prisma } from '../common/config/prisma';

// Mock Prisma
jest.mock('../common/config/prisma', () => ({
  prisma: {
    voucher: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    promotion: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(prisma)),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService();
    jest.clearAllMocks();
  });

  const sampleItems = [
    { id: 'item1', categoryId: 'cat1', price: 50, qty: 2 },
    { id: 'item2', categoryId: 'cat2', price: 30, qty: 1 },
  ];

  describe('applyDiscount', () => {
    describe('Voucher validation', () => {
      it('should reject expired voucher', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'EXPIRED',
          isActive: true,
          expiresAt: new Date('2020-01-01'),
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderValue: null,
        });

        await expect(
          service.applyDiscount({
            total: 100,
            items: sampleItems,
            voucherCode: 'EXPIRED',
          })
        ).rejects.toThrow('Voucher has expired');
      });

      it('should reject inactive voucher', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'INACTIVE',
          isActive: false,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderValue: null,
        });

        await expect(
          service.applyDiscount({
            total: 100,
            items: sampleItems,
            voucherCode: 'INACTIVE',
          })
        ).rejects.toThrow('Voucher is inactive');
      });

      it('should reject voucher when usage limit exceeded', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'MAXED',
          isActive: true,
          expiresAt: null,
          usageLimit: 5,
          usedCount: 5,
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderValue: null,
        });

        await expect(
          service.applyDiscount({
            total: 100,
            items: sampleItems,
            voucherCode: 'MAXED',
          })
        ).rejects.toThrow('Voucher usage limit exceeded');
      });

      it('should reject voucher when min order not met', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'MINORDER',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderValue: 200,
        });

        await expect(
          service.applyDiscount({
            total: 100,
            items: sampleItems,
            voucherCode: 'MINORDER',
          })
        ).rejects.toThrow('Minimum order value of 200 required');
      });
    });

    describe('Discount calculation', () => {
      it('should calculate percentage voucher discount', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'PERCENT10',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderValue: null,
        });

        const result = await service.applyDiscount({
          total: 100,
          items: sampleItems,
          voucherCode: 'PERCENT10',
        });

        expect(result.discountTotal).toBe(10);
        expect(result.finalTotal).toBe(90);
      });

      it('should calculate fixed voucher discount', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'FIXED20',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'FIXED',
          discountValue: 20,
          minOrderValue: null,
        });

        const result = await service.applyDiscount({
          total: 100,
          items: sampleItems,
          voucherCode: 'FIXED20',
        });

        expect(result.discountTotal).toBe(20);
        expect(result.finalTotal).toBe(80);
      });

      it('should apply 50% max discount cap', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'BIG',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 80, // 80% discount
          minOrderValue: null,
        });

        const result = await service.applyDiscount({
          total: 100,
          items: sampleItems,
          voucherCode: 'BIG',
        });

        // Should be capped at 50%
        expect(result.discountTotal).toBe(50);
        expect(result.finalTotal).toBe(50);
      });
    });

    describe('Promotion eligibility', () => {
      it('should apply discount only to eligible categories', async () => {
        (mockPrisma.promotion.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'CAT1ONLY',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 20,
          eligibleCategories: [{ promotionId: '1', categoryId: 'cat1' }],
          eligibleItems: [],
        });

        const result = await service.applyDiscount({
          total: 130, // 50*2 + 30 = 130
          items: sampleItems,
          promotionCode: 'CAT1ONLY',
        });

        // Only cat1 items (50*2=100) get 20% discount = 20
        expect(result.discountTotal).toBe(20);
        expect(result.finalTotal).toBe(110);
        expect(result.appliedPromotion?.eligibleItems).toEqual(['item1']);
        expect(result.ineligibleItems).toEqual(['item2']);
      });

      it('should apply discount only to eligible item IDs', async () => {
        (mockPrisma.promotion.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'ITEM2ONLY',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 50,
          eligibleCategories: [],
          eligibleItems: [{ promotionId: '1', itemId: 'item2' }],
        });

        const result = await service.applyDiscount({
          total: 130,
          items: sampleItems,
          promotionCode: 'ITEM2ONLY',
        });

        // Only item2 (30*1=30) gets 50% discount = 15
        expect(result.discountTotal).toBe(15);
        expect(result.finalTotal).toBe(115);
      });

      it('should apply to all items when no eligibility rules', async () => {
        (mockPrisma.promotion.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'ALLITEMS',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 10,
          eligibleCategories: [],
          eligibleItems: [],
        });

        const result = await service.applyDiscount({
          total: 130,
          items: sampleItems,
          promotionCode: 'ALLITEMS',
        });

        // All items (130) get 10% = 13
        expect(result.discountTotal).toBe(13);
        expect(result.finalTotal).toBe(117);
      });
    });

    describe('Combined discounts', () => {
      it('should combine voucher and promotion discounts', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'VOUCHER',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'FIXED',
          discountValue: 10,
          minOrderValue: null,
        });

        (mockPrisma.promotion.findUnique as jest.Mock).mockResolvedValue({
          id: '2',
          code: 'PROMO',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'FIXED',
          discountValue: 10,
          eligibleCategories: [],
          eligibleItems: [],
        });

        const result = await service.applyDiscount({
          total: 100,
          items: sampleItems,
          voucherCode: 'VOUCHER',
          promotionCode: 'PROMO',
        });

        // 10 + 10 = 20 total discount
        expect(result.discountTotal).toBe(20);
        expect(result.finalTotal).toBe(80);
        expect(result.appliedVoucher?.discount).toBe(10);
        expect(result.appliedPromotion?.discount).toBe(10);
      });

      it('should cap combined discounts at 50%', async () => {
        (mockPrisma.voucher.findUnique as jest.Mock).mockResolvedValue({
          id: '1',
          code: 'VOUCHER',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 30,
          minOrderValue: null,
        });

        (mockPrisma.promotion.findUnique as jest.Mock).mockResolvedValue({
          id: '2',
          code: 'PROMO',
          isActive: true,
          expiresAt: null,
          usageLimit: null,
          usedCount: 0,
          discountType: 'PERCENT',
          discountValue: 30,
          eligibleCategories: [],
          eligibleItems: [],
        });

        const result = await service.applyDiscount({
          total: 100,
          items: sampleItems,
          voucherCode: 'VOUCHER',
          promotionCode: 'PROMO',
        });

        // 30 + 30 = 60, but capped at 50
        expect(result.discountTotal).toBe(50);
        expect(result.finalTotal).toBe(50);
      });
    });
  });
});
