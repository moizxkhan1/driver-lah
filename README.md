# Drive Lah - Vouchers & Promotions API

A Node.js + TypeScript backend for managing vouchers, promotions, and applying discounts to orders.

## Features

- CRUD operations for vouchers and promotions
- Apply discounts to orders with validation rules:
  - Expiry date checking
  - Usage limits
  - Minimum order value (vouchers)
  - Category/item eligibility (promotions)
  - 50% maximum discount cap
- Transactional usage tracking
- Swagger API documentation

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Zod validation
- Jest for testing
- Swagger UI for API docs

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file and configure:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` with your PostgreSQL connection string.

4. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

### Running the Application

Development mode:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

The server will start at `http://localhost:3000`

## API Documentation

Once running, access Swagger UI at: `http://localhost:3000/api-docs`

### API Endpoints

#### Vouchers
- `POST /api/vouchers` - Create a voucher
- `GET /api/vouchers` - List all vouchers
- `GET /api/vouchers/:code` - Get voucher by code
- `PATCH /api/vouchers/:code` - Update voucher
- `DELETE /api/vouchers/:code` - Delete voucher

#### Promotions
- `POST /api/promotions` - Create a promotion
- `GET /api/promotions` - List all promotions
- `GET /api/promotions/:code` - Get promotion by code
- `PATCH /api/promotions/:code` - Update promotion
- `DELETE /api/promotions/:code` - Delete promotion

#### Orders
- `POST /api/orders/apply` - Preview discount calculation
- `POST /api/orders` - Create order with discounts applied

### Example: Apply Discount

```bash
curl -X POST http://localhost:3000/api/orders/apply \
  -H "Content-Type: application/json" \
  -d '{
    "total": 150,
    "items": [
      {"id": "item1", "categoryId": "electronics", "price": 100, "qty": 1},
      {"id": "item2", "categoryId": "fashion", "price": 50, "qty": 1}
    ],
    "voucherCode": "SAVE10",
    "promotionCode": "ELECTRONICS20"
  }'
```

## Testing

Run tests:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## Deployment

### Render / Heroku

1. Set up a PostgreSQL database (free tier available)
2. Configure environment variables:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `PORT` (usually auto-assigned)
3. Build command: `npm run build && npm run prisma:generate`
4. Start command: `npm start`

## Business Rules

### Vouchers
- Require minimum order value (optional)
- Apply percentage or fixed discount to entire order
- Track usage count against limit

### Promotions
- Apply to specific categories or item IDs
- Items not matching eligibility are excluded
- Discount calculated only on eligible subtotal

### Discount Cap
- Total discount cannot exceed 50% of order total
- Applies to combined voucher + promotion discounts

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DATABASE_URL | PostgreSQL connection URL | required |
| JWT_SECRET | JWT signing secret | default-secret |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |

## License

ISC
