import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { PlannerService } from '../../src/services/planner.service.js';
import { GoalSyncService } from '../../src/services/goalSync.service.js';
import { Planner } from '../../src/models/Planner.js';
import { AppError } from '../../src/utils/AppError.js';
import { createMockUser, createMockPlannerEvent } from '../factories/models.factory.js';

describe('PlannerService', () => {
  let userId;

  beforeEach(() => {
    userId = createMockUser();
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create a standard non-recurring event', async () => {
      const payload = createMockPlannerEvent(userId);
      const event = await PlannerService.createEvent(userId, payload);
      expect(event).toBeDefined();
      expect(event.title).toBe('Test Planner Event');
      expect(event.isRecurring).toBe(false);
    });

    it('should attach a seriesId to new recurring events', async () => {
      const payload = createMockPlannerEvent(userId, { isRecurring: true, recurrenceRule: { frequency: 'DAILY' } });
      const event = await PlannerService.createEvent(userId, payload);
      expect(event.isRecurring).toBe(true);
      expect(event.seriesId).toBeDefined();
      expect(event.recurrence).toBeDefined();
    });
  });

  describe('updateEvent', () => {
    let masterEvent;
    
    beforeEach(async () => {
      const payload = createMockPlannerEvent(userId, { isRecurring: true, recurrenceRule: { frequency: 'DAILY' } });
      masterEvent = await PlannerService.createEvent(userId, payload);
    });

    it('should update entire series when editScope is ALL', async () => {
      const updated = await PlannerService.updateEvent(userId, masterEvent._id, { title: 'Updated Title', editScope: 'ALL' });
      expect(updated.title).toBe('Updated Title');
      
      const inDb = await Planner.findById(masterEvent._id);
      expect(inDb.title).toBe('Updated Title');
    });

    it('should call goalSync if goalId and milestoneId are present', async () => {
      const payload = createMockPlannerEvent(userId, { goalId: new mongoose.Types.ObjectId(), milestoneId: new mongoose.Types.ObjectId() });
      const ev = await PlannerService.createEvent(userId, payload);

      const spy = jest.spyOn(GoalSyncService, 'handlePlannerCompleted').mockResolvedValueOnce({});
      await PlannerService.updateEvent(userId, ev._id, { completed: true });

      expect(spy).toHaveBeenCalledWith(userId, ev.goalId, ev.milestoneId);
    });

    it('should rollback completion if goalSync fails', async () => {
      const payload = createMockPlannerEvent(userId, { goalId: new mongoose.Types.ObjectId(), milestoneId: new mongoose.Types.ObjectId() });
      const ev = await PlannerService.createEvent(userId, payload);
      
      const spy = jest.spyOn(GoalSyncService, 'handlePlannerCompleted').mockRejectedValueOnce(new AppError('Sync fail', 400));

      await expect(PlannerService.updateEvent(userId, ev._id, { completed: true })).rejects.toThrow('Sync fail');

      const inDb = await Planner.findById(ev._id);
      expect(inDb.completed).toBe(false); // rolled back
    });
  });

  describe('deleteEvent', () => {
    let masterEvent;
    
    beforeEach(async () => {
      const payload = createMockPlannerEvent(userId, { isRecurring: true, recurrenceRule: { frequency: 'DAILY' } });
      masterEvent = await PlannerService.createEvent(userId, payload);
    });

    it('should delete entire series when editScope is ALL', async () => {
      await PlannerService.deleteEvent(userId, masterEvent._id, { editScope: 'ALL' });
      const inDb = await Planner.findById(masterEvent._id);
      expect(inDb).toBeNull();
    });

    it('should sync goal deletion if goalId and milestoneId exist', async () => {
      masterEvent.goalId = new mongoose.Types.ObjectId();
      masterEvent.milestoneId = new mongoose.Types.ObjectId();
      await masterEvent.save();

      const spy = jest.spyOn(GoalSyncService, 'handlePlannerDeleted').mockResolvedValueOnce({});
      await PlannerService.deleteEvent(userId, masterEvent._id, { editScope: 'ALL' });

      expect(spy).toHaveBeenCalledWith(userId, masterEvent.goalId, masterEvent.milestoneId);
    });
  });
});
