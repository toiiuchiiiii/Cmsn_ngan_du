import type { WebSocket } from 'ws';

interface RoomEntry {
  ws: WebSocket;
  userId: number;
}

export class RoomManager {
  private rooms = new Map<string, Map<WebSocket, RoomEntry>>();
  private userSockets = new Map<number, Set<WebSocket>>();

  join(ws: WebSocket, channel: string, userId: number): void {
    if (!this.rooms.has(channel)) {
      this.rooms.set(channel, new Map());
    }

    const room = this.rooms.get(channel)!;
    room.set(ws, { ws, userId });

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(ws);
  }

  leave(ws: WebSocket, channel: string): void {
    const room = this.rooms.get(channel);
    if (!room) return;

    const entry = room.get(ws);
    if (entry) {
      const userSockets = this.userSockets.get(entry.userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          this.userSockets.delete(entry.userId);
        }
      }
    }

    room.delete(ws);
    if (room.size === 0) {
      this.rooms.delete(channel);
    }
  }

  leaveAll(ws: WebSocket): void {
    for (const [channel, room] of this.rooms.entries()) {
      if (room.has(ws)) {
        this.leave(ws, channel);
      }
    }
  }

  broadcast(channel: string, event: string, payload: unknown): void {
    const room = this.rooms.get(channel);
    if (!room) return;

    const message = JSON.stringify({ event, payload });

    for (const [, entry] of room.entries()) {
      if (entry.ws.readyState === entry.ws.OPEN) {
        entry.ws.send(message);
      }
    }
  }

  broadcastToUserSockets(userId: number, event: string, payload: unknown): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    const message = JSON.stringify({ event, payload });

    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }
  }

  getRoomSize(channel: string): number {
    return this.rooms.get(channel)?.size ?? 0;
  }

  getUsersInRoom(channel: string): number[] {
    const room = this.rooms.get(channel);
    if (!room) return [];

    const userIds = new Set<number>();
    for (const [, entry] of room.entries()) {
      userIds.add(entry.userId);
    }
    return Array.from(userIds);
  }
}
