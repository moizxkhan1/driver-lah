"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const prisma_1 = require("../common/config/prisma");
const errorHandler_1 = require("../common/middleware/errorHandler");
class CategoryService {
    async create(data) {
        const existing = await prisma_1.prisma.category.findUnique({
            where: { name: data.name },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Category already exists', 409);
        }
        return prisma_1.prisma.category.create({ data });
    }
    async findAll() {
        return prisma_1.prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { items: true } } },
        });
    }
    async findById(id) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found', 404);
        }
        return category;
    }
    async update(id, data) {
        await this.findById(id);
        return prisma_1.prisma.category.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        await this.findById(id);
        return prisma_1.prisma.category.delete({
            where: { id },
        });
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
//# sourceMappingURL=category.service.js.map