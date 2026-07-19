import mongoose from 'mongoose';
import { Goal } from '../models/Goal.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS, GOAL_STATUS } from '../constants/index.js';

/**
 * Helper to compute dynamic progress from subtasks
 */
const attachDynamicProgress = (goalDoc) => {
  if (!goalDoc) return null;
  const goal = goalDoc.toJSON ? goalDoc.toJSON() : { ...goalDoc };
  const total = goal.subtasks?.length || 0;
  const done = goal.subtasks?.filter(s => s.completed).length || 0;
  goal.progress = total > 0 ? Math.round((done / total) * 100) : (goal.completed ? 100 : 0);
  return goal;
};

export class GoalService {
  /**
   * Fetch all goals belonging to user with sorting, filtering, and pagination
   */
  static async getGoals(userId, query = {}) {
    const filter = { user: userId };
    if (query.urgency) filter.urgency = query.urgency;
    if (query.status) filter.status = query.status.toUpperCase();
    if (query.completed !== undefined) {
      const isCompleted = query.completed === 'true' || query.completed === true;
      if (isCompleted) {
        filter.status = GOAL_STATUS.COMPLETED;
      } else {
        filter.status = { $ne: GOAL_STATUS.COMPLETED };
      }
    }

    const sort = query.sort || '-createdAt';
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const goals = await Goal.find(filter).sort(sort).skip(skip).limit(limit);
    return goals.map(attachDynamicProgress);
  }

  /**
   * Get single goal by ID
   */
  static async getGoalById(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      throw new AppError('Goal not found', HTTP_STATUS.NOT_FOUND);
    }
    return attachDynamicProgress(goal);
  }

  /**
   * Create new goal
   */
  static async createGoal(userId, payload) {
    const data = { ...payload };
    if (data.status && typeof data.status === 'string') {
      data.status = data.status.toUpperCase().trim();
    }
    if (data.completed === true || data.completed === 'true' || data.urgency === 'COMPLETED') {
      data.status = GOAL_STATUS.COMPLETED;
      data.completed = true;
    } else if (data.status === GOAL_STATUS.COMPLETED) {
      data.completed = true;
    }

    const goal = await Goal.create({
      ...data,
      user: userId
    });
    return attachDynamicProgress(goal);
  }

  /**
   * Update existing goal
   */
  static async updateGoal(userId, goalId, patch) {
    const data = { ...patch };
    if (data.status && typeof data.status === 'string') {
      data.status = data.status.toUpperCase().trim();
    }
    if (data.completed === true || data.completed === 'true' || data.urgency === 'COMPLETED') {
      data.status = GOAL_STATUS.COMPLETED;
      data.completed = true;
    } else if (data.status === GOAL_STATUS.COMPLETED) {
      data.completed = true;
    } else if (data.completed === false || data.completed === 'false') {
      if (!data.status) data.status = GOAL_STATUS.ACTIVE;
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, user: userId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!goal) {
      throw new AppError('Goal not found', HTTP_STATUS.NOT_FOUND);
    }
    return attachDynamicProgress(goal);
  }

  /**
   * Delete goal
   */
  static async deleteGoal(userId, goalId) {
    const result = await Goal.findOneAndDelete({ _id: goalId, user: userId });
    if (!result) {
      throw new AppError('Goal not found', HTTP_STATUS.NOT_FOUND);
    }
    // Cascade delete associated planner events
    await mongoose.model('Planner').deleteMany({ goalId: goalId, user: userId });
  }

  /**
   * Toggle completion status of a specific subtask inside a goal
   */
  static async toggleSubtask(userId, goalId, subtaskId, completedStatus) {
    const goal = await Goal.findOne({ _id: goalId, user: userId });
    if (!goal) {
      throw new AppError('Goal not found', HTTP_STATUS.NOT_FOUND);
    }

    const subtask = goal.subtasks.id(subtaskId);
    if (!subtask) {
      throw new AppError('Subtask not found', HTTP_STATUS.NOT_FOUND);
    }

    subtask.completed = completedStatus !== undefined ? completedStatus : !subtask.completed;
    
    // Check if all subtasks are completed to update goal status
    const allCompleted = goal.subtasks.length > 0 && goal.subtasks.every(s => s.completed);
    if (allCompleted) {
      goal.status = GOAL_STATUS.COMPLETED;
      goal.completed = true;
    }

    await goal.save();

    return attachDynamicProgress(goal);
  }

  /**
   * Bulk save or overwrite user goals (used by frontend drag/drop reordering)
   */
  static async bulkSaveGoals(userId, goalsArray) {
    if (!Array.isArray(goalsArray)) {
      throw new AppError('Payload must be an array of goals', HTTP_STATUS.BAD_REQUEST);
    }

    // Delete existing and replace with new array while maintaining ownership
    await Goal.deleteMany({ user: userId });
    const formatted = goalsArray.map(g => ({
      ...g,
      user: userId,
      status: (g.completed || g.status === 'COMPLETED' || g.urgency === 'COMPLETED') ? GOAL_STATUS.COMPLETED : (g.status ? g.status.toUpperCase() : GOAL_STATUS.ACTIVE)
    }));

    if (formatted.length > 0) {
      await Goal.insertMany(formatted);
    }

    return this.getGoals(userId);
  }
}
