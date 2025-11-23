import { Router, Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { applyDiscountSchema, createOrderSchema } from './order.schema';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         categoryId:
 *           type: string
 *         price:
 *           type: number
 *         qty:
 *           type: integer
 *     ApplyDiscountRequest:
 *       type: object
 *       required: [total, items]
 *       properties:
 *         total:
 *           type: number
 *         currency:
 *           type: string
 *           default: USD
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         voucherCode:
 *           type: string
 *         promotionCode:
 *           type: string
 *     DiscountResult:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *         discountTotal:
 *           type: number
 *         finalTotal:
 *           type: number
 *         appliedVoucher:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             discount:
 *               type: number
 *         appliedPromotion:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *             discount:
 *               type: number
 *             eligibleItems:
 *               type: array
 *               items:
 *                 type: string
 *         ineligibleItems:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/orders/apply:
 *   post:
 *     summary: Calculate discount for an order (preview without creating)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyDiscountRequest'
 *     responses:
 *       200:
 *         description: Discount calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscountResult'
 *       400:
 *         description: Invalid voucher/promotion or eligibility error
 */
router.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = applyDiscountSchema.parse(req.body);
    const result = await orderService.applyDiscount(data);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order with discounts applied
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyDiscountRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid voucher/promotion or eligibility error
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const order = await orderService.createOrder(data);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export { router as orderRouter };
