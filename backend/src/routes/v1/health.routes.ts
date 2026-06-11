import { Router } from 'express';
import { checkDatabase } from '../../config/database.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbHealthy = await checkDatabase();

  const status = dbHealthy ? 'healthy' : 'degraded';

  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: dbHealthy ? 'up' : 'down',
    },
  });
});

router.get('/health/ready', (_req, res) => {
  res.status(200).json({ status: 'ready' });
});

router.get('/health/live', (_req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;
