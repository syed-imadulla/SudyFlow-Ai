import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, FOCUS_SESSION_TYPE, FOCUS_SESSION_STATUS } from '../constants/index.js';
import mongoose from 'mongoose';

const ALLOWED_FIELDS = [
  'type',
  'status',
  'completed',
  'startTime',
  'endTime',
  'duration',
  'goalId',
  'taskId',
  'interruptions',
  'pauseCount',
  'notes'
];

/**
 * Shared validation logic ensuring symmetry between POST and PATCH
 */
const validateFocusPayload = (req, next) => {
  const body = req.body || {};

  // Reject unknown request fields
  const unknownFields = Object.keys(body).filter((key) => !ALLOWED_FIELDS.includes(key));
  if (unknownFields.length > 0) {
    return next(new AppError(`Unknown field(s): ${unknownFields.join(', ')}`, HTTP_STATUS.BAD_REQUEST));
  }

  // Normalize completed boolean to status enum for consistency
  if (body.completed !== undefined) {
    const isCompleted = body.completed === true || body.completed === 'true';
    body.status = isCompleted ? FOCUS_SESSION_STATUS.COMPLETED : (body.status || FOCUS_SESSION_STATUS.IN_PROGRESS);
    delete body.completed;
  }

  // Normalize case for enums if string
  if (body.type && typeof body.type === 'string') {
    body.type = body.type.toUpperCase().trim();
  }
  if (body.status && typeof body.status === 'string') {
    body.status = body.status.toUpperCase().trim();
  }

  // Validate type enum
  if (body.type !== undefined && !Object.values(FOCUS_SESSION_TYPE).includes(body.type)) {
    return next(new AppError('Invalid focus session type. Allowed values: POMODORO, SHORT_BREAK, LONG_BREAK', HTTP_STATUS.BAD_REQUEST));
  }

  // Validate status enum
  if (body.status !== undefined && !Object.values(FOCUS_SESSION_STATUS).includes(body.status)) {
    return next(new AppError('Invalid focus session status. Allowed values: IN_PROGRESS, COMPLETED, ABORTED', HTTP_STATUS.BAD_REQUEST));
  }

  // Validate dates
  if (body.startTime !== undefined && isNaN(new Date(body.startTime).getTime())) {
    return next(new AppError('Valid startTime date string is required', HTTP_STATUS.BAD_REQUEST));
  }
  if (body.endTime !== undefined && isNaN(new Date(body.endTime).getTime())) {
    return next(new AppError('Valid endTime date string is required', HTTP_STATUS.BAD_REQUEST));
  }
  if (body.startTime !== undefined && body.endTime !== undefined) {
    if (new Date(body.startTime).getTime() >= new Date(body.endTime).getTime()) {
      return next(new AppError('startTime must be strictly earlier than endTime', HTTP_STATUS.BAD_REQUEST));
    }
  }

  // Validate duration
  if (body.duration !== undefined && (isNaN(body.duration) || body.duration <= 0)) {
    return next(new AppError('Duration must be greater than 0', HTTP_STATUS.BAD_REQUEST));
  }

  // Validate ObjectIds
  if (body.goalId !== undefined && body.goalId !== null && !mongoose.Types.ObjectId.isValid(body.goalId)) {
    return next(new AppError('Invalid Goal ID reference format', HTTP_STATUS.BAD_REQUEST));
  }
  if (body.taskId !== undefined && body.taskId !== null && !mongoose.Types.ObjectId.isValid(body.taskId)) {
    return next(new AppError('Invalid Task ID reference format', HTTP_STATUS.BAD_REQUEST));
  }

  // Validate numerical counts
  if (body.interruptions !== undefined && (isNaN(body.interruptions) || body.interruptions < 0)) {
    return next(new AppError('Interruptions must be a non-negative number', HTTP_STATUS.BAD_REQUEST));
  }
  if (body.pauseCount !== undefined && (isNaN(body.pauseCount) || body.pauseCount < 0)) {
    return next(new AppError('Pause count must be a non-negative number', HTTP_STATUS.BAD_REQUEST));
  }

  next();
};

export const validateCreateFocusSession = (req, res, next) => {
  validateFocusPayload(req, next);
};

export const validateUpdateFocusSession = (req, res, next) => {
  const { id } = req.params || {};
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid Focus Session ID format', HTTP_STATUS.BAD_REQUEST));
  }
  validateFocusPayload(req, next);
};

// Keep backward compatible validator exports if needed during transition
export const validateStartFocusSession = validateCreateFocusSession;
export const validateEndFocusSession = validateUpdateFocusSession;
