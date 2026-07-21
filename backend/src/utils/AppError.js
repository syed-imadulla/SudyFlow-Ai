import { ERROR_CODES } from '../constants/index.js';

/**
 * Standardized operational error class for StudyFlow AI Backend
 */
export class AppError extends Error {
  constructor(message, statusCode, errorCode = ERROR_CODES.INTERNAL_SERVER, metadata = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode;
    this.metadata = metadata;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
