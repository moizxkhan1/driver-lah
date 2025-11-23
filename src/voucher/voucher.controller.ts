import { Router, Request, Response, NextFunction } from 'express';
import { voucherService } from './voucher.service';
import { createVoucherSchema, updateVoucherSchema } from './voucher.schema';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Voucher:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         code:
 *           type: string
 *         discountType:
 *           type: string
 *           enum: [PERCENT, FIXED]
 *         discountValue:
 *           type: number
 *         minOrderValue:
 *           type: number
 *         usageLimit:
 *           type: integer
 *         usedCount:
 *           type: integer
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/vouchers:
 *   post:
 *     summary: Create a new voucher
 *     tags: [Vouchers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, discountType, discountValue]
 *             properties:
 *               code:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [PERCENT, FIXED]
 *               discountValue:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               usageLimit:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Voucher created successfully
 *       409:
 *         description: Voucher code already exists
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createVoucherSchema.parse(req.body);
    const voucher = await voucherService.create(data);
    res.status(201).json(voucher);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     summary: Get all vouchers
 *     tags: [Vouchers]
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Filter for active vouchers only
 *     responses:
 *       200:
 *         description: List of vouchers
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const vouchers = await voucherService.findAll(activeOnly);
    res.json(vouchers);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/vouchers/{code}:
 *   get:
 *     summary: Get a voucher by code
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voucher found
 *       404:
 *         description: Voucher not found
 */
router.get('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const voucher = await voucherService.findByCode(req.params.code);
    res.json(voucher);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/vouchers/{code}:
 *   patch:
 *     summary: Update a voucher
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Voucher'
 *     responses:
 *       200:
 *         description: Voucher updated
 *       404:
 *         description: Voucher not found
 */
router.patch('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateVoucherSchema.parse(req.body);
    const voucher = await voucherService.update(req.params.code, data);
    res.json(voucher);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/vouchers/{code}:
 *   delete:
 *     summary: Delete a voucher
 *     tags: [Vouchers]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Voucher deleted
 *       404:
 *         description: Voucher not found
 */
router.delete('/:code', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await voucherService.delete(req.params.code);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as voucherRouter };
