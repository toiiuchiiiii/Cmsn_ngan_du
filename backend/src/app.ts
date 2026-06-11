import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, _res, next) => {
  (req as any).traceId = req.headers['x-trace-id'] || crypto.randomUUID();
  next();
});

app.use(routes);

app.use(errorHandler);

export default app;
