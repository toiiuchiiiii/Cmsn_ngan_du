import type { Server as HttpServer } from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { RoomManager } from './rooms.js';
import { messageHandler } from './handlers/message.handler.js';
import { typingHandler } from './handlers/typing.handler.js';
import { presenceHandler } from './handlers/presence.handler.js';
import { MessageRepository } from '../repositories/message.repository.js';
import { ConversationRepository } from '../repositories/conversation.repository.js';
import { logger } from '../utils/logger.js';
import { setRoomManager } from './registry.js';

const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 60000;

interface AuthenticatedSocket extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

const messageRepo = new MessageRepository();
const conversationRepo = new ConversationRepository();

export function initWebSocketServer(httpServer: HttpServer): RoomManager {
  const wss = new WebSocketServer({ server: httpServer });
  const roomManager = new RoomManager();

  const heartbeatTimer = setInterval(() => {
    wss.clients.forEach((ws) => {
      const socket = ws as AuthenticatedSocket;
      if (!socket.isAlive) {
        logger.info({ userId: socket.userId }, 'WS heartbeat timeout, disconnecting');
        return socket.terminate();
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, HEARTBEAT_INTERVAL);

  wss.on('close', () => {
    clearInterval(heartbeatTimer);
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const socket = ws as AuthenticatedSocket;
    socket.isAlive = true;

    const cookie = req.headers.cookie || '';
    const token = cookie
      .split(';')
      .find((c) => c.trim().startsWith('accessToken='))
      ?.split('=')[1]
      ?.trim();

    if (!token) {
      socket.close(4001, 'Vui lòng đăng nhập');
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: number; role: string };
      socket.userId = decoded.userId;
    } catch {
      socket.close(4001, 'Token hết hạn, vui lòng đăng nhập lại');
      return;
    }

    const userId = socket.userId!;
    logger.info({ userId }, 'WS client connected');

    socket.on('pong', () => {
      socket.isAlive = true;
    });

    socket.on('message', (rawData) => {
      let parsed: { type: string; payload: unknown };

      try {
        parsed = JSON.parse(rawData.toString());
      } catch {
        socket.send(JSON.stringify({ event: 'error', payload: { message: 'Dữ liệu không hợp lệ' } }));
        return;
      }

      const { type, payload } = parsed;

      switch (type) {
        case 'room.join':
          if (payload && typeof payload === 'object' && 'channel' in (payload as Record<string, unknown>)) {
            const { channel } = payload as { channel: string };
            roomManager.join(socket, channel, userId);
            socket.send(JSON.stringify({ event: 'room.joined', payload: { channel } }));
          }
          break;

        case 'room.leave':
          if (payload && typeof payload === 'object' && 'channel' in (payload as Record<string, unknown>)) {
            const { channel } = payload as { channel: string };
            roomManager.leave(socket, channel);
          }
          break;

        case 'message.send':
          messageHandler(socket, userId, payload as any, roomManager, messageRepo, conversationRepo);
          break;

        case 'typing.start':
        case 'typing.stop':
          typingHandler(socket, userId, type, payload as any, roomManager);
          break;

        case 'presence.update':
          presenceHandler(socket, userId, payload as any, roomManager);
          break;

        case 'ping':
          break;

        case 'typing':
          typingHandler(socket, userId, 'typing.start', payload as any, roomManager);
          break;

        default:
          socket.send(JSON.stringify({ event: 'error', payload: { message: `Loại tin nhắn không hỗ trợ: ${type}` } }));
      }
    });

    socket.on('close', () => {
      roomManager.leaveAll(socket);
      roomManager.broadcast('presence:global', 'presence.update', {
        userId,
        status: 'offline',
      });
      logger.info({ userId }, 'WS client disconnected');
    });

    socket.on('error', (err) => {
      logger.error({ err, userId }, 'WS client error');
    });

    roomManager.broadcast('presence:global', 'presence.update', {
      userId,
      status: 'online',
    });

    socket.send(JSON.stringify({ event: 'connected', payload: { userId } }));
  });

  setRoomManager(roomManager);
  logger.info('WebSocket server initialized');
  return roomManager;
}
