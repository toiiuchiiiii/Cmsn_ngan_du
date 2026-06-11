import type { WebSocket } from 'ws';
import type { RoomManager } from '../rooms.js';
import { MessageRepository } from '../../repositories/message.repository.js';
import { ConversationRepository } from '../../repositories/conversation.repository.js';
import { logger } from '../../utils/logger.js';

interface MessageSendPayload {
  conversationId: number;
  text: string;
}

export function messageHandler(
  ws: WebSocket,
  userId: number,
  payload: MessageSendPayload,
  roomManager: RoomManager,
  messageRepo: MessageRepository,
  conversationRepo: ConversationRepository
): void {
  const { conversationId, text } = payload;

  if (!conversationId || !text || text.length > 5000) {
    ws.send(JSON.stringify({ event: 'error', payload: { message: 'Dữ liệu tin nhắn không hợp lệ' } }));
    return;
  }

  conversationRepo
    .isParticipant(conversationId, userId)
    .then((isParticipant) => {
      if (!isParticipant) {
        ws.send(JSON.stringify({ event: 'error', payload: { message: 'Bạn không phải thành viên của cuộc trò chuyện này' } }));
        return;
      }

      return messageRepo.create({ conversationId, senderId: userId, text });
    })
    .then((message) => {
      if (!message) return;

      return conversationRepo.updateTimestamp(conversationId).then(() => {
        const channel = `conversation:${conversationId}`;
        roomManager.broadcast(channel, 'message.new', message);

        logger.info({ messageId: message.id, conversationId, userId }, 'WS message sent');
      });
    })
    .catch((err) => {
      logger.error({ err, conversationId, userId }, 'WS message handler error');
      ws.send(JSON.stringify({ event: 'error', payload: { message: 'Lỗi gửi tin nhắn' } }));
    });
}
