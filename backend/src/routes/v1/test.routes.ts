import { Router } from 'express';
import { TestService } from '../../services/test.service.js';
import { TestRepository } from '../../repositories/test.repository.js';
import { testController } from '../../controllers/test.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { submitTestSchema } from '../../validators/test.schema.js';

const router = Router();

const testRepo = new TestRepository();
const service = new TestService(testRepo);
const controller = testController(service);

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, validate(submitTestSchema), controller.create);

export default router;
