import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/index.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return next(new AppError('Please provide a valid name (between 2 and 100 characters)', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return next(new AppError('Please provide a valid email address', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    return next(new AppError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number', HTTP_STATUS.BAD_REQUEST));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return next(new AppError('Please provide a valid email address', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!password || typeof password !== 'string') {
    return next(new AppError('Please provide a valid password', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const { name, avatar } = req.body || {};

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)) {
    return next(new AppError('Name must be between 2 and 100 characters long', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (avatar !== undefined && (typeof avatar !== 'string' || !avatar.startsWith('http'))) {
    return next(new AppError('Avatar must be a valid URL string', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};
