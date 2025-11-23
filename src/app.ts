import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './common/config';
import { errorHandler } from './common/middleware/errorHandler';
import { requestLogger } from './common/middleware/logger';
import { voucherRouter } from './voucher/voucher.controller';
import { promotionRouter } from './promotion/promotion.controller';
import { orderRouter } from './order/order.controller';
import { categoryRouter } from './category/category.controller';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
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
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/**/*.controller.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Routes
app.use('/api/vouchers', voucherRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/orders', orderRouter);
app.use('/api/categories', categoryRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

export { app };
