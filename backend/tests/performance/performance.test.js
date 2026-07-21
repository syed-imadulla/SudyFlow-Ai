import mongoose from 'mongoose';
import { GoalService } from '../../src/services/goal.service.js';
import { PlannerService } from '../../src/services/planner.service.js';
import { createMockUser, createMockGoal, createMockMilestone, createMockPlannerEvent } from '../factories/models.factory.js';

describe('Performance Validation', () => {
  let userId;

  beforeEach(() => {
    userId = createMockUser();
  });

  it('Create and schedule large Goal (100+ milestones)', async () => {
    const milestones = Array.from({ length: 150 }, () => createMockMilestone({ status: 'TODO', completed: false }));
    
    const start = performance.now();
    const goal = await GoalService.createGoal(userId, createMockGoal(userId, { subtasks: milestones }));
    const end = performance.now();
    
    expect(goal.subtasks.length).toBe(150);
    // console.log(`Goal with 150 milestones created in ${end - start} ms`);
  });

  it('Create large recurring Planner series (365 days)', async () => {
    const payload = createMockPlannerEvent(userId, {
      isRecurring: true,
      recurrenceRule: { frequency: 'DAILY', until: new Date('2027-08-01T10:00:00Z') } // approx 1 year
    });
    
    const start = performance.now();
    const event = await PlannerService.createEvent(userId, payload);
    const end = performance.now();
    
    expect(event.isRecurring).toBe(true);
    // console.log(`Recurring series created in ${end - start} ms`);
  });

  it('Fetch 500 planner blocks', async () => {
    // Generate 500 blocks directly to DB to avoid overhead of individual service calls
    const blocks = Array.from({ length: 500 }, () => createMockPlannerEvent(userId));
    await mongoose.model('Planner').insertMany(blocks);
    
    const start = performance.now();
    const fetched = await PlannerService.getEventsByRange(userId, new Date('2020-01-01'), new Date('2030-01-01'));
    const end = performance.now();
    
    expect(fetched.length).toBeGreaterThanOrEqual(500);
    // console.log(`Fetched 500 blocks in ${end - start} ms`);
  });
});
