import type { Response } from 'express';
import { AppointmentService } from '../services/appointment.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { success, paginated } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export function appointmentController(appointmentService: AppointmentService) {
  return {
    list: asyncHandler(async (req: AuthRequest, res: Response) => {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const { entries, total } = await appointmentService.getEntries(req.userId!, page, limit);
      res.json(paginated(entries, total, page, limit));
    }),

    getById: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const appointment = await appointmentService.getEntry(id, req.userId!);
      res.json(success(appointment));
    }),

    create: asyncHandler(async (req: AuthRequest, res: Response) => {
      const { date, notes } = req.body;
      const appointment = await appointmentService.createEntry(req.userId!, { date, notes });
      res.status(201).json(success(appointment));
    }),

    updateStatus: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const { status, cancelReason } = req.body;
      const appointment = await appointmentService.updateStatus(
        id,
        req.userId!,
        req.userRole!,
        { status, cancelReason }
      );
      res.json(success(appointment));
    }),

    cancel: asyncHandler(async (req: AuthRequest, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      await appointmentService.cancelEntry(id, req.userId!, req.userRole!);
      res.json(success({ message: 'Huỷ lịch hẹn thành công' }));
    }),
  };
}
