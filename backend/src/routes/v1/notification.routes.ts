import { Router } from 'express';
import { notificationController } from '../../controllers/notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, notificationController.list);
router.get('/unread-count', authenticate, notificationController.unreadCount);
router.patch('/:id/read', authenticate, notificationController.markRead);
router.patch('/read-all', authenticate, notificationController.markAllRead);

export default router;
