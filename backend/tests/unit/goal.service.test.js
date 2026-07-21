import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { GoalService } from '../../src/services/goal.service.js';
import { PlannerService } from '../../src/services/planner.service.js';
import { Goal } from '../../src/models/Goal.js';
import { Planner } from '../../src/models/Planner.js';
import { AppError } from '../../src/utils/AppError.js';
import { createMockUser, createMockGoal, createMockPlannerEvent } from '../factories/models.factory.js';

describe('GoalService', () => {
  let userId;

  beforeEach(() => {
    userId = createMockUser();
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('should create a valid goal', async () => {
      const payload = createMockGoal(userId, { title: 'New Goal' });
      const goal = await GoalService.createGoal(userId, payload);
      expect(goal).toBeDefined();
      expect(goal.title).toBe('New Goal');
      expect(goal.status).toBe('ACTIVE');
    });
  });

  describe('updateGoal', () => {
    let existingGoal;

    beforeEach(async () => {
      existingGoal = await GoalService.createGoal(userId, createMockGoal(userId));
    });

    it('should update an existing goal', async () => {
      const updated = await GoalService.updateGoal(userId, existingGoal._id, { title: 'Updated Title' });
      expect(updated.title).toBe('Updated Title');
      
      const inDb = await Goal.findById(existingGoal._id);
      expect(inDb.title).toBe('Updated Title');
    });

    it('should throw AppError if goal not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(GoalService.updateGoal(userId, fakeId, { title: 'a' })).rejects.toThrow(AppError);
    });
  });

  describe('deleteGoal', () => {
    let existingGoal;
    
    beforeEach(async () => {
      existingGoal = await GoalService.createGoal(userId, createMockGoal(userId));
    });

    it('should delete a goal and its associated planner blocks', async () => {
      // Manually add some planner blocks mocking the planner service insertion
      const p1 = new Planner(createMockPlannerEvent(userId, { goalId: existingGoal._id }));
      const p2 = new Planner(createMockPlannerEvent(userId, { goalId: existingGoal._id }));
      await Planner.insertMany([p1, p2]);

      // Delete Goal
      await GoalService.deleteGoal(userId, existingGoal._id);

      // Verify Goal is gone
      const inDb = await Goal.findById(existingGoal._id);
      expect(inDb).toBeNull();

      // Verify orphan planner blocks are cleaned up
      const orphans = await Planner.find({ goalId: existingGoal._id });
      expect(orphans.length).toBe(0);
    });
  });
});
