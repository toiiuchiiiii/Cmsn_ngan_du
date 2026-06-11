import type { WebSocket } from 'ws';
import type { RoomManager } from '../rooms.js';

interface PresencePayload {
  status: 'online' | 'offline' | 'away';
}

export function presenceHandler(
  ws: WebSocket,
  userId: number,
  payload: PresencePayload,
  roomManager: RoomManager
): void {
  const { status } = payload;

  if (!status || !['online', 'offline', 'away'].includes(status)) {
    ws.send(JSON.stringify({ event: 'error', payload: { message: 'Trạng thái không hợp lệ' } }));
    return;
  }

  roomManager.broadcast('presence:global', 'presence.update', {
    userId,
    status,
  });
}
