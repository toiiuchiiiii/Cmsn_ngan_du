import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { closeDatabase } from './config/database.js';
import { initWebSocketServer } from './websocket/index.js';

const server = app.listen(config.port, () => {
  logger.info(`MindWell API running on port ${config.port} [${config.nodeEnv}]`);
});

initWebSocketServer(server);

function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    await closeDatabase();
    logger.info('Database connections closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
