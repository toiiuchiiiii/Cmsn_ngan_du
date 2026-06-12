import { Router } from 'express';
import { ChatService } from '../../services/chat.service.js';
import { ConversationRepository } from '../../repositories/conversation.repository.js';
import { MessageRepository } from '../../repositories/message.repository.js';
import { chatController } from '../../controllers/chat.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createConversationSchema,
  sendMessageSchema,
  markReadSchema,
} from '../../validators/chat.schema.js';

const router = Router();

const conversationRepo = new ConversationRepository();
const messageRepo = new MessageRepository();
const service = new ChatService(conversationRepo, messageRepo);
const controller = chatController(service);

router.get('/therapists', authenticate, controller.listTherapists);
router.get('/conversations', authenticate, controller.convList);
router.post('/conversations', authenticate, validate(createConversationSchema), controller.createConv);
router.get('/conversations/:id', authenticate, controller.convDetail);
router.get('/conversations/:id/messages', authenticate, controller.messageList);
router.post('/conversations/:id/messages', authenticate, validate(sendMessageSchema), controller.sendMessage);
router.patch('/conversations/:id/read', authenticate, validate(markReadSchema), controller.markRead);

export default router;
