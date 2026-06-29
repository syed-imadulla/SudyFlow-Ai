import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, PLANNER_EVENT_TYPE } from '../constants/index.js';
import mongoose from 'mongoose';

/**
 * Helper to normalize backward compatible values
 */
const normalizePlannerPayload = (body) => {
  if (!body || typeof body !== 'object') return;

  if (body.type && typeof body.type === 'string') {
    const lower = body.type.toLowerCase().trim();
    const map = {
      'focus': PLANNER_EVENT_TYPE.STUDY,
      'study': PLANNER_EVENT_TYPE.STUDY,
      'review': PLANNER_EVENT_TYPE.REVIEW,
      'deep': PLANNER_EVENT_TYPE.DEEP_WORK,
      'deep_work': PLANNER_EVENT_TYPE.DEEP_WORK,
      'class': PLANNER_EVENT_TYPE.CLASS,
      'personal': PLANNER_EVENT_TYPE.PERSONAL,
      'other': PLANNER_EVENT_TYPE.OTHER
    };
    if (map[lower]) {
      body.type = map[lower];
    } else {
      const upper = body.type.toUpperCase().trim();
      if (Object.values(PLANNER_EVENT_TYPE).includes(upper)) {
        body.type = upper;
      }
    }
  }
};

export const validateCreatePlannerEvent = (req, res, next) => {
  normalizePlannerPayload(req.body);
  const { title, startTime, endTime, type, goalId } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Event title is required', HTTP_STATUS.BAD_REQUEST));
  }

  if (!startTime || isNaN(new Date(startTime).getTime())) {
    return next(new AppError('Valid startTime date string is required', HTTP_STATUS.BAD_REQUEST));
  }

  if (!endTime || isNaN(new Date(endTime).getTime())) {
    return next(new AppError('Valid endTime date string is required', HTTP_STATUS.BAD_REQUEST));
  }

  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    return next(new AppError('startTime must be strictly earlier than endTime', HTTP_STATUS.BAD_REQUEST));
  }

  if (type !== undefined && !Object.values(PLANNER_EVENT_TYPE).includes(type)) {
    return next(new AppError('Invalid planner event type.\nAllowed values:\nSTUDY, REVIEW, DEEP_WORK, CLASS, PERSONAL, OTHER', HTTP_STATUS.BAD_REQUEST));
  }

  if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
    return next(new AppError('Invalid Goal ID reference format', HTTP_STATUS.BAD_REQUEST));
  }

  next();
};

export const validateUpdatePlannerEvent = (req, res, next) => {
  const { id } = req.params || {};
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Planner Event ID format', HTTP_STATUS.BAD_REQUEST));
  }

  normalizePlannerPayload(req.body);
  const { title, startTime, endTime, type, goalId } = req.body || {};

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return next(new AppError('Event title cannot be empty', HTTP_STATUS.BAD_REQUEST));
  }

  if (startTime !== undefined && isNaN(new Date(startTime).getTime())) {
    return next(new AppError('Valid startTime date string is required', HTTP_STATUS.BAD_REQUEST));
  }

  if (endTime !== undefined && isNaN(new Date(endTime).getTime())) {
    return next(new AppError('Valid endTime date string is required', HTTP_STATUS.BAD_REQUEST));
  }

  if (startTime !== undefined && endTime !== undefined) {
    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      return next(new AppError('startTime must be strictly earlier than endTime', HTTP_STATUS.BAD_REQUEST));
    }
  }

  if (type !== undefined && !Object.values(PLANNER_EVENT_TYPE).includes(type)) {
    return next(new AppError('Invalid planner event type.\nAllowed values:\nSTUDY, REVIEW, DEEP_WORK, CLASS, PERSONAL, OTHER', HTTP_STATUS.BAD_REQUEST));
  }

  if (goalId !== undefined && goalId !== null && !mongoose.Types.ObjectId.isValid(goalId)) {
    return next(new AppError('Invalid Goal ID reference format', HTTP_STATUS.BAD_REQUEST));
  }

  next();
};
