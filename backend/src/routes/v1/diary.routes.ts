import { Router } from 'express';
import { DiaryService } from '../../services/diary.service.js';
import { DiaryRepository } from '../../repositories/diary.repository.js';
import { diaryController } from '../../controllers/diary.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createDiarySchema,
  updateDiarySchema,
} from '../../validators/diary.schema.js';

const router = Router();

const diaryRepo = new DiaryRepository();
const service = new DiaryService(diaryRepo);
const controller = diaryController(service);

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, validate(createDiarySchema), controller.create);
router.put('/:id', authenticate, validate(updateDiarySchema), controller.update);
router.delete('/:id', authenticate, controller.delete);

export default router;
