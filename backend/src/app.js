import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';
import { API_PREFIX } from './constants/index.js';
import { requestId } from './middleware/requestId.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

// 1. Request Trace ID (assign early so all logs and errors correlate)
app.use(requestId);

// 2. Security HTTP Headers with enhanced production protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://ui-avatars.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// 3. Cross-Origin Resource Sharing with credentials support for HttpOnly cookies
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// 4. Global API Rate Limiter (execute BEFORE payload parsing to prevent DDoS flood processing)
app.use(API_PREFIX, apiLimiter);

// 5. HTTP Request Logging
app.use(pinoHttp({
  logger,
  customProps: (req, res) => ({
    reqId: req.id,
    userId: req.user?.id || req.user?._id || undefined,
    clientIp: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
  }),
  serializers: {
    req: (req) => {
      const sanitizedHeaders = { ...req.headers };
      delete sanitizedHeaders['authorization'];
      delete sanitizedHeaders['cookie']; // cookies can hold JWTs
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
        headers: sanitizedHeaders,
      };
    },
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
}));

// 6. Request Payload Parsing, Cookie Parsing & Compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// 7. Mount Application Route Controllers
app.use(API_PREFIX, apiRoutes);

// 8. 404 Route Handler
app.use(notFound);

// 9. Centralized Global Error Handler
app.use(errorHandler);

export default app;
