"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voucherRouter = void 0;
const express_1 = require("express");
const voucher_service_1 = require("./voucher.service");
const voucher_schema_1 = require("./voucher.schema");
const router = (0, express_1.Router)();
exports.voucherRouter = router;
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
router.post('/', async (req, res, next) => {
    try {
        const data = voucher_schema_1.createVoucherSchema.parse(req.body);
        const voucher = await voucher_service_1.voucherService.create(data);
        res.status(201).json(voucher);
    }
    catch (error) {
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
router.get('/', async (req, res, next) => {
    try {
        const activeOnly = req.query.activeOnly === 'true';
        const vouchers = await voucher_service_1.voucherService.findAll(activeOnly);
        res.json(vouchers);
    }
    catch (error) {
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
router.get('/:code', async (req, res, next) => {
    try {
        const voucher = await voucher_service_1.voucherService.findByCode(req.params.code);
        res.json(voucher);
    }
    catch (error) {
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
router.patch('/:code', async (req, res, next) => {
    try {
        const data = voucher_schema_1.updateVoucherSchema.parse(req.body);
        const voucher = await voucher_service_1.voucherService.update(req.params.code, data);
        res.json(voucher);
    }
    catch (error) {
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
router.delete('/:code', async (req, res, next) => {
    try {
        await voucher_service_1.voucherService.delete(req.params.code);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=voucher.controller.js.map