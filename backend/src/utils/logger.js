import pino from 'pino';
import { config } from '../config/index.js';

const env = config.env || 'development';

const loggerConfig = {
  level: env === 'production' ? 'info' : 'debug',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Pretty print in development
if (env === 'development') {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(loggerConfig);
