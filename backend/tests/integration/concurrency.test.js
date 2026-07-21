import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { GoalService } from '../../src/services/goal.service.js';
import { PlannerService } from '../../src/services/planner.service.js';
import { Goal } from '../../src/models/Goal.js';
import { createMockUser, createMockGoal, createMockMilestone, createMockPlannerEvent } from '../factories/models.factory.js';

describe('Concurrency & Race Conditions', () => {
  let userId;
  let goal;
  let milestoneId;

  beforeEach(async () => {
    userId = createMockUser();
    jest.restoreAllMocks();
    
    const milestone = createMockMilestone({ status: 'TODO', completed: false });
    goal = await GoalService.createGoal(userId, createMockGoal(userId, { subtasks: [milestone] }));
    milestoneId = goal.subtasks[0]._id;
  });

  it('Rapid simultaneous scheduling', async () => {
    const payload1 = createMockPlannerEvent(userId, { goalId: goal._id, milestoneId });
    const payload2 = createMockPlannerEvent(userId, { goalId: goal._id, milestoneId });
    
    // Attempt to schedule both concurrently
    const results = await Promise.allSettled([
      PlannerService.scheduleMilestone(userId, { goalId: goal._id, milestoneId, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600).toISOString() }),
      PlannerService.scheduleMilestone(userId, { goalId: goal._id, milestoneId, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600).toISOString() })
    ]);
    
    // In our system, both planner blocks might get created, but the milestone status should just remain SCHEDULED safely.
    // If the system is designed to block multiple planner events per milestone, one should fail. 
    // Currently, it just marks the milestone as SCHEDULED idempotently.
    const updatedGoal = await Goal.findById(goal._id);
    expect(updatedGoal.subtasks.id(milestoneId).status).toBe('SCHEDULED');
  });

  it('Simultaneous completions', async () => {
    // Schedule first
    const plannerEvent = await PlannerService.scheduleMilestone(userId, { goalId: goal._id, milestoneId, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600).toISOString() });
    
    // Complete twice simultaneously
    const results = await Promise.allSettled([
      PlannerService.updateEvent(userId, plannerEvent._id, { completed: true }),
      PlannerService.updateEvent(userId, plannerEvent._id, { completed: true })
    ]);
    
    const updatedGoal = await Goal.findById(goal._id);
    expect(updatedGoal.subtasks.id(milestoneId).status).toBe('COMPLETED');
    // Even if both try to complete, the system should not crash.
  });

  it('Delete while completing', async () => {
    // Schedule first
    const plannerEvent = await PlannerService.scheduleMilestone(userId, { goalId: goal._id, milestoneId, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600).toISOString() });
    
    // Complete and delete simultaneously
    const results = await Promise.allSettled([
      PlannerService.updateEvent(userId, plannerEvent._id, { completed: true }),
      PlannerService.deleteEvent(userId, plannerEvent._id, { editScope: 'SINGLE' })
    ]);
    
    // Outcome: Milestone is either TODO (deleted won) or COMPLETED (completed won and delete failed because completed events can't be implicitly deleted).
    // Let's just ensure Goal sync didn't crash leaving inconsistent state.
    const updatedGoal = await Goal.findById(goal._id);
    const status = updatedGoal.subtasks.id(milestoneId).status;
    expect(['TODO', 'COMPLETED']).toContain(status);
  });
});
