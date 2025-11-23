# Backend Developer Assessment Plan

## Context
- Build a minimal, clean Node.js + TypeScript backend (no NestJS) for vouchers and promotions.
- Core features: CRUD for vouchers/promotions, apply to orders with rules: expiry, usage limits, eligibility by min order or item/category, single-use per order, max discount cap (50%), ineligible items rejected, correct discount math.
- Persistence: PostgreSQL via TypeORM or Prisma (keep simple); clear relationships and constraints.
- Deliverables: deployed URL (Render/Heroku + free Postgres), Swagger/OpenAPI (still simplest) + Postman, README with setup/deploy notes, code repo, and .env.example for required envs.

## Architecture
- Light Express + TypeScript app with feature folders: voucher, promotion, order, common.
- Validation with Zod or class-validator (routing-controllers optional) + global error handler; Config loader for envs with .env.example.
- Swagger docs via `swagger-ui-express` + OpenAPI spec definition; export to Postman.
- DB layer with TypeORM/Prisma; use transactions for usage increments.

## Data Model (PostgreSQL)
- voucher: id, code (unique), discountType (PERCENT|FIXED), discountValue, minOrderValue, usageLimit, usedCount, expiresAt, isActive, timestamps.
- promotion: id, code (unique), discountType, discountValue, usageLimit, usedCount, expiresAt, isActive, eligibleCategories (text[]), eligibleItemIds (text[]), timestamps.
- order: id, total, currency, items JSON (id, categoryId, price, qty), appliedVoucherId?, appliedPromotionId?, discountTotal, finalTotal, timestamps.
- Indexes: unique(code), expiresAt; check constraints discountValue > 0; enums if supported.

## Rules & Apply Logic
- Reject expired/inactive/overused; enforce minOrderValue; prevent reuse same code in one order.
- Eligibility: promotions apply only to eligible categories/items; voucher primarily min order. If both lists present, eligible when category or item matches.
- Max discount cap: discount <= 50% of order total; cap fixed discounts similarly.
- Discount calc: percentage on eligible subtotal (or full order for vouchers without eligibility), cap, finalTotal = total - discount.
- Usage counts incremented in DB transaction to avoid races.

## API Surface (Express routes)
- Vouchers: POST /vouchers, GET /vouchers, GET /vouchers/:code, PATCH /vouchers/:code, DELETE /vouchers/:code.
- Promotions: same shape at /promotions.
- Orders: POST /orders/apply to compute/apply voucher/promotion; optionally POST /orders to persist finalized order.
- Bonus: JWT middleware on mutating endpoints; simple rate limit middleware on apply/mutating routes.

## Implementation Steps
1) Bootstrap Express + TypeScript project; add config loader, request validation, global error handler; wire Swagger UI.
2) Create .env.example covering DB connection, JWT secret (if used), rate limit config, port, NODE_ENV.
3) Add ORM (TypeORM/Prisma) + Postgres config; define entities/schema + migrations; add indexes/constraints.
4) Implement voucher/promotion services + controllers (CRUD + list filters for active/available).
5) Implement order apply logic: eligibility checks, cap logic, discount math, transactional usage increment; controller endpoint.
6) Add basic tests for rule edges (expiry, usage limit, min order, eligibility, 50% cap, duplicate use).
7) Optional seed script for sample vouchers/promotions.
8) Deploy to Render/Heroku with free Postgres; wire envs from .env.example; expose Swagger URL.
9) Export OpenAPI -> Postman; write README with setup/run/test/deploy instructions and API docs link.

## Risks & Mitigations
- Race conditions on usage counts: use transaction/locking when applying.
- Incorrect discount cap: unit tests on percentage vs fixed to validate 50% rule.
- Eligibility bugs: tests covering mixed item/category cases and min order edge.
- Deploy config drift: keep .env.example and config loader to avoid missing vars.
