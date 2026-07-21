import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { GoalService } from '../../src/services/goal.service.js';
import { PlannerService } from '../../src/services/planner.service.js';
import { Goal } from '../../src/models/Goal.js';
import { Planner } from '../../src/models/Planner.js';
import { createMockUser, createMockGoal, createMockMilestone, createMockPlannerEvent } from '../factories/models.factory.js';

describe('Sync Integration Lifecycle', () => {
  let userId;

  beforeEach(() => {
    userId = createMockUser();
    jest.restoreAllMocks();
  });

  it('Complete Lifecycle: Goal Created -> Milestone Scheduled -> Planner Completed -> Goal Deleted', async () => {
    // 1. Goal Created
    const milestone = createMockMilestone({ status: 'TODO', completed: false });
    let goal = await GoalService.createGoal(userId, createMockGoal(userId, { subtasks: [milestone] }));
    
    // 2. Milestone Scheduled
    const plannerEvent = await PlannerService.scheduleMilestone(userId, {
      goalId: goal._id,
      milestoneId: goal.subtasks[0]._id,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    });
    
    goal = await Goal.findById(goal._id);
    expect(goal.subtasks[0].status).toBe('SCHEDULED');

    // 3. Planner Completed
    await PlannerService.updateEvent(userId, plannerEvent._id, { completed: true });
    
    goal = await Goal.findById(goal._id);
    expect(goal.subtasks[0].status).toBe('COMPLETED');

    // 4. Goal Deleted
    await GoalService.deleteGoal(userId, goal._id);
    
    // 5. Verify Cleanup
    const goalInDb = await Goal.findById(goal._id);
    expect(goalInDb).toBeNull();
    
    const plannerInDb = await Planner.findById(plannerEvent._id);
    expect(plannerInDb).toBeNull();
  });

  it('State Machine Enforcement: Cannot complete a deleted milestone/event', async () => {
    const milestone = createMockMilestone({ status: 'TODO', completed: false });
    const goal = await GoalService.createGoal(userId, createMockGoal(userId, { subtasks: [milestone] }));
    
    const plannerEvent = await PlannerService.scheduleMilestone(userId, {
      goalId: goal._id,
      milestoneId: goal.subtasks[0]._id,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    });
    
    // Delete the planner event first
    await PlannerService.deleteEvent(userId, plannerEvent._id, { editScope: 'SINGLE' });
    
    const goalAfterDelete = await Goal.findById(goal._id);
    expect(goalAfterDelete.subtasks[0].status).toBe('TODO'); // Synchronization handles it

    // Try completing it (but it's deleted)
    // Actually you can't update a deleted planner event because findEvent throws 404
    await expect(PlannerService.updateEvent(userId, plannerEvent._id, { completed: true })).rejects.toThrow();
  });

  it('Rollback Lifecycle: Forced DB error rolls back Goal state', async () => {
    const milestone = createMockMilestone({ status: 'TODO', completed: false });
    const goal = await GoalService.createGoal(userId, createMockGoal(userId, { subtasks: [milestone] }));
    
    const plannerEvent = await PlannerService.scheduleMilestone(userId, {
      goalId: goal._id,
      milestoneId: goal.subtasks[0]._id,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    });
    
    const goalAfterSchedule = await Goal.findById(goal._id);
    expect(goalAfterSchedule.subtasks[0].status).toBe('SCHEDULED');

    // Force Planner update to fail by mocking Planner.findOneAndUpdate
    jest.spyOn(Planner, 'findOneAndUpdate').mockRejectedValueOnce(new Error('Forced DB Error'));

    // GoalSync completed sync starts, then Planner update fails
    await expect(PlannerService.updateEvent(userId, plannerEvent._id, { completed: true })).rejects.toThrow('Forced DB Error');
    
    // Assert Rollback: Milestone should still be SCHEDULED
    const goalAfterRollback = await Goal.findById(goal._id);
    expect(goalAfterRollback.subtasks[0].status).toBe('SCHEDULED');
    expect(goalAfterRollback.subtasks[0].completed).toBe(false);
  });
});
