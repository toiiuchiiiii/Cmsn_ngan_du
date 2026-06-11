import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

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

app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

export default app;
