import mongoose from 'mongoose';
import { config } from './index.js';

/**
 * Establish connection to MongoDB Atlas cluster using Mongoose.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Error: ${error.message}`);
    // Do not crash server immediately during development if DB is not running locally
    if (config.env === 'production') {
      throw error;
    }
  }
};

/**
 * Gracefully terminate database connection during application shutdown.
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed cleanly.');
  }
};

// Connection event listeners for database telemetry
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database cluster.');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime Error: ${err}`);
});
