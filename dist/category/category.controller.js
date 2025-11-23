"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const category_service_1 = require("./category.service");
const category_schema_1 = require("./category.schema");
const router = (0, express_1.Router)();
exports.categoryRouter = router;
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post('/', async (req, res, next) => {
    try {
        const data = category_schema_1.createCategorySchema.parse(req.body);
        const category = await category_service_1.categoryService.create(data);
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', async (_req, res, next) => {
    try {
        const categories = await category_service_1.categoryService.findAll();
        res.json(categories);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 */
router.get('/:id', async (req, res, next) => {
    try {
        const category = await category_service_1.categoryService.findById(req.params.id);
        res.json(category);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch('/:id', async (req, res, next) => {
    try {
        const data = category_schema_1.updateCategorySchema.parse(req.body);
        const category = await category_service_1.categoryService.update(req.params.id, data);
        res.json(category);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 */
router.delete('/:id', async (req, res, next) => {
    try {
        await category_service_1.categoryService.delete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=category.controller.js.map