import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

/**
 * Extract access token from Authorization header or HttpOnly cookie
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== undefined) {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return null;
  }
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

/**
 * Mandatory Authentication Middleware
 * Validates JWT access token, checks tokenVersion revocation, and attaches decoded user profile to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AppError('Authentication required. Please provide a valid Bearer token or cookie.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== (user.tokenVersion || 0)) {
      throw new AppError('The user session has been invalidated or revoked.', HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-Based Authorization Middleware Factory
 * Verifies req.user has one of the allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN));
    }
    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches req.user if a valid token is provided and session is not revoked, otherwise proceeds silently
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && (decoded.tokenVersion === undefined || decoded.tokenVersion === (user.tokenVersion || 0))) {
      req.user = user;
    }
    next();
  } catch (err) {
    // Ignore verification failures for optional authentication
    next();
  }
};
