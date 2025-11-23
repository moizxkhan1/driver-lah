/* eslint-disable no-console */
import { DiscountType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const [electronics, fashion, accessories] = await Promise.all(
    [
      { name: 'electronics', description: 'Electronic devices and gadgets' },
      { name: 'fashion', description: 'Clothing and fashion items' },
      { name: 'accessories', description: 'Fashion accessories' },
    ].map((category) =>
      prisma.category.upsert({
        where: { name: category.name },
        update: category,
        create: category,
      }),
    ),
  );

  console.log('Created categories:', [electronics.name, fashion.name, accessories.name]);

  // Create items - delete existing and recreate for simplicity
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.promotionItem.deleteMany(),
    prisma.promotionCategory.deleteMany(),
    prisma.item.deleteMany(),
  ]);

  const items = await Promise.all(
    [
      { name: 'Laptop Pro 15', price: 999.99, categoryId: electronics.id },
      { name: 'Smartphone X', price: 699.99, categoryId: electronics.id },
      { name: 'Cotton T-Shirt', price: 29.99, categoryId: fashion.id },
      { name: 'Classic Jeans', price: 79.99, categoryId: fashion.id },
      { name: 'Smart Watch', price: 299.99, categoryId: accessories.id },
    ].map((item) => prisma.item.create({ data: item })),
  );

  console.log('Created items:', items.map((i) => i.name));

  // Create sample vouchers
  const vouchers = await Promise.all(
    [
      {
        code: 'SAVE10',
        discountType: DiscountType.PERCENT,
        discountValue: 10,
        minOrderValue: 50,
        usageLimit: 100,
        usedCount: 0,
        expiresAt: new Date('2025-12-31'),
        isActive: true,
      },
      {
        code: 'FLAT20',
        discountType: DiscountType.FIXED,
        discountValue: 20,
        minOrderValue: 100,
        usageLimit: 50,
        usedCount: 0,
        expiresAt: new Date('2025-12-31'),
        isActive: true,
      },
      {
        code: 'WELCOME15',
        discountType: DiscountType.PERCENT,
        discountValue: 15,
        minOrderValue: null,
        usageLimit: null,
        usedCount: 0,
        expiresAt: null,
        isActive: true,
      },
    ].map((voucher) =>
      prisma.voucher.upsert({
        where: { code: voucher.code },
        update: voucher,
        create: voucher,
      }),
    ),
  );

  console.log('Created vouchers:', vouchers.map((v) => v.code));

  // Create sample promotions with junction table relations

  const [electronicsPromo, fashionPromo, specialPromo] = await Promise.all(
    [
      {
        code: 'ELECTRONICS20',
        discountType: DiscountType.PERCENT,
        discountValue: 20,
        usageLimit: 200,
        usedCount: 0,
        expiresAt: new Date('2025-12-31'),
        isActive: true,
      },
      {
        code: 'FASHION15',
        discountType: DiscountType.PERCENT,
        discountValue: 15,
        usageLimit: 150,
        usedCount: 0,
        expiresAt: new Date('2025-12-31'),
        isActive: true,
      },
      {
        code: 'SPECIAL50',
        discountType: DiscountType.FIXED,
        discountValue: 50,
        usageLimit: 10,
        usedCount: 0,
        expiresAt: new Date('2025-06-30'),
        isActive: true,
      },
    ].map((promotion) =>
      prisma.promotion.upsert({
        where: { code: promotion.code },
        update: promotion,
        create: promotion,
      }),
    ),
  );

  // Add eligible categories for promotions
  await prisma.promotionCategory.createMany({
    data: [
      { promotionId: electronicsPromo.id, categoryId: electronics.id },
      { promotionId: fashionPromo.id, categoryId: fashion.id },
      { promotionId: fashionPromo.id, categoryId: accessories.id },
    ],
  });

  // Add eligible items for special promotion
  await prisma.promotionItem.createMany({
    data: [
      { promotionId: specialPromo.id, itemId: items[0].id }, // Laptop
      { promotionId: specialPromo.id, itemId: items[4].id }, // Smart Watch
    ],
  });

  console.log('Created promotions:', [electronicsPromo.code, fashionPromo.code, specialPromo.code]);
  console.log('Seeding completed!');
}

void (async () => {
  try {
    await main();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
