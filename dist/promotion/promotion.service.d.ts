import { CreatePromotionInput, UpdatePromotionInput } from './promotion.schema';
export declare class PromotionService {
    create(data: CreatePromotionInput): Promise<{
        eligibleCategories: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            categoryId: string;
            promotionId: string;
        })[];
        eligibleItems: ({
            item: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
                price: number;
            };
        } & {
            itemId: string;
            promotionId: string;
        })[];
    } & {
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(activeOnly?: boolean): Promise<({
        eligibleCategories: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            categoryId: string;
            promotionId: string;
        })[];
        eligibleItems: ({
            item: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
                price: number;
            };
        } & {
            itemId: string;
            promotionId: string;
        })[];
    } & {
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findByCode(code: string): Promise<{
        eligibleCategories: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            categoryId: string;
            promotionId: string;
        })[];
        eligibleItems: ({
            item: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
                price: number;
            };
        } & {
            itemId: string;
            promotionId: string;
        })[];
    } & {
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(code: string, data: UpdatePromotionInput): Promise<{
        eligibleCategories: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
            };
        } & {
            categoryId: string;
            promotionId: string;
        })[];
        eligibleItems: ({
            item: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
                price: number;
            };
        } & {
            itemId: string;
            promotionId: string;
        })[];
    } & {
        code: string;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: number;
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
        usageLimit: number | null;
        expiresAt: Date | null;
        isActive: boolean;
        id: string;
        usedCount: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export declare const promotionService: PromotionService;
//# sourceMappingURL=promotion.service.d.ts.map