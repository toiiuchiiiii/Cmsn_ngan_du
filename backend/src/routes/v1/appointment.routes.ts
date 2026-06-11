import { Router } from 'express';
import { AppointmentService } from '../../services/appointment.service.js';
import { AppointmentRepository } from '../../repositories/appointment.repository.js';
import { appointmentController } from '../../controllers/appointment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from '../../validators/appointment.schema.js';

const router = Router();

const appointmentRepo = new AppointmentRepository();
const service = new AppointmentService(appointmentRepo);
const controller = appointmentController(service);

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, validate(createAppointmentSchema), controller.create);
router.patch('/:id/status', authenticate, validate(updateAppointmentStatusSchema), controller.updateStatus);
router.delete('/:id', authenticate, controller.cancel);

export default router;
