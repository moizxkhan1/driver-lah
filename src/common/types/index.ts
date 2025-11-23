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

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}
