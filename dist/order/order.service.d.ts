import { ApplyDiscountInput, CreateOrderInput } from './order.schema';
export interface DiscountResult {
    total: number;
    discountTotal: number;
    finalTotal: number;
    appliedVoucher?: {
        code: string;
        discount: number;
    };
    appliedPromotion?: {
        code: string;
        discount: number;
        eligibleItems: string[];
    };
    ineligibleItems?: string[];
}
export declare class OrderService {
    applyDiscount(input: ApplyDiscountInput): Promise<DiscountResult>;
    createOrder(input: CreateOrderInput): Promise<any>;
    private validateVoucher;
    private validatePromotion;
    private calculateVoucherDiscount;
    private calculatePromotionDiscount;
}
export declare const orderService: OrderService;
//# sourceMappingURL=order.service.d.ts.map