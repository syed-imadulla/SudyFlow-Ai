import { config } from '../config/index.js';
import { HTTP_STATUS } from '../constants/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Handle MongoDB duplicate key index violation errors (e.g. race condition on email registration)
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const message = field === 'email' 
    ? 'An account with this email address already exists' 
    : `Duplicate value entered for ${field} field`;
  return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Handle Mongoose schema validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = errors.join('. ');
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle Mongoose CastError (invalid ObjectId formatting)
 */
const handleCastError = (err) => {
  const message = `Invalid format for ${err.path}: ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle JWT authentication errors
 */
const handleJWTError = () => new AppError('Invalid authentication token. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', HTTP_STATUS.UNAUTHORIZED);

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
  const status = error.status || (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error');

  // Log full error details and stack trace to server console
  if (config.env === 'development') {
    console.error(`[DEV ERROR LOG] Request ID ${req.id || 'N/A'}:`, err);
  } else if (!error.isOperational) {
    console.error(`[PROD CRITICAL ERROR] Request ID ${req.id || 'N/A'}:`, err);
  }

  // Operational errors: return safe human-readable message without stack traces
  if (error.isOperational) {
    return res.status(statusCode).json({
      status,
      statusCode,
      message: error.message || err.message
    });
  }

  // Unknown / Programming errors: return standardized Internal Server Error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error'
  });
};
