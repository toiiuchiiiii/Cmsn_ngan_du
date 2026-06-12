import { Router } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { users } from '../../db/schema/users.js';
import { roleRequests } from '../../db/schema/role-requests.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { success, errorResponse } from '../../utils/response.js';
import { logger } from '../../utils/logger.js';
import type { AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

// User submits a request to become therapist
router.post('/role-request', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { reason } = req.body;

  const existing = (await db.select().from(roleRequests)
    .where(and(eq(roleRequests.userId, userId), eq(roleRequests.status, 'pending')))
    .limit(1))[0];
  if (existing) {
    return res.status(400).json(errorResponse('DUPLICATE', 'Bạn đã gửi yêu cầu trước đó, vui lòng đợi phê duyệt'));
  }

  const [request] = await db.insert(roleRequests).values({
    userId,
    requestedRole: 'therapist',
    reason: reason || '',
  }).returning();

  logger.info({ userId, requestId: request.id }, 'Role request submitted');
  res.status(201).json(success(request));
}));

// Admin lists pending requests
router.get('/role-requests', authenticate, requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const requests = await db.select({
    id: roleRequests.id,
    userId: roleRequests.userId,
    reason: roleRequests.reason,
    status: roleRequests.status,
    createdAt: roleRequests.createdAt,
    userName: users.name,
    userEmail: users.email,
  })
    .from(roleRequests)
    .leftJoin(users, eq(roleRequests.userId, users.id))
    .orderBy(desc(roleRequests.createdAt));

  res.json(success(requests));
}));

// Admin approves/rejects a request
router.patch('/role-requests/:id', authenticate, requireRole('admin'), asyncHandler(async (req: AuthRequest, res) => {
  const requestId = parseInt(req.params.id as string, 10);
  const { action } = req.body;

  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json(errorResponse('INVALID_ACTION', 'Hành động không hợp lệ'));
  }

  const reqRow = (await db.select().from(roleRequests).where(eq(roleRequests.id, requestId)).limit(1))[0];
  if (!reqRow) {
    return res.status(404).json(errorResponse('NOT_FOUND', 'Yêu cầu không tồn tại'));
  }
  if (reqRow.status !== 'pending') {
    return res.status(400).json(errorResponse('ALREADY_PROCESSED', 'Yêu cầu đã được xử lý'));
  }

  await db.update(roleRequests).set({ status: action, reviewedBy: req.userId!, updatedAt: new Date() }).where(eq(roleRequests.id, requestId));

  if (action === 'approved') {
    await db.update(users).set({ role: 'therapist' }).where(eq(users.id, reqRow.userId));
  }

  logger.info({ adminId: req.userId, requestId, userId: reqRow.userId, action }, 'Role request processed');
  res.json(success({ message: action === 'approved' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu' }));
}));

export default router;
