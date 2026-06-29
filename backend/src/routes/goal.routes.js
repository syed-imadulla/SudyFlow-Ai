import express from 'express';
import { GoalController } from '../controllers/goal.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateCreateGoal, validateUpdateGoal, validateToggleSubtask } from '../validators/goal.validator.js';

const router = express.Router();

router.use(authenticate); // Require authentication for all goal endpoints

router.route('/')
  .get(GoalController.getGoals)
  .post(validateCreateGoal, GoalController.createGoal)
  .put(GoalController.bulkSaveGoals);

router.route('/:id')
  .get(validateUpdateGoal, GoalController.getGoalById)
  .patch(validateUpdateGoal, GoalController.updateGoal)
  .delete(validateUpdateGoal, GoalController.deleteGoal);

router.patch('/:goalId/subtasks/:subtaskId/toggle', validateToggleSubtask, GoalController.toggleSubtask);

export default router;
