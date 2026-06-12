import type { RoomManager } from './rooms.js';

let _roomManager: RoomManager | null = null;

export function setRoomManager(rm: RoomManager): void {
  _roomManager = rm;
}

export function getRoomManager(): RoomManager {
  if (!_roomManager) {
    throw new Error('RoomManager not initialized');
  }
  return _roomManager;
}
