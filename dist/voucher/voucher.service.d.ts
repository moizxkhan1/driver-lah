import { CreateVoucherInput, UpdateVoucherInput } from './voucher.schema';
export declare class VoucherService {
    create(data: CreateVoucherInput): Promise<{
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        minOrderValue: number | null;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(activeOnly?: boolean): Promise<{
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        minOrderValue: number | null;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findByCode(code: string): Promise<{
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        minOrderValue: number | null;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(code: string, data: UpdateVoucherInput): Promise<{
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        minOrderValue: number | null;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(code: string): Promise<{
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        minOrderValue: number | null;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const voucherService: VoucherService;
//# sourceMappingURL=voucher.service.d.ts.map