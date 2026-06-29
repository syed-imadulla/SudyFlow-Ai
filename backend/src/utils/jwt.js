import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

const ISSUER = 'StudyFlow-AI';
const AUDIENCE = 'StudyFlow-Client';

/**
 * Generate a short-lived Access Token with strict algorithm, claims, and tokenVersion
 */
export const generateAccessToken = (userId, role, tokenVersion = 0) => {
  return jwt.sign({ id: userId, role, tokenVersion }, config.jwt.accessSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.accessExpiresIn,
    issuer: ISSUER,
    audience: AUDIENCE
  });
};

/**
 * Generate a long-lived Refresh Token with strict algorithm, claims, and tokenVersion
 */
export const generateRefreshToken = (userId, tokenVersion = 0) => {
  return jwt.sign({ id: userId, tokenVersion }, config.jwt.refreshSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: ISSUER,
    audience: AUDIENCE
  });
};

/**
 * Verify an Access Token enforcing HS256 algorithm and claims
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE
    });
  } catch (err) {
    throw new AppError('Invalid or expired access token', HTTP_STATUS.UNAUTHORIZED);
  }
};

/**
 * Verify a Refresh Token enforcing HS256 algorithm and claims
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      algorithms: ['HS256'],
      issuer: ISSUER,
      audience: AUDIENCE
    });
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
  }
};
