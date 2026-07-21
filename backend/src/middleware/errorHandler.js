import { config } from '../config/index.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

/**
 * Handle MongoDB duplicate key index violation errors (e.g. race condition on email registration)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const message = field === 'email' 
    ? 'An account with this email address already exists' 
    : `Duplicate value entered for ${field} field`;
  return new AppError(message, HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT);
};

/**
 * Handle Mongoose schema validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = errors.join('. ');
  return new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION);
};

/**
 * Handle Mongoose CastError (invalid ObjectId formatting)
 */
const handleCastError = (err) => {
  const message = `Invalid format for ${err.path}: ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION);
};

/**
 * Handle JWT authentication errors
 */
const handleJWTError = () => new AppError('Invalid authentication token. Please log in again.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);

/**
 * Global Centralized Error Handling Middleware
 * Ensures clean, standardized JSON responses without exposing stack traces or internal DB details.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Intercept operational database & auth errors
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  // Log full error details and stack trace to server console
  if (config.env === 'development') {
    logger.error({ err, reqId: req.id, userId: req.user?.id }, `[DEV ERROR LOG] Request ID ${req.id || 'N/A'}`);
  } else if (!error.isOperational) {
    logger.error({ err, reqId: req.id, userId: req.user?.id }, `[PROD CRITICAL ERROR] Request ID ${req.id || 'N/A'}`);
  } else {
    logger.error({ err: { message: error.message, stack: error.stack }, reqId: req.id, userId: req.user?.id }, `[OPERATIONAL ERROR] Request ID ${req.id || 'N/A'}`);
  }

  // Operational errors: return safe human-readable message without stack traces
  if (error.isOperational) {
    const responsePayload = {
      success: false,
      error: {
        code: error.errorCode || ERROR_CODES.INTERNAL_SERVER,
        message: error.message || err.message
      }
    };

    if (error.metadata && Object.keys(error.metadata).length > 0) {
      responsePayload.error.metadata = error.metadata;
    }

    return res.status(statusCode).json(responsePayload);
  }

  // Unknown / Programming errors: return standardized Internal Server Error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER,
      message: 'An unexpected error occurred.'
    }
  });
};
