"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionRouter = void 0;
const express_1 = require("express");
const promotion_service_1 = require("./promotion.service");
const promotion_schema_1 = require("./promotion.schema");
const router = (0, express_1.Router)();
exports.promotionRouter = router;
/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
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
 *         usageLimit:
 *           type: integer
 *         usedCount:
 *           type: integer
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         eligibleCategories:
 *           type: array
 *           items:
 *             type: string
 *         eligibleItemIds:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /api/promotions:
 *   post:
 *     summary: Create a new promotion
 *     tags: [Promotions]
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
 *               usageLimit:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               eligibleCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               eligibleItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *       409:
 *         description: Promotion code already exists
 */
router.post('/', async (req, res, next) => {
    try {
        const data = promotion_schema_1.createPromotionSchema.parse(req.body);
        const promotion = await promotion_service_1.promotionService.create(data);
        res.status(201).json(promotion);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Get all promotions
 *     tags: [Promotions]
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Filter for active promotions only
 *     responses:
 *       200:
 *         description: List of promotions
 */
router.get('/', async (req, res, next) => {
    try {
        const activeOnly = req.query.activeOnly === 'true';
        const promotions = await promotion_service_1.promotionService.findAll(activeOnly);
        res.json(promotions);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/promotions/{code}:
 *   get:
 *     summary: Get a promotion by code
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Promotion found
 *       404:
 *         description: Promotion not found
 */
router.get('/:code', async (req, res, next) => {
    try {
        const promotion = await promotion_service_1.promotionService.findByCode(req.params.code);
        res.json(promotion);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/promotions/{code}:
 *   patch:
 *     summary: Update a promotion
 *     tags: [Promotions]
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
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       200:
 *         description: Promotion updated
 *       404:
 *         description: Promotion not found
 */
router.patch('/:code', async (req, res, next) => {
    try {
        const data = promotion_schema_1.updatePromotionSchema.parse(req.body);
        const promotion = await promotion_service_1.promotionService.update(req.params.code, data);
        res.json(promotion);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/promotions/{code}:
 *   delete:
 *     summary: Delete a promotion
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Promotion deleted
 *       404:
 *         description: Promotion not found
 */
router.delete('/:code', async (req, res, next) => {
    try {
        await promotion_service_1.promotionService.delete(req.params.code);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=promotion.controller.js.map