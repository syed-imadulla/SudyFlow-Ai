import mongoose from 'mongoose';

export const createMockUser = () => {
  return new mongoose.Types.ObjectId().toString();
};

export const createMockGoal = (userId, overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    title: 'Test Goal',
    description: 'A goal for testing',
    subject: 'Math',
    urgency: 'ACTIVE',
    status: 'ACTIVE',
    completed: false,
    progress: 0,
    deadline: '2026-12-31',
    subtasks: [],
    ...overrides
  };
};

export const createMockMilestone = (overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    title: 'Test Milestone',
    status: 'TODO',
    completed: false,
    ...overrides
  };
};

export const createMockPlannerEvent = (userId, overrides = {}) => {
  return {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    title: 'Test Planner Event',
    startTime: new Date('2026-08-01T10:00:00Z'),
    endTime: new Date('2026-08-01T11:00:00Z'),
    type: 'STUDY',
    completed: false,
    isRecurring: false,
    isException: false,
    ...overrides
  };
};
