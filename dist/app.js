"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const config_1 = require("./common/config");
const errorHandler_1 = require("./common/middleware/errorHandler");
const logger_1 = require("./common/middleware/logger");
const voucher_controller_1 = require("./voucher/voucher.controller");
const promotion_controller_1 = require("./promotion/promotion.controller");
const order_controller_1 = require("./order/order.controller");
const category_controller_1 = require("./category/category.controller");
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(logger_1.requestLogger);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.max,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Drive Lah - Vouchers & Promotions API',
            version: '1.0.0',
            description: 'API for managing vouchers, promotions, and applying discounts to orders',
        },
        servers: [
            {
                url: `http://localhost:${config_1.config.port}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/**/*.controller.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
});
// Routes
app.use('/api/vouchers', voucher_controller_1.voucherRouter);
app.use('/api/promotions', promotion_controller_1.promotionRouter);
app.use('/api/orders', order_controller_1.orderRouter);
app.use('/api/categories', category_controller_1.categoryRouter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handler
app.use(errorHandler_1.errorHandler);
//# sourceMappingURL=app.js.map