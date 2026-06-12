import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/mindwell',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'mindwell-access-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'mindwell-refresh-secret-change-in-production',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  bcrypt: {
    rounds: 10,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@mindwell.com',
  },
};
