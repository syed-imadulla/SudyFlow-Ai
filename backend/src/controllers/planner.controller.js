import { catchAsync } from '../utils/asyncWrapper.js';
import { PlannerService } from '../services/planner.service.js';
import { HTTP_STATUS } from '../constants/index.js';
import { logger } from '../utils/logger.js';

export class PlannerController {
  static getEvents = catchAsync(async (req, res) => {
    const events = await PlannerService.getEvents(req.user._id, req.query);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  static getEventById = catchAsync(async (req, res) => {
    const event = await PlannerService.getEventById(req.user._id, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: event
    });
  });

  static createEvent = catchAsync(async (req, res) => {
    const event = await PlannerService.createEvent(req.user._id, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      statusCode: HTTP_STATUS.CREATED,
      data: event
    });
  });

  static scheduleMilestone = catchAsync(async (req, res) => {
    const event = await PlannerService.scheduleMilestone(req.user._id, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      statusCode: HTTP_STATUS.CREATED,
      data: event
    });
  });

  static updateEvent = catchAsync(async (req, res) => {
    const event = await PlannerService.updateEvent(req.user._id, req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: event
    });
  });

  static deleteEvent = catchAsync(async (req, res) => {
    await PlannerService.deleteEvent(req.user._id, req.params.id, req.query);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      message: 'Planner event deleted successfully'
    });
  });

  static getToday = catchAsync(async (req, res) => {
    const events = await PlannerService.getTodayEvents(req.user._id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  static getWeek = catchAsync(async (req, res) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();
    const day = now.getDay();
    const startOfWeek = new Date(Date.UTC(year, month, date - day, 0, 0, 0));
    const endOfWeek = new Date(Date.UTC(year, month, date - day + 6, 23, 59, 59, 999));
    const events = await PlannerService.getEventsByRange(req.user._id, startOfWeek.toISOString(), endOfWeek.toISOString());
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  static getMonth = catchAsync(async (req, res) => {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const startOfMonth = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, monthIndex, daysInMonth, 23, 59, 59, 999));
    const events = await PlannerService.getEventsByRange(req.user._id, startOfMonth.toISOString(), endOfMonth.toISOString());
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  // UI compatibility endpoints
  static getDailyBlocks = catchAsync(async (req, res) => {
    logger.debug({ date: req.query.date, reqId: req.id, userId: req.user?._id }, '[AUDIT: Controller] GET /planner/daily called with query date');
    const events = req.query.date
      ? await PlannerService.getEventsForDate(req.user._id, req.query.date)
      : await PlannerService.getTodayEvents(req.user._id);
    logger.debug({ eventsCount: events ? events.length : 0, reqId: req.id, userId: req.user?._id }, '[AUDIT: Controller] GET /planner/daily returning events count');
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  static getUpcomingDeadlines = catchAsync(async (req, res) => {
    const deadlines = await PlannerService.getUpcomingDeadlines(req.user._id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: deadlines
    });
  });

  static getWeeklyStats = catchAsync(async (req, res) => {
    const stats = await PlannerService.getWeeklyStats(req.user._id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: stats
    });
  });

  static getMonthlyCalendar = catchAsync(async (req, res) => {
    const calendar = await PlannerService.getMonthlyCalendar(req.user._id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: calendar
    });
  });

  static getEventsByRange = catchAsync(async (req, res) => {
    const { start, end } = req.query;
    const events = await PlannerService.getEventsByRange(req.user._id, start, end);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });
}

