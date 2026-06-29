import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * 404 Handler for unmatched API routes.
 */
export const notFound = (req, res, next) => {
  next(new AppError(`Endpoint ${req.originalUrl} not found on this server.`, HTTP_STATUS.NOT_FOUND));
};
