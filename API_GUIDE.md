# API Guide & Testing Flow

Base URL: `http://localhost:3000` (dev) or your Render URL

## Complete Testing Flow

Follow this sequence to test the full functionality:

### Step 1: Create a Category

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "electronics",
    "description": "Electronic devices"
  }'
```

Response (201):
```json
{
  "id": "uuid-here",
  "name": "electronics",
  "description": "Electronic devices"
}
```

### Step 2: Create a Voucher

```bash
curl -X POST http://localhost:3000/api/vouchers \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE10",
    "discountType": "PERCENT",
    "discountValue": 10,
    "minOrderValue": 50,
    "usageLimit": 100,
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

Response (201):
```json
{
  "id": "uuid-here",
  "code": "SAVE10",
  "discountType": "PERCENT",
  "discountValue": 10,
  "minOrderValue": 50,
  "usageLimit": 100,
  "usedCount": 0,
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "isActive": true
}
```

### Step 3: Create a Promotion

```bash
curl -X POST http://localhost:3000/api/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ELECTRONICS20",
    "discountType": "PERCENT",
    "discountValue": 20,
    "usageLimit": 200,
    "expiresAt": "2025-12-31T23:59:59Z",
    "eligibleCategories": ["electronics-category-id"]
  }'
```

### Step 4: Preview Discount (No DB changes)

```bash
curl -X POST http://localhost:3000/api/orders/apply \
  -H "Content-Type: application/json" \
  -d '{
    "total": 200,
    "items": [
      {
        "id": "item-uuid",
        "categoryId": "category-uuid",
        "qty": 1,
        "price": 200
      }
    ],
    "voucherCode": "SAVE10",
    "promotionCode": "ELECTRONICS20"
  }'
```

Response (200):
```json
{
  "total": 200,
  "discountTotal": 60,
  "finalTotal": 140,
  "appliedVoucher": {
    "code": "SAVE10",
    "discount": 20
  },
  "appliedPromotion": {
    "code": "ELECTRONICS20",
    "discount": 40,
    "eligibleItems": ["item-uuid"]
  }
}
```

### Step 5: Create Order (Increments usage counts)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "total": 200,
    "items": [
      {
        "id": "item-uuid",
        "categoryId": "category-uuid",
        "qty": 1,
        "price": 200
      }
    ],
    "voucherCode": "SAVE10",
    "promotionCode": "ELECTRONICS20"
  }'
```

Response (201): Full order with discount breakdown

---

## All Endpoints

### Vouchers

#### Create Voucher
`POST /api/vouchers`

```json
{
  "code": "SUMMER25",
  "discountType": "PERCENT",  // or "FIXED"
  "discountValue": 25,
  "minOrderValue": 100,       // optional
  "usageLimit": 50,           // optional
  "expiresAt": "2025-12-31",  // optional
  "isActive": true            // optional, default true
}
```

#### List Vouchers
`GET /api/vouchers?activeOnly=true`

#### Get Voucher
`GET /api/vouchers/:code`

#### Update Voucher
`PATCH /api/vouchers/:code`

```json
{
  "discountValue": 30,
  "isActive": false
}
```

#### Delete Voucher
`DELETE /api/vouchers/:code`

---

### Promotions

#### Create Promotion
`POST /api/promotions`

```json
{
  "code": "FASHION15",
  "discountType": "PERCENT",
  "discountValue": 15,
  "usageLimit": 100,
  "expiresAt": "2025-12-31",
  "eligibleCategories": ["category-id-1", "category-id-2"],
  "eligibleItemIds": ["item-id-1"]
}
```

#### List Promotions
`GET /api/promotions?activeOnly=true`

#### Get Promotion
`GET /api/promotions/:code`

#### Update Promotion
`PATCH /api/promotions/:code`

#### Delete Promotion
`DELETE /api/promotions/:code`

---

### Orders

#### Preview Discount
`POST /api/orders/apply`

Use this to calculate discounts without creating an order or incrementing usage counts.

#### Create Order
`POST /api/orders`

Creates the order and increments voucher/promotion usage counts.

Request body (same for both):
```json
{
  "total": 150,
  "items": [
    {
      "id": "item-uuid",
      "categoryId": "category-uuid",
      "qty": 2,
      "price": 75
    }
  ],
  "voucherCode": "SAVE10",      // optional
  "promotionCode": "FASHION15"  // optional
}
```

---

### Categories

#### Create Category
`POST /api/categories`

```json
{
  "name": "accessories",
  "description": "Fashion accessories"
}
```

#### List Categories
`GET /api/categories`

Returns categories with item counts.

#### Get Category with Items
`GET /api/categories/:id`

#### Update Category
`PATCH /api/categories/:id`

#### Delete Category
`DELETE /api/categories/:id`

---

## Error Responses

### Validation Error (400)
```json
{
  "error": "Validation Error",
  "details": [
    {
      "path": ["discountValue"],
      "message": "Number must be greater than 0"
    }
  ]
}
```

### Not Found (404)
```json
{
  "error": "Voucher not found"
}
```

### Conflict (409)
```json
{
  "error": "Voucher with code SAVE10 already exists"
}
```

### Business Rule Violation (400)
```json
{
  "error": "Voucher SAVE10 has expired"
}
```

```json
{
  "error": "Order total $30 is below minimum order value $50 for voucher SAVE10"
}
```

---

## Testing with Seed Data

After running `npm run seed`, you'll have:

**Vouchers:**
- `SAVE10` - 10% off, min $50
- `FLAT20` - $20 off, min $100
- `WELCOME15` - 15% off, no restrictions

**Promotions:**
- `ELECTRONICS20` - 20% off electronics
- `FASHION15` - 15% off fashion
- `SPECIAL50` - 50% off (will be capped)

**Categories & Items:**
- Electronics: Laptop Pro 15 ($999.99), Smartphone X ($699.99)
- Fashion: Cotton T-Shirt ($29.99), Classic Jeans ($79.99)
- Accessories: Smart Watch ($299.99)

### Example: Test with Seed Data

Get items first:
```bash
curl http://localhost:3000/api/categories
```

Then create order with real IDs:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "total": 999.99,
    "items": [
      {
        "id": "laptop-item-id",
        "categoryId": "electronics-category-id",
        "qty": 1,
        "price": 999.99
      }
    ],
    "voucherCode": "SAVE10",
    "promotionCode": "ELECTRONICS20"
  }'
```

---

## Swagger UI

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

Export OpenAPI spec:
```
http://localhost:3000/api-docs.json
```
