import { Planner } from '../models/Planner.js';
import { Goal } from '../models/Goal.js';
import { FocusSession } from '../models/FocusSession.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, PLANNER_EVENT_TYPE } from '../constants/index.js';

export class PlannerService {
  /**
   * Fetch events with filtering (by date range, type, completed), sorting, and pagination
   */
  static async getEvents(userId, query = {}) {
    const filter = { user: userId };

    if (query.start || query.end) {
      filter.startTime = {};
      if (query.start) filter.startTime.$gte = new Date(query.start);
      if (query.end) filter.startTime.$lte = new Date(query.end);
    }

    if (query.type && typeof query.type === 'string') {
      const upper = query.type.toUpperCase();
      if (Object.values(PLANNER_EVENT_TYPE).includes(upper)) {
        filter.type = upper;
      } else {
        filter.type = query.type;
      }
    }

    if (query.completed !== undefined) {
      filter.completed = query.completed === 'true' || query.completed === true;
    }

    if (query.goalId) filter.goalId = query.goalId;

    const sort = query.sort || 'startTime';
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    return Planner.find(filter).sort(sort).skip(skip).limit(limit);
  }

  /**
   * Get single planner event by ID
   */
  static async getEventById(userId, eventId) {
    const event = await Planner.findOne({ _id: eventId, user: userId });
    if (!event) {
      throw new AppError('Planner event not found', HTTP_STATUS.NOT_FOUND);
    }
    return event;
  }

  /**
   * Fetch events by explicit date range utilizing { user: 1, startTime: 1 } index
   */
  static async getEventsByRange(userId, startIso, endIso) {
    return this.getEvents(userId, { start: startIso, end: endIso });
  }

  /**
   * Create a new planner event
   */
  static async createEvent(userId, payload) {
    return Planner.create({
      ...payload,
      user: userId
    });
  }

  /**
   * Update planner event
   */
  static async updateEvent(userId, eventId, patch) {
    const event = await Planner.findOneAndUpdate(
      { _id: eventId, user: userId },
      { $set: patch },
      { new: true, runValidators: true }
    );
    if (!event) {
      throw new AppError('Planner event not found', HTTP_STATUS.NOT_FOUND);
    }
    return event;
  }

  /**
   * Delete planner event
   */
  static async deleteEvent(userId, eventId) {
    const result = await Planner.findOneAndDelete({ _id: eventId, user: userId });
    if (!result) {
      throw new AppError('Planner event not found', HTTP_STATUS.NOT_FOUND);
    }
  }

  /**
   * Get events for Today (from 00:00:00 to 23:59:59 today)
   */
  static async getTodayEvents(userId) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    return this.getEventsByRange(userId, startOfDay.toISOString(), endOfDay.toISOString());
  }

  /**
   * Get events for specific date string (YYYY-MM-DD)
   */
  static async getEventsForDate(userId, dateStr) {
    if (dateStr && typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-').map(Number);
      const startOfDay = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
      const endOfDay = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
      return this.getEventsByRange(userId, startOfDay.toISOString(), endOfDay.toISOString());
    }
    return this.getTodayEvents(userId);
  }

  /**
   * Get upcoming deadlines across active user goals (for UI /deadlines compatibility)
   */
  static async getUpcomingDeadlines(userId) {
    const goals = await Goal.find({ user: userId, completed: false }).sort('deadline');
    return goals.map(g => ({
      id: g._id.toString(),
      title: g.title,
      dueDisplay: g.deadline ? `Due ${g.deadline}` : 'Upcoming',
      priority: g.urgency || 'ACTIVE',
      goalId: g._id.toString()
    }));
  }

  /**
   * Get dynamic weekly stats for frontend compatibility
   */
  static async getWeeklyStats(userId) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await FocusSession.find({
      user: userId,
      startTime: { $gte: sevenDaysAgo }
    });

    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const focusHours = (totalSeconds / 3600).toFixed(1) + 'h';

    const goals = await Goal.find({ user: userId });
    let totalTasks = 0;
    let doneTasks = 0;
    goals.forEach(g => {
      totalTasks += g.subtasks?.length || 0;
      doneTasks += g.subtasks?.filter(s => s.completed).length || 0;
    });

    return {
      weekLabel: 'This Week',
      focusHours,
      tasksPlanned: { done: doneTasks, total: totalTasks },
      subjectCount: goals.length
    };
  }

  /**
   * Get monthly calendar summary formatted for UI compatibility
   */
  static async getMonthlyCalendar(userId) {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const startOfMonth = new Date(year, monthIndex, 1);
    const endOfMonth = new Date(year, monthIndex, daysInMonth, 23, 59, 59);

    const events = await this.getEventsByRange(userId, startOfMonth.toISOString(), endOfMonth.toISOString());
    const goals = await Goal.find({ user: userId });

    const weeks = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasTask = events.some(e => e.startTime && new Date(e.startTime).toISOString().startsWith(dateStr));
      const milestoneGoal = goals.find(g => g.deadline && g.deadline.startsWith(dateStr));

      weeks.push({
        date: dateStr,
        label: String(day),
        hasTask: hasTask || !!milestoneGoal,
        isMilestone: !!milestoneGoal,
        isToday: day === now.getDate(),
        milestoneLabel: milestoneGoal ? milestoneGoal.title : undefined
      });
    }

    return {
      month: `${monthNames[monthIndex]} ${year}`,
      weeks
    };
  }
}
