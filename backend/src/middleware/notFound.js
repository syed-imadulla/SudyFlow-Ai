import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

/**
 * 404 Handler for unmatched API routes.
 */
export const notFound = (req, res, next) => {
  next(new AppError(`Endpoint ${req.originalUrl} not found on this server.`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND));
};
