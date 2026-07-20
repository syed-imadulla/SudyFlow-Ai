import mongoose from 'mongoose';
import { Planner } from '../models/Planner.js';
import { Goal } from '../models/Goal.js';
import { FocusSession } from '../models/FocusSession.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, PLANNER_EVENT_TYPE } from '../constants/index.js';

const buildMasterQuery = (userId, targetId) => {
  const q = { user: userId };
  if (mongoose.Types.ObjectId.isValid(targetId)) {
    q.$or = [{ _id: targetId }, { seriesId: targetId }];
  } else {
    q.seriesId = targetId;
  }
  return q;
};

export class PlannerService {
  /**
   * Helper: Materialize recurring instances for a specific range
   */
  static async _expandRecurrencesInRange(userId, startIso, endIso, query = {}) {
    const startDateObj = new Date(startIso);
    const endDateObj = new Date(endIso);

    const baseFilter = { user: userId };
    if (query.type && typeof query.type === 'string') {
      const upper = query.type.toUpperCase();
      baseFilter.type = Object.values(PLANNER_EVENT_TYPE).includes(upper) ? upper : query.type;
    }
    if (query.completed !== undefined) {
      baseFilter.completed = query.completed === 'true' || query.completed === true;
    }
    if (query.goalId) {
      baseFilter.goalId = query.goalId;
    }

    // 1. Fetch normal non-recurring single-instance events in range
    const singleFilter = {
      ...baseFilter,
      isRecurring: { $ne: true },
      isException: { $ne: true },
      startTime: { $gte: startDateObj, $lte: endDateObj }
    };
    const singleDocs = await Planner.find(singleFilter).sort('startTime');

    // 2. Fetch all exceptions for this user
    const exceptions = await Planner.find({ user: userId, isException: true });
    const exceptionMap = {};
    for (const ex of exceptions) {
      if (ex.exDate) {
        if (ex.seriesId) exceptionMap[`${ex.seriesId}::${ex.exDate}`] = ex;
        if (ex.originalSeriesId) exceptionMap[`${ex.originalSeriesId}::${ex.exDate}`] = ex;
      }
    }

    // 3. Fetch active recurring master series for this user
    const masterDocs = await Planner.find({
      ...baseFilter,
      isRecurring: true,
      isException: { $ne: true },
      startTime: { $lte: endDateObj }
    });

    const uniqueOccurrences = new Map();
    const seenSeriesDates = new Set();
    for (const d of singleDocs) {
      if (!d.isRecurring && !d.isException && !d.seriesId) {
        const json = d.toJSON ? d.toJSON() : d;
        uniqueOccurrences.set(json.id || json._id?.toString(), json);
      }
    }

    // 4. Expand occurrences
    for (const master of masterDocs) {
      const doc = master.toJSON();
      const sId = doc.seriesId || doc.id;
      const freq = doc.recurrence?.frequency || 'DAILY';
      const interval = Math.max(1, doc.recurrence?.interval || 1);
      const repeatDays = doc.recurrence?.repeatDays || doc.recurrence?.daysOfWeek || [];
      const repeatUntil = doc.recurrence?.repeatUntil ? new Date(doc.recurrence.repeatUntil) : (doc.recurrence?.untilDate ? new Date(doc.recurrence.untilDate) : null);
      const maxOccurrences = doc.recurrence?.maxOccurrences || null;

      const masterStart = new Date(doc.startTime);
      const masterEnd = new Date(doc.endTime);
      const durationMs = masterEnd.getTime() - masterStart.getTime();
      const masterStartMidnight = new Date(Date.UTC(masterStart.getUTCFullYear(), masterStart.getUTCMonth(), masterStart.getUTCDate(), 0, 0, 0));

      let curDate = new Date(masterStartMidnight.getTime());
      let occCount = 0;
      let safetyCounter = 0;

      while (curDate <= endDateObj && safetyCounter++ < 2000) {
        if (repeatUntil && curDate > repeatUntil) break;
        if (maxOccurrences && occCount >= maxOccurrences) break;

        const jsDay = curDate.getUTCDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;
        let matches = false;

        if (freq === 'DAILY') {
          const daysSinceStart = Math.round((curDate - masterStartMidnight) / 86400000);
          matches = daysSinceStart % interval === 0;
        } else if (freq === 'WEEKDAYS') {
          matches = jsDay >= 1 && jsDay <= 5;
        } else if (freq === 'WEEKLY' || freq === 'CUSTOM') {
          const weeksSinceStart = Math.floor(Math.round((curDate - masterStartMidnight) / 86400000) / 7);
          if (weeksSinceStart % interval === 0) {
            if (repeatDays.length > 0) {
              matches = repeatDays.includes(isoDay) || repeatDays.includes(jsDay);
            } else {
              matches = jsDay === masterStart.getUTCDay();
            }
          }
        } else if (freq === 'MONTHLY') {
          const monthsSinceStart = (curDate.getUTCFullYear() - masterStart.getUTCFullYear()) * 12 + (curDate.getUTCMonth() - masterStart.getUTCMonth());
          matches = monthsSinceStart % interval === 0 && curDate.getUTCDate() === masterStart.getUTCDate();
        }

        if (matches) {
          occCount++;
          const dateStr = curDate.toISOString().split('T')[0];
          const instStart = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate(), masterStart.getUTCHours(), masterStart.getUTCMinutes(), masterStart.getUTCSeconds(), masterStart.getUTCMilliseconds()));
          const instEnd = new Date(instStart.getTime() + durationMs);

          if (instStart >= startDateObj && instStart <= endDateObj) {
            const seriesKey = `${doc.originalSeriesId || sId}::${dateStr}`;
            if (!seenSeriesDates.has(seriesKey)) {
              seenSeriesDates.add(seriesKey);
              const virtualId = `${sId}::${dateStr}`;
              if (!uniqueOccurrences.has(virtualId)) {
                const exDoc = exceptionMap[virtualId] || exceptionMap[`${doc.id}::${dateStr}`] || (doc._id ? exceptionMap[`${doc._id}::${dateStr}`] : null);
                if (exDoc) {
                  if (!exDoc.isCancelled) {
                    const exJson = exDoc.toJSON ? exDoc.toJSON() : exDoc;
                    exJson.virtualId = virtualId;
                    exJson.id = virtualId;
                    uniqueOccurrences.set(virtualId, exJson);
                  } else {
                    uniqueOccurrences.set(virtualId, { isCancelled: true });
                  }
                } else {
                  const virtualDoc = { ...doc };
                  virtualDoc.id = virtualId;
                  virtualDoc._id = virtualId;
                  virtualDoc.virtualId = virtualId;
                  virtualDoc.seriesId = sId;
                  virtualDoc.originalSeriesId = doc.originalSeriesId || sId;
                  virtualDoc.isRecurring = true;
                  virtualDoc.startTime = instStart.toISOString();
                  virtualDoc.endTime = instEnd.toISOString();
                  virtualDoc.startTimeDisplay = instStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  virtualDoc.endTimeDisplay = instEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  virtualDoc.dateStr = dateStr;
                  uniqueOccurrences.set(virtualId, virtualDoc);
                }
              }
            }
          }
        }

        curDate.setUTCDate(curDate.getUTCDate() + 1);
      }
    }

    const results = Array.from(uniqueOccurrences.values()).filter(item => !item.isCancelled);
    results.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    console.log(`[AUDIT: PlannerService._expandRecurrencesInRange] Range (${startIso} to ${endIso}) expanded occurrences count:`, results.length);
    return results;
  }

  /**
   * Fetch events with filtering (by date range, type, completed), sorting, and pagination
   */
  static async getEvents(userId, query = {}) {
    if (query.start && query.end) {
      return this._expandRecurrencesInRange(userId, query.start, query.end, query);
    }

    const filter = { user: userId };
    if (query.type && typeof query.type === 'string' && query.type !== 'ALL') {
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
    const event = await Planner.findOne(buildMasterQuery(userId, eventId));
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
    if (payload.isRecurring && !payload.seriesId) {
      const sid = new mongoose.Types.ObjectId().toString();
      payload.seriesId = sid;
      payload.originalSeriesId = payload.originalSeriesId || sid;
    }
    if (payload.recurrenceRule && !payload.recurrence) {
      payload.recurrence = payload.recurrenceRule;
    }
    return Planner.create({
      ...payload,
      user: userId
    });
  }

  /**
   * Schedule a Milestone (Domain Orchestrator logic)
   */
  static async scheduleMilestone(userId, payload) {
    const { goalId, milestoneId, startTime, endTime } = payload;
    
    // 1 & 2 & 3. Validate goal and milestone
    const goal = await Goal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      throw new AppError('Goal not found', HTTP_STATUS.NOT_FOUND);
    }
    
    const milestone = goal.subtasks.id(milestoneId);
    if (!milestone) {
      throw new AppError('Milestone not found within the specified goal', HTTP_STATUS.NOT_FOUND);
    }
    
    // 4. Enforce One Milestone <-> One Planner Block
    const existingBlock = await Planner.findOne({ user: userId, milestoneId });
    if (existingBlock) {
      throw new AppError('This milestone is already scheduled', HTTP_STATUS.BAD_REQUEST);
    }
    
    // 5. Derive planner display data
    const title = `${goal.title}: ${milestone.title}`;
    
    // 6. Create the Planner Block
    const plannerPayload = {
      title,
      startTime,
      endTime,
      type: PLANNER_EVENT_TYPE.STUDY, // Default type for milestone blocks
      goalId,
      milestoneId
    };
    
    return await this.createEvent(userId, plannerPayload);
  }

  /**
   * Update planner event
   */
  static async updateEvent(userId, eventId, patch) {
    const targetSeriesId = patch.seriesId || eventId;
    const exDateStr = patch.exDate;
    const editScope = patch.editScope || 'ALL';

    if (editScope === 'SINGLE' && targetSeriesId && exDateStr) {
      let exDoc = await Planner.findOne({ user: userId, seriesId: targetSeriesId, exDate: exDateStr, isException: true });
      if (!exDoc && mongoose.Types.ObjectId.isValid(targetSeriesId)) {
        exDoc = await Planner.findOne({ user: userId, originalSeriesId: targetSeriesId, exDate: exDateStr, isException: true });
      }
      if (exDoc) {
        Object.assign(exDoc, patch);
        delete exDoc.editScope;
        await exDoc.save();
        return exDoc;
      } else {
        const master = await Planner.findOne(buildMasterQuery(userId, targetSeriesId));
        if (!master) throw new AppError('Master series not found', HTTP_STATUS.NOT_FOUND);
        const masterData = master.toObject();
        delete masterData._id;
        delete masterData.id;
        delete masterData.createdAt;
        delete masterData.updatedAt;
        const sId = master.seriesId || master._id.toString();
        const newEx = await Planner.create({
          ...masterData,
          ...patch,
          user: userId,
          isRecurring: false,
          isException: true,
          seriesId: sId,
          originalSeriesId: master.originalSeriesId || sId,
          exDate: exDateStr
        });
        return newEx;
      }
    } else if (editScope === 'FUTURE' && targetSeriesId && exDateStr) {
      const master = await Planner.findOne(buildMasterQuery(userId, targetSeriesId));
      if (!master) throw new AppError('Master series not found', HTTP_STATUS.NOT_FOUND);
      
      const masterData = master.toObject();
      delete masterData._id;
      delete masterData.id;
      delete masterData.createdAt;
      delete masterData.updatedAt;
      delete masterData.exDate;
      delete masterData.seriesId;

      const capDate = new Date(new Date(exDateStr).getTime() - 1000);
      master.recurrence = { ...(master.recurrence || {}), endType: 'UNTIL_DATE', repeatUntil: capDate };
      await master.save();

      const newSid = new mongoose.Types.ObjectId().toString();

      const origStart = new Date(master.startTime);
      const origEnd = new Date(master.endTime);
      const durationMs = origEnd.getTime() - origStart.getTime();
      const exDateObj = new Date(exDateStr);
      const newStart = new Date(Date.UTC(exDateObj.getUTCFullYear(), exDateObj.getUTCMonth(), exDateObj.getUTCDate(), origStart.getUTCHours(), origStart.getUTCMinutes(), origStart.getUTCSeconds(), origStart.getUTCMilliseconds()));
      if (patch.startTime) {
        const pStart = new Date(patch.startTime);
        newStart.setUTCHours(pStart.getUTCHours(), pStart.getUTCMinutes(), pStart.getUTCSeconds(), pStart.getUTCMilliseconds());
      }
      const newEnd = patch.endTime ? new Date(patch.endTime) : new Date(newStart.getTime() + durationMs);

      const cleanPatch = { ...patch };
      delete cleanPatch.editScope;
      delete cleanPatch.exDate;
      delete cleanPatch.seriesId;
      if (cleanPatch.recurrenceRule && !cleanPatch.recurrence) {
        cleanPatch.recurrence = cleanPatch.recurrenceRule;
      }

      const newMaster = await Planner.create({
        ...masterData,
        ...cleanPatch,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
        user: userId,
        isRecurring: true,
        isException: false,
        exDate: null,
        seriesId: newSid,
        originalSeriesId: master.originalSeriesId || (master.seriesId || master._id.toString())
      });
      await Planner.updateMany({
        user: userId,
        isException: true,
        exDate: { $gte: exDateStr },
        $or: [{ seriesId: master.seriesId || master._id.toString() }, { originalSeriesId: master.originalSeriesId || master.seriesId || master._id.toString() }]
      }, {
        $set: { seriesId: newSid }
      });
      return newMaster;
    }

    const actualId = targetSeriesId;
    const master = await Planner.findOne(buildMasterQuery(userId, actualId));
    if (!master) throw new AppError('Planner event not found', HTTP_STATUS.NOT_FOUND);

    const cleanPatch = { ...patch };
    delete cleanPatch.editScope;
    delete cleanPatch.exDate;
    delete cleanPatch.seriesId;
    if (cleanPatch.recurrenceRule && !cleanPatch.recurrence) {
      cleanPatch.recurrence = cleanPatch.recurrenceRule;
    }

    if (master.isRecurring && cleanPatch.startTime && cleanPatch.endTime && cleanPatch.isRecurring !== false) {
      const origStart = new Date(master.startTime);
      const origEnd = new Date(master.endTime);
      const pStart = new Date(cleanPatch.startTime);
      const pEnd = new Date(cleanPatch.endTime);
      origStart.setUTCHours(pStart.getUTCHours(), pStart.getUTCMinutes(), pStart.getUTCSeconds(), pStart.getUTCMilliseconds());
      origEnd.setUTCHours(pEnd.getUTCHours(), pEnd.getUTCMinutes(), pEnd.getUTCSeconds(), pEnd.getUTCMilliseconds());
      cleanPatch.startTime = origStart.toISOString();
      cleanPatch.endTime = origEnd.toISOString();
    }

    const updateObj = { $set: cleanPatch };
    const uniqueMasterIds = [...new Set([master._id.toString(), master.seriesId, master.originalSeriesId].filter(Boolean))];
    if (cleanPatch.isRecurring === false) {
      cleanPatch.recurrence = null;
      cleanPatch.repeatRule = null;
      updateObj.$unset = { seriesId: 1, originalSeriesId: 1 };
      await Planner.deleteMany({
        user: userId,
        isException: true,
        $or: [{ seriesId: { $in: uniqueMasterIds } }, { originalSeriesId: { $in: uniqueMasterIds } }]
      });
    } else if (master.isRecurring) {
      await Planner.deleteMany({
        user: userId,
        isException: true,
        isCancelled: { $ne: true },
        $or: [{ seriesId: { $in: uniqueMasterIds } }, { originalSeriesId: { $in: uniqueMasterIds } }]
      });
    }

    const event = await Planner.findOneAndUpdate(
      buildMasterQuery(userId, actualId),
      updateObj,
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
  static async deleteEvent(userId, eventId, query = {}) {
    const targetSeriesId = query.seriesId || eventId;
    const exDateStr = query.exDate;
    const editScope = query.editScope || 'ALL';

    if (editScope === 'SINGLE' && targetSeriesId && exDateStr) {
      let exDoc = await Planner.findOne({ user: userId, seriesId: targetSeriesId, exDate: exDateStr, isException: true });
      if (!exDoc && mongoose.Types.ObjectId.isValid(targetSeriesId)) {
        exDoc = await Planner.findOne({ user: userId, originalSeriesId: targetSeriesId, exDate: exDateStr, isException: true });
      }
      if (exDoc) {
        exDoc.isCancelled = true;
        await exDoc.save();
      } else {
        const master = await Planner.findOne(buildMasterQuery(userId, targetSeriesId));
        if (master) {
          const sId = master.seriesId || master._id.toString();
          await Planner.create({
            user: userId,
            title: master.title || 'Cancelled',
            startTime: new Date(),
            endTime: new Date(),
            isRecurring: false,
            isException: true,
            isCancelled: true,
            seriesId: sId,
            originalSeriesId: master.originalSeriesId || sId,
            exDate: exDateStr
          });
        }
      }
      return;
    } else if (editScope === 'FUTURE' && targetSeriesId && exDateStr) {
      const master = await Planner.findOne(buildMasterQuery(userId, targetSeriesId));
      if (master) {
        const capDate = new Date(new Date(exDateStr).getTime() - 1000);
        master.recurrence = { ...(master.recurrence || {}), endType: 'UNTIL_DATE', repeatUntil: capDate };
        await master.save();
      }
      return;
    }

    const actualId = targetSeriesId;
    
    // [DELETE ALL] Temporary Audit Logs
    console.log('[DELETE ALL] Incoming id:', eventId);
    console.log('[DELETE ALL] Resolved seriesId:', actualId);
    
    const matchedDocs = await Planner.find(buildMasterQuery(userId, actualId));
    console.log('[DELETE ALL] Documents matched:', matchedDocs.length);
    const resolvedMaster = matchedDocs.find(d => !d.isException && d.isRecurring) || matchedDocs[0];
    console.log('[DELETE ALL] Resolved master id:', resolvedMaster ? resolvedMaster._id.toString() : 'none');

    const result = await Planner.findOneAndDelete(buildMasterQuery(userId, actualId));
    if (!result) {
      throw new AppError('Planner event not found', HTTP_STATUS.NOT_FOUND);
    }
    const idsToDelete = [actualId];
    if (result) {
      if (result.seriesId) idsToDelete.push(result.seriesId);
      if (result.originalSeriesId) idsToDelete.push(result.originalSeriesId);
      if (result._id) idsToDelete.push(result._id.toString());
    }
    const uniqueIds = [...new Set(idsToDelete.filter(Boolean))];
    const deleteRes = await Planner.deleteMany({
      user: userId,
      $or: [
        { seriesId: { $in: uniqueIds } },
        { originalSeriesId: { $in: uniqueIds } },
        { _id: { $in: uniqueIds } }
      ]
    });
    const docsDeleted = (result ? 1 : 0) + (deleteRes.deletedCount || 0);
    console.log('[DELETE ALL] Documents deleted:', docsDeleted);

    const remainingMasterCount = await Planner.countDocuments({ user: userId, $or: [{ seriesId: { $in: uniqueIds } }, { originalSeriesId: { $in: uniqueIds } }, { _id: { $in: uniqueIds } }], isException: { $ne: true } });
    const remainingExceptionCount = await Planner.countDocuments({ user: userId, $or: [{ seriesId: { $in: uniqueIds } }, { originalSeriesId: { $in: uniqueIds } }, { _id: { $in: uniqueIds } }], isException: true });
    console.log('[DELETE ALL] Remaining master count:', remainingMasterCount);
    console.log('[DELETE ALL] Remaining exception count:', remainingExceptionCount);

    const afterEvents = await this.getEvents(userId, { start: '2026-07-01T00:00:00.000Z', end: '2026-09-01T23:59:59.000Z' });
    const matchingOccurrences = afterEvents.filter(e => (e.seriesId && uniqueIds.includes(e.seriesId.toString())) || (e._id && uniqueIds.some(uid => e._id.toString().includes(uid))) || (e.id && uniqueIds.some(uid => e.id.toString().includes(uid))));
    console.log('[DELETE ALL] Expanded occurrences after deletion:', matchingOccurrences.length);
  }

  /**
   * Get events for Today (from 00:00:00 to 23:59:59 today)
   */
  static async getTodayEvents(userId) {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999));

    const events = await this.getEventsByRange(userId, startOfDay.toISOString(), endOfDay.toISOString());
    console.log('[AUDIT: PlannerService.getTodayEvents] Returned events count:', events.length);
    return events;
  }

  /**
   * Get events for specific date string (YYYY-MM-DD)
   */
  static async getEventsForDate(userId, dateStr) {
    if (dateStr && typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-').map(Number);
      const startOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0));
      const endOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));
      const events = await this.getEventsByRange(userId, startOfDay.toISOString(), endOfDay.toISOString());
      console.log(`[AUDIT: PlannerService.getEventsForDate(${dateStr})] Returned events count:`, events.length);
      return events;
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
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

    const startOfMonth = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, monthIndex, daysInMonth, 23, 59, 59, 999));

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
