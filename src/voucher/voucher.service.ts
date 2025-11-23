import { prisma } from '../common/config/prisma';
import { AppError } from '../common/middleware/errorHandler';
import { CreateVoucherInput, UpdateVoucherInput } from './voucher.schema';

export class VoucherService {
  async create(data: CreateVoucherInput) {
    const existing = await prisma.voucher.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError('Voucher code already exists', 409);
    }

    return prisma.voucher.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  async findAll(activeOnly: boolean = false) {
    return prisma.voucher.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCode(code: string) {
    const voucher = await prisma.voucher.findUnique({
      where: { code },
    });

    if (!voucher) {
      throw new AppError('Voucher not found', 404);
    }

    return voucher;
  }

  async update(code: string, data: UpdateVoucherInput) {
    const voucher = await this.findByCode(code);

    return prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async delete(code: string) {
    const voucher = await this.findByCode(code);

    return prisma.voucher.delete({
      where: { id: voucher.id },
    });
  }
}

export const voucherService = new VoucherService();
