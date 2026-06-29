import { catchAsync } from '../utils/asyncWrapper.js';
import { PlannerService } from '../services/planner.service.js';
import { HTTP_STATUS } from '../constants/index.js';

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

  static updateEvent = catchAsync(async (req, res) => {
    const event = await PlannerService.updateEvent(req.user._id, req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: event
    });
  });

  static deleteEvent = catchAsync(async (req, res) => {
    await PlannerService.deleteEvent(req.user._id, req.params.id);
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
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    const events = await PlannerService.getEventsByRange(req.user._id, startOfWeek.toISOString(), endOfWeek.toISOString());
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  static getMonth = catchAsync(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const events = await PlannerService.getEventsByRange(req.user._id, startOfMonth.toISOString(), endOfMonth.toISOString());
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: events
    });
  });

  // UI compatibility endpoints
  static getDailyBlocks = catchAsync(async (req, res) => {
    const events = await PlannerService.getTodayEvents(req.user._id);
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
}
