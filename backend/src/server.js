import app from './app.js';
import { config } from './config/index.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

// Handle synchronous uncaught exceptions immediately
process.on('uncaughtException', (err) => {
  logger.error(err, '[CRITICAL] Uncaught Exception! Terminating process...');
  process.exit(1);
});

let server;

/**
 * Orchestrate clean application startup sequence
 */
const startServer = async () => {
  // 1. Establish database connection
  await connectDB();

  // 2. Initialize HTTP server listening socket
  server = app.listen(config.port, () => {
    logger.info(`[StudyFlow API] Server operational in ${config.env} mode on port ${config.port}`);
  });

  // Handle socket binding collisions (e.g. EADDRINUSE)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`[CRITICAL] Port ${config.port} is already in use. Please terminate conflicting processes or update PORT in .env.`);
    } else {
      logger.error(err, `[CRITICAL] Server Socket Error: ${err.message}`);
    }
    process.exit(1);
  });
};

/**
 * Deterministic Graceful Shutdown Sequence
 */
const gracefulShutdown = async (signal) => {
  logger.info(`[Lifecycle] Received ${signal}. Initiating graceful shutdown sequence...`);

  if (server) {
    // Stop accepting new HTTP requests and allow active requests to finish
    server.close(async () => {
      logger.info('[Lifecycle] HTTP server closed.');
      // Terminate database connection pool
      await disconnectDB();
      logger.info('[Lifecycle] Shutdown sequence completed cleanly.');
      process.exit(0);
    });

    // Fallback safety timeout in case active requests hang indefinitely
    setTimeout(() => {
      logger.error('[CRITICAL] Forced shutdown timeout reached. Terminating process immediately.');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

// Listen for termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle asynchronous unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(err, '[CRITICAL] Unhandled Promise Rejection! Initiating shutdown...');
  gracefulShutdown('unhandledRejection');
});

startServer();
