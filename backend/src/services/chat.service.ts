import { ConversationRepository } from '../repositories/conversation.repository.js';
import { MessageRepository } from '../repositories/message.repository.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { getRoomManager } from '../websocket/registry.js';

export class ChatService {
  constructor(
    private conversationRepo: ConversationRepository,
    private messageRepo: MessageRepository
  ) {}

  async createConversation(creatorId: number, contactId: number) {
    if (creatorId === contactId) {
      const existing = await this.conversationRepo.findExistingPrivateConversation(creatorId, contactId);
      if (existing) return existing;
    }

    const existing = await this.conversationRepo.findExistingPrivateConversation(creatorId, contactId);
    if (existing) return existing;

    const conversation = await this.conversationRepo.create({});

    await this.conversationRepo.addParticipants([
      { conversationId: conversation.id, userId: creatorId, joinedAt: new Date(), lastReadAt: new Date() },
      { conversationId: conversation.id, userId: contactId, joinedAt: new Date(), lastReadAt: new Date() },
    ]);

    logger.info({ conversationId: conversation.id, creatorId, contactId }, 'Conversation created');
    return conversation;
  }

  async getConversations(userId: number) {
    return this.conversationRepo.findByUserId(userId);
  }

  async getConversationDetail(id: number, userId: number) {
    const conversation = await this.conversationRepo.findById(id);
    if (!conversation) throw new NotFoundError('cuộc trò chuyện');

    const isParticipant = await this.conversationRepo.isParticipant(id, userId);
    if (!isParticipant) throw new ForbiddenError('Bạn không phải thành viên của cuộc trò chuyện này');

    const participants = await this.conversationRepo.findParticipants(id);
    return { conversation, participants };
  }

  async getMessages(conversationId: number, userId: number, cursor?: number) {
    const isParticipant = await this.conversationRepo.isParticipant(conversationId, userId);
    if (!isParticipant) throw new ForbiddenError('Bạn không phải thành viên của cuộc trò chuyện này');

    return this.messageRepo.findByConversationId(conversationId, cursor);
  }

  async sendMessage(conversationId: number, senderId: number, text: string) {
    const isParticipant = await this.conversationRepo.isParticipant(conversationId, senderId);
    if (!isParticipant) throw new ForbiddenError('Bạn không phải thành viên của cuộc trò chuyện này');

    const message = await this.messageRepo.create({
      conversationId,
      senderId,
      text,
    });

    await this.conversationRepo.updateTimestamp(conversationId);

    try {
      const channel = `conversation:${conversationId}`;
      getRoomManager().broadcast(channel, 'message.new', message);
    } catch {
      // RoomManager not initialized yet (WS not ready)
    }

    logger.info({ messageId: message.id, conversationId, senderId }, 'Message sent');
    return message;
  }

  async markAsRead(conversationId: number, userId: number, messageIds: number[]) {
    const isParticipant = await this.conversationRepo.isParticipant(conversationId, userId);
    if (!isParticipant) throw new ForbiddenError('Bạn không phải thành viên của cuộc trò chuyện này');

    await this.conversationRepo.markAsRead(conversationId, userId, messageIds);

    logger.info({ conversationId, userId, messageIds }, 'Messages marked as read');
  }
}
