import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, PLANNER_EVENT_TYPE, ERROR_CODES } from '../constants/index.js';
import mongoose from 'mongoose';

/**
 * Helper to normalize backward compatible values
 */
const normalizePlannerPayload = (body) => {
  if (!body || typeof body !== 'object') return;

  const rec = body.recurrence || body.recurrenceRule;
  if (rec && typeof rec === 'object') {
    if (rec.daysOfWeek && !rec.repeatDays) rec.repeatDays = rec.daysOfWeek;
    if (rec.repeatDays && !rec.daysOfWeek) rec.daysOfWeek = rec.repeatDays;
    if (rec.untilDate && !rec.repeatUntil) rec.repeatUntil = rec.untilDate;
    if (rec.repeatUntil && !rec.untilDate) rec.untilDate = rec.repeatUntil;
    body.recurrence = rec;
    body.recurrenceRule = rec;
  }

  if (body.type && typeof body.type === 'string') {
    const lower = body.type.toLowerCase().trim();
    const map = {
      'focus': PLANNER_EVENT_TYPE.STUDY,
      'study': PLANNER_EVENT_TYPE.STUDY,
      'practice': PLANNER_EVENT_TYPE.PRACTICE,
      'exam': PLANNER_EVENT_TYPE.EXAM,
      'review': PLANNER_EVENT_TYPE.REVIEW,
      'deep': PLANNER_EVENT_TYPE.DEEP_WORK,
      'deep_work': PLANNER_EVENT_TYPE.DEEP_WORK,
      'meeting': PLANNER_EVENT_TYPE.MEETING,
      'class': PLANNER_EVENT_TYPE.CLASS,
      'personal': PLANNER_EVENT_TYPE.PERSONAL,
      'coding': PLANNER_EVENT_TYPE.CODING,
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
  const { title, startTime, endTime, type, goalId, milestoneId } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new AppError('Event title is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!startTime || isNaN(new Date(startTime).getTime())) {
    return next(new AppError('Valid startTime date string is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!endTime || isNaN(new Date(endTime).getTime())) {
    return next(new AppError('Valid endTime date string is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    return next(new AppError('startTime must be strictly earlier than endTime', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (type !== undefined && !Object.values(PLANNER_EVENT_TYPE).includes(type)) {
    return next(new AppError('Invalid planner event type.\nAllowed values:\nSTUDY, PRACTICE, EXAM, REVIEW, DEEP_WORK, MEETING, PERSONAL, CODING, CLASS, TASK, OTHER', HTTP_STATUS.BAD_REQUEST));
  }

  if (goalId && !mongoose.Types.ObjectId.isValid(goalId)) {
    return next(new AppError('Invalid Goal ID reference format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (milestoneId && !mongoose.Types.ObjectId.isValid(milestoneId)) {
    return next(new AppError('Invalid Milestone ID reference format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};

export const validateUpdatePlannerEvent = (req, res, next) => {
  const { id } = req.params || {};
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Planner Event ID format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  normalizePlannerPayload(req.body);
  const { title, startTime, endTime, type, goalId, milestoneId } = req.body || {};

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return next(new AppError('Event title cannot be empty', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (startTime !== undefined && isNaN(new Date(startTime).getTime())) {
    return next(new AppError('Valid startTime date string is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (endTime !== undefined && isNaN(new Date(endTime).getTime())) {
    return next(new AppError('Valid endTime date string is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (startTime !== undefined && endTime !== undefined) {
    if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
      return next(new AppError('startTime must be strictly earlier than endTime', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
    }
  }

  if (type !== undefined && !Object.values(PLANNER_EVENT_TYPE).includes(type)) {
    return next(new AppError('Invalid planner event type.\nAllowed values:\nSTUDY, PRACTICE, EXAM, REVIEW, DEEP_WORK, MEETING, PERSONAL, CODING, CLASS, TASK, OTHER', HTTP_STATUS.BAD_REQUEST));
  }

  if (goalId !== undefined && goalId !== null && !mongoose.Types.ObjectId.isValid(goalId)) {
    return next(new AppError('Invalid Goal ID reference format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (milestoneId !== undefined && milestoneId !== null && !mongoose.Types.ObjectId.isValid(milestoneId)) {
    return next(new AppError('Invalid Milestone ID reference format', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};

export const validateScheduleMilestone = (req, res, next) => {
  const { goalId, milestoneId, startTime, endTime } = req.body || {};

  if (!goalId || !mongoose.Types.ObjectId.isValid(goalId)) {
    return next(new AppError('Valid Goal ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!milestoneId || !mongoose.Types.ObjectId.isValid(milestoneId)) {
    return next(new AppError('Valid Milestone ID is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!startTime || isNaN(new Date(startTime).getTime())) {
    return next(new AppError('Valid startTime date string is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (!endTime || isNaN(new Date(endTime).getTime())) {
    return next(new AppError('Valid endTime date string is required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    return next(new AppError('startTime must be strictly earlier than endTime', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION));
  }

  next();
};
