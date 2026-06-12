import { Router } from 'express';
import appointmentRoutes from './v1/appointment.routes.js';
import authRoutes from './v1/auth.routes.js';
import botRoutes from './v1/bot.routes.js';
import chatRoutes from './v1/chat.routes.js';
import diaryRoutes from './v1/diary.routes.js';
import healthRoutes from './v1/health.routes.js';
import postRoutes from './v1/post.routes.js';
import testRoutes from './v1/test.routes.js';
import testTemplateRoutes from './v1/test-template.routes.js';
import adminRoutes from './v1/admin.routes.js';
import libraryRoutes from './v1/library.routes.js';
import notificationRoutes from './v1/notification.routes.js';

const router = Router();

router.use('/api/v1/appointments', appointmentRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/bot', botRoutes);
router.use('/api/v1/chat', chatRoutes);
router.use('/api/v1/diary', diaryRoutes);
router.use('/api/v1/posts', postRoutes);
router.use('/api/v1/tests', testRoutes);
router.use('/api/v1/test-templates', testTemplateRoutes);
router.use('/api/v1/admin', adminRoutes);
router.use('/api/v1/library', libraryRoutes);
router.use('/api/v1/notifications', notificationRoutes);
router.use(healthRoutes);

export default router;
