import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, GOAL_STATUS, ERROR_CODES } from '../constants/index.js';
import mongoose from 'mongoose';

export const validateCreateGoal = (req, res, next) => {
  const { title, urgency, status } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Goal title is required and must be a string', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (urgency && !['URGENT', 'UPCOMING', 'ACTIVE', 'COMPLETED'].includes(urgency)) {
    return next(new AppError('Invalid urgency level provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (status && !Object.values(GOAL_STATUS).includes(status.toUpperCase())) {
    return next(new AppError('Invalid goal status provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};

export const validateUpdateGoal = (req, res, next) => {
  const { id } = req.params || {};
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Goal ID format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  const { title, urgency, status } = req.body || {};
  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return next(new AppError('Goal title cannot be empty', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (urgency !== undefined && !['URGENT', 'UPCOMING', 'ACTIVE', 'COMPLETED'].includes(urgency)) {
    return next(new AppError('Invalid urgency level provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (status !== undefined && !Object.values(GOAL_STATUS).includes(status.toUpperCase())) {
    return next(new AppError('Invalid goal status provided', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};

export const validateToggleSubtask = (req, res, next) => {
  const { goalId, subtaskId } = req.params || {};
  if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
    return next(new AppError('Invalid Goal ID format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }
  if (!subtaskId || !mongoose.Types.ObjectId.isValid(subtaskId)) {
    return next(new AppError('Invalid Subtask ID format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }
  next();
};
