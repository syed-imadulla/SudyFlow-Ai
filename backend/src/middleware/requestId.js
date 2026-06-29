import { v4 as uuidv4 } from 'uuid';

/**
 * Assigns a unique X-Request-ID header to incoming requests and response headers
 * to facilitate distributed tracing and log correlation.
 */
export const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};
