import request from 'supertest';
import app from '../../src/app.js';
import mongoose from 'mongoose';
import { API_PREFIX } from '../../src/constants/index.js';
import { createTestUsers } from '../helpers/auth.helper.js';
import { GoalService } from '../../src/services/goal.service.js';
import { PlannerService } from '../../src/services/planner.service.js';
import { createMockGoal, createMockMilestone, createMockPlannerEvent } from '../factories/models.factory.js';

describe('Auth & Validation API Integration', () => {
  let userA, userB, tokenA, tokenB;
  let goalA;
  let plannerA;

  beforeEach(async () => {
    const users = await createTestUsers();
    userA = users.userA;
    userB = users.userB;
    tokenA = users.tokenA;
    tokenB = users.tokenB;

    // Create a Goal for User A
    const subtask = createMockMilestone();
    goalA = await GoalService.createGoal(userA, createMockGoal(userA, { subtasks: [subtask] }));

    // Create a Planner Block for User A
    const plannerPayload = createMockPlannerEvent(userA, { goalId: goalA._id, milestoneId: goalA.subtasks[0]._id });
    plannerA = await PlannerService.createEvent(userA, plannerPayload);
  });

  describe('Authorization Constraints', () => {
    it('User B cannot access User A Goals', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/goals/${goalA._id}`)
        .set('Authorization', `Bearer ${tokenB}`);
      
      expect(res.status).toBe(404); // Goal is not found for User B
    });

    it('User B cannot update User A Planner Block', async () => {
      const res = await request(app)
        .patch(`${API_PREFIX}/planner/${plannerA._id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hacked Title' });
      
      expect(res.status).toBe(404); // Not found for User B
    });

    it('User B cannot delete User A Planner Block', async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/planner/${plannerA._id}?editScope=SINGLE`)
        .set('Authorization', `Bearer ${tokenB}`);
      
      expect(res.status).toBe(404);
    });

    it('User B cannot schedule against User A Goal', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/planner/schedule`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          goalId: goalA._id,
          milestoneId: goalA.subtasks[0]._id,
          startTime: '2026-08-01T10:00:00Z',
          endTime: '2026-08-01T11:00:00Z'
        });
      
      // Attempting to schedule User A's goal as User B fails when GoalSync checks Goal ownership
      expect(res.status).toBe(404);
    });
  });

  describe('Validation Tests', () => {
    it('Rejects invalid Goal IDs', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/goals/invalid-id`)
        .set('Authorization', `Bearer ${tokenA}`);
      
      expect(res.status).toBe(400); // Validation fails for malformed ID
    });

    it('Rejects scheduling with missing required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/planner/schedule`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          goalId: goalA._id,
          // Missing milestoneId, startTime, endTime
        });
      
      expect(res.status).toBe(400);
    });
  });
});
