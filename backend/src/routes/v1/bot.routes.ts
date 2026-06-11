import { Router } from 'express';
import { BotService } from '../../services/bot.service.js';
import { BotReplyRepository, ChatFeedbackRepository } from '../../repositories/bot.repository.js';
import { botController } from '../../controllers/bot.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  botChatSchema,
  createBotReplySchema,
  updateBotReplySchema,
  botFeedbackSchema,
} from '../../validators/bot.schema.js';

const router = Router();

const botReplyRepo = new BotReplyRepository();
const feedbackRepo = new ChatFeedbackRepository();
const service = new BotService(botReplyRepo, feedbackRepo);
const controller = botController(service);

router.post('/chat', authenticate, validate(botChatSchema), controller.chat);
router.get('/replies', controller.listReplies);
router.post('/replies', authenticate, requireRole('admin'), validate(createBotReplySchema), controller.createReply);
router.put('/replies/:id', authenticate, requireRole('admin'), validate(updateBotReplySchema), controller.updateReply);
router.delete('/replies/:id', authenticate, requireRole('admin'), controller.deleteReply);
router.post('/feedback', authenticate, validate(botFeedbackSchema), controller.submitFeedback);

export default router;
