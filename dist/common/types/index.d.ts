export interface OrderItem {
    id: string;
    categoryId: string;
    price: number;
    qty: number;
}
export interface ApiError extends Error {
    statusCode: number;
    details?: unknown;
}
export declare enum DiscountType {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
//# sourceMappingURL=index.d.ts.map