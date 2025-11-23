# Drive Lah - Vouchers & Promotions API

A Node.js + TypeScript backend for managing vouchers, promotions, and applying discounts to orders.

## Tech Stack

- Node.js + Express + TypeScript
- PostgreSQL (Neon) + Prisma ORM
- Zod validation
- Jest for testing
- Swagger UI for API docs

## Quick Start

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env`:
   ```
   DATABASE_URL=your_postgresql_url
   NODE_ENV=development
   PORT=3000
   ```

3. Setup database:
   ```bash
   npm run prisma:generate
   npx prisma db push
   npm run seed
   ```

4. Run:
   ```bash
   npm run dev
   ```

Server starts at `http://localhost:3000`

API Docs: `http://localhost:3000/api-docs`

## Deployment

**Platform:** Render (Web Service)  
**Database:** Neon (PostgreSQL)

### Render Configuration

**Build Command:**
```
npm install && npm run build && npx prisma generate && npx prisma db push
```

**Start Command:**
```
npm start
```

**Environment Variables:**
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
```

## Core Logic

### Discount Calculation Flow

1. **Voucher Validation** - Check active, not expired, usage limit, minimum order value
2. **Promotion Validation** - Check active, not expired, filter eligible items by category/item
3. **Combined Discount** - Sum discounts, apply 50% maximum cap

### Business Rules

- **Vouchers**: Apply to entire order, require minimum order value
- **Promotions**: Apply only to eligible items (by category or item ID)
- **Cap**: Total discount cannot exceed 50% of order total

## Testing

```bash
npm test
```

## Documentation

- `DATABASE_SCHEMA.md` - Database tables and relationships
- `API_GUIDE.md` - API endpoints and testing flow

## License

ISC
