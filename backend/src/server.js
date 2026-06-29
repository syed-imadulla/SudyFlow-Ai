import app from './app.js';
import { config } from './config/index.js';
import { connectDB, disconnectDB } from './config/db.js';

// Handle synchronous uncaught exceptions immediately
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception! Terminating process...');
  console.error(err.name, err.message, err.stack);
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
    console.log(`[StudyFlow API] Server operational in ${config.env} mode on port ${config.port}`);
  });

  // Handle socket binding collisions (e.g. EADDRINUSE)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[CRITICAL] Port ${config.port} is already in use. Please terminate conflicting processes or update PORT in .env.`);
    } else {
      console.error(`[CRITICAL] Server Socket Error: ${err.message}`);
    }
    process.exit(1);
  });
};

/**
 * Deterministic Graceful Shutdown Sequence
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n[Lifecycle] Received ${signal}. Initiating graceful shutdown sequence...`);

  if (server) {
    // Stop accepting new HTTP requests and allow active requests to finish
    server.close(async () => {
      console.log('[Lifecycle] HTTP server closed.');
      // Terminate database connection pool
      await disconnectDB();
      console.log('[Lifecycle] Shutdown sequence completed cleanly.');
      process.exit(0);
    });

    // Fallback safety timeout in case active requests hang indefinitely
    setTimeout(() => {
      console.error('[CRITICAL] Forced shutdown timeout reached. Terminating process immediately.');
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
  console.error('[CRITICAL] Unhandled Promise Rejection! Initiating shutdown...');
  console.error(err.name, err.message);
  gracefulShutdown('unhandledRejection');
});

startServer();
