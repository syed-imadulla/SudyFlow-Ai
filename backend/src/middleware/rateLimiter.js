import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Global API rate limiter protecting backend services against general floods and DDoS attacks.
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      status: 'error',
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

/**
 * Strict Authentication rate limiter mitigating brute-force password guessing and credential stuffing.
 * Limits each IP to 5 authentication requests per 15-minute window.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      status: 'error',
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.'
    });
  }
});
