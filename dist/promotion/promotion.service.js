"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionService = exports.PromotionService = void 0;
const prisma_1 = require("../common/config/prisma");
const errorHandler_1 = require("../common/middleware/errorHandler");
class PromotionService {
    async create(data) {
        const existing = await prisma_1.prisma.promotion.findUnique({
            where: { code: data.code },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Promotion code already exists', 409);
        }
        const { eligibleCategories, eligibleItemIds, ...promotionData } = data;
        return prisma_1.prisma.promotion.create({
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
    async findAll(activeOnly = false) {
        return prisma_1.prisma.promotion.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                eligibleCategories: { include: { category: true } },
                eligibleItems: { include: { item: true } },
            },
        });
    }
    async findByCode(code) {
        const promotion = await prisma_1.prisma.promotion.findUnique({
            where: { code },
            include: {
                eligibleCategories: { include: { category: true } },
                eligibleItems: { include: { item: true } },
            },
        });
        if (!promotion) {
            throw new errorHandler_1.AppError('Promotion not found', 404);
        }
        return promotion;
    }
    async update(code, data) {
        const promotion = await this.findByCode(code);
        const { eligibleCategories, eligibleItemIds, ...updateData } = data;
        return prisma_1.prisma.$transaction(async (tx) => {
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
    async delete(code) {
        const promotion = await this.findByCode(code);
        return prisma_1.prisma.promotion.delete({
            where: { id: promotion.id },
        });
    }
}
exports.PromotionService = PromotionService;
exports.promotionService = new PromotionService();
//# sourceMappingURL=promotion.service.js.map