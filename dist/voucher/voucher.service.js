"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voucherService = exports.VoucherService = void 0;
const prisma_1 = require("../common/config/prisma");
const errorHandler_1 = require("../common/middleware/errorHandler");
class VoucherService {
    async create(data) {
        const existing = await prisma_1.prisma.voucher.findUnique({
            where: { code: data.code },
        });
        if (existing) {
            throw new errorHandler_1.AppError('Voucher code already exists', 409);
        }
        return prisma_1.prisma.voucher.create({
            data: {
                ...data,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
        });
    }
    async findAll(activeOnly = false) {
        return prisma_1.prisma.voucher.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByCode(code) {
        const voucher = await prisma_1.prisma.voucher.findUnique({
            where: { code },
        });
        if (!voucher) {
            throw new errorHandler_1.AppError('Voucher not found', 404);
        }
        return voucher;
    }
    async update(code, data) {
        const voucher = await this.findByCode(code);
        return prisma_1.prisma.voucher.update({
            where: { id: voucher.id },
            data: {
                ...data,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            },
        });
    }
    async delete(code) {
        const voucher = await this.findByCode(code);
        return prisma_1.prisma.voucher.delete({
            where: { id: voucher.id },
        });
    }
}
exports.VoucherService = VoucherService;
exports.voucherService = new VoucherService();
//# sourceMappingURL=voucher.service.js.map