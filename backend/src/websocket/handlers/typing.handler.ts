import type { WebSocket } from 'ws';
import type { RoomManager } from '../rooms.js';

interface TypingPayload {
  conversationId: number;
}

export function typingHandler(
  ws: WebSocket,
  userId: number,
  type: 'typing.start' | 'typing.stop',
  payload: TypingPayload,
  roomManager: RoomManager
): void {
  const { conversationId } = payload;

  if (!conversationId) {
    ws.send(JSON.stringify({ event: 'error', payload: { message: 'Dữ liệu không hợp lệ' } }));
    return;
  }

  const event = type === 'typing.start' ? 'typing.start' : 'typing.stop';
  const channel = `conversation:${conversationId}`;

  roomManager.broadcast(channel, event, {
    conversationId,
    userId,
  });
}
