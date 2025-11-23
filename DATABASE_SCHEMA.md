# Database Schema

## Tables Overview

### Voucher
Discount codes that apply to entire orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | String | Unique voucher code |
| discountType | Enum | PERCENT or FIXED |
| discountValue | Float | Discount amount |
| minOrderValue | Float? | Minimum order total required |
| usageLimit | Int? | Maximum uses allowed |
| usedCount | Int | Current usage count |
| expiresAt | DateTime? | Expiration date |
| isActive | Boolean | Whether voucher is active |

### Promotion
Discounts for specific categories or items.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | String | Unique promotion code |
| discountType | Enum | PERCENT or FIXED |
| discountValue | Float | Discount amount |
| usageLimit | Int? | Maximum uses allowed |
| usedCount | Int | Current usage count |
| expiresAt | DateTime? | Expiration date |
| isActive | Boolean | Whether promotion is active |

### Category
Product categories for organizing items.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Unique category name |
| description | String? | Category description |

### Item
Products that can be ordered.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | String | Item name |
| price | Float | Item price |
| categoryId | UUID | Foreign key to Category |

### Order
Customer orders with applied discounts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| total | Float | Original order total |
| currency | String | Currency code (default: USD) |
| appliedVoucherId | UUID? | Foreign key to Voucher |
| appliedPromotionId | UUID? | Foreign key to Promotion |
| discountTotal | Float | Total discount applied |
| finalTotal | Float | Final amount after discount |

### OrderItem
Line items in an order.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| orderId | UUID | Foreign key to Order |
| itemId | UUID | Foreign key to Item |
| qty | Int | Quantity ordered |
| priceAtPurchase | Float | Price snapshot at order time |

### PromotionCategory (Junction)
Links promotions to eligible categories.

| Column | Type | Description |
|--------|------|-------------|
| promotionId | UUID | Foreign key to Promotion |
| categoryId | UUID | Foreign key to Category |

### PromotionItem (Junction)
Links promotions to eligible items.

| Column | Type | Description |
|--------|------|-------------|
| promotionId | UUID | Foreign key to Promotion |
| itemId | UUID | Foreign key to Item |

## Relationships

```
Category 1──────∞ Item
    │               │
    │               │
    ∞               ∞
PromotionCategory  PromotionItem
    ∞               ∞
    │               │
    └───────┬───────┘
            │
        Promotion ∞──────1 Order 1──────1 Voucher
                            │
                            ∞
                        OrderItem
                            ∞
                            │
                          Item
```

### Key Relationships

1. **Category → Items**: One category has many items
2. **Promotion → Categories/Items**: Many-to-many through junction tables
3. **Order → Voucher**: One voucher per order (optional)
4. **Order → Promotion**: One promotion per order (optional)
5. **Order → OrderItems**: One order has many line items
6. **OrderItem → Item**: References the purchased item

### Indexes

- `Voucher.code` - Unique, for fast lookup
- `Voucher.expiresAt` - For filtering expired vouchers
- `Promotion.code` - Unique, for fast lookup
- `Promotion.expiresAt` - For filtering expired promotions
- `Category.name` - Unique, for fast lookup
- `Item.categoryId` - For category filtering
- `Order.appliedVoucherId` - For voucher usage tracking
- `Order.appliedPromotionId` - For promotion usage tracking
- `OrderItem.orderId` - For order item retrieval
- `OrderItem.itemId` - For item sales tracking

### Cascade Rules

- Deleting a Promotion cascades to PromotionCategory and PromotionItem
- OrderItems reference Items but don't cascade (preserve history)
