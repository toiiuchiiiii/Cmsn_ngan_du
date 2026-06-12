import { Router } from 'express';
import { TestTemplateRepository } from '../../repositories/test-template.repository.js';
import { TestTemplateService } from '../../services/test-template.service.js';
import { testTemplateController } from '../../controllers/test-template.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createTestTemplateSchema, updateTestTemplateSchema } from '../../validators/test-template.schema.js';

const router = Router();

const repo = new TestTemplateRepository();
const service = new TestTemplateService(repo);
const controller = testTemplateController(service);

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, requireRole('admin', 'therapist'), validate(createTestTemplateSchema), controller.create);
router.put('/:id', authenticate, requireRole('admin', 'therapist'), validate(updateTestTemplateSchema), controller.update);
router.delete('/:id', authenticate, requireRole('admin', 'therapist'), controller.delete);

export default router;
