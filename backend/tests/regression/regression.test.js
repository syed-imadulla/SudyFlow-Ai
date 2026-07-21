import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { GoalService } from '../../src/services/goal.service.js';
import { PlannerService } from '../../src/services/planner.service.js';
import { createMockUser, createMockGoal, createMockPlannerEvent } from '../factories/models.factory.js';

describe('Regression Validation', () => {
  let userId;

  beforeEach(() => {
    userId = createMockUser();
    jest.clearAllMocks();
  });

  it('Dashboard metrics remain intact (events retrieval without goals)', async () => {
    const payload = createMockPlannerEvent(userId, { startTime: new Date(), endTime: new Date(Date.now() + 3600000) });
    await PlannerService.createEvent(userId, payload);
    
    // Fetch today's events (regression check)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tmrw = new Date(today);
    tmrw.setDate(today.getDate() + 1);

    const events = await PlannerService.getEventsByRange(userId, today, tmrw);
    expect(events.length).toBeGreaterThan(0);
  });

  it('Standard Goal CRUD without sync boundaries remains intact', async () => {
    const payload = createMockGoal(userId, { title: 'No Planner Goal' });
    const goal = await GoalService.createGoal(userId, payload);
    expect(goal.title).toBe('No Planner Goal');
    
    const fetched = await GoalService.getGoalById(userId, goal._id);
    expect(fetched.title).toBe('No Planner Goal');
    
    await GoalService.deleteGoal(userId, goal._id);
    await expect(GoalService.getGoalById(userId, goal._id)).rejects.toThrow();
  });
});
