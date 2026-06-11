import { Router } from 'express';
import appointmentRoutes from './v1/appointment.routes.js';
import authRoutes from './v1/auth.routes.js';
import botRoutes from './v1/bot.routes.js';
import chatRoutes from './v1/chat.routes.js';
import diaryRoutes from './v1/diary.routes.js';
import healthRoutes from './v1/health.routes.js';
import postRoutes from './v1/post.routes.js';
import testRoutes from './v1/test.routes.js';

const router = Router();

router.use('/api/v1/appointments', appointmentRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/bot', botRoutes);
router.use('/api/v1/chat', chatRoutes);
router.use('/api/v1/diary', diaryRoutes);
router.use('/api/v1/posts', postRoutes);
router.use('/api/v1/tests', testRoutes);
router.use(healthRoutes);

export default router;
