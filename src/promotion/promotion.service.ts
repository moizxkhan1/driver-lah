import { prisma } from '../common/config/prisma';
import { AppError } from '../common/middleware/errorHandler';
import { CreatePromotionInput, UpdatePromotionInput } from './promotion.schema';

export class PromotionService {
  async create(data: CreatePromotionInput) {
    const existing = await prisma.promotion.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError('Promotion code already exists', 409);
    }

    const { eligibleCategories, eligibleItemIds, ...promotionData } = data;

    return prisma.promotion.create({
      data: {
        ...promotionData,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        eligibleCategories: eligibleCategories?.length
          ? {
              create: eligibleCategories.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
        eligibleItems: eligibleItemIds?.length
          ? {
              create: eligibleItemIds.map((itemId) => ({
                itemId,
              })),
            }
          : undefined,
      },
      include: {
        eligibleCategories: { include: { category: true } },
        eligibleItems: { include: { item: true } },
      },
    });
  }

  async findAll(activeOnly: boolean = false) {
    return prisma.promotion.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        eligibleCategories: { include: { category: true } },
        eligibleItems: { include: { item: true } },
      },
    });
  }

  async findByCode(code: string) {
    const promotion = await prisma.promotion.findUnique({
      where: { code },
      include: {
        eligibleCategories: { include: { category: true } },
        eligibleItems: { include: { item: true } },
      },
    });

    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }

    return promotion;
  }

  async update(code: string, data: UpdatePromotionInput) {
    const promotion = await this.findByCode(code);
    const { eligibleCategories, eligibleItemIds, ...updateData } = data;

    return prisma.$transaction(async (tx) => {
      // Delete existing relations if new ones are provided
      if (eligibleCategories !== undefined) {
        await tx.promotionCategory.deleteMany({
          where: { promotionId: promotion.id },
        });
      }
      if (eligibleItemIds !== undefined) {
        await tx.promotionItem.deleteMany({
          where: { promotionId: promotion.id },
        });
      }

      return tx.promotion.update({
        where: { id: promotion.id },
        data: {
          ...updateData,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          eligibleCategories: eligibleCategories?.length
            ? {
                create: eligibleCategories.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
          eligibleItems: eligibleItemIds?.length
            ? {
                create: eligibleItemIds.map((itemId) => ({
                  itemId,
                })),
              }
            : undefined,
        },
        include: {
          eligibleCategories: { include: { category: true } },
          eligibleItems: { include: { item: true } },
        },
      });
    });
  }

  async delete(code: string) {
    const promotion = await this.findByCode(code);

    return prisma.promotion.delete({
      where: { id: promotion.id },
    });
  }
}

export const promotionService = new PromotionService();
