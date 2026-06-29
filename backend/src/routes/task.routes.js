import express from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateCreateTask, validateUpdateTask } from '../validators/task.validator.js';

const router = express.Router();

router.use(authenticate); // Require authentication for all task endpoints

router.route('/')
  .get(TaskController.getTasks)
  .post(validateCreateTask, TaskController.createTask);

router.route('/:id')
  .get(validateUpdateTask, TaskController.getTaskById)
  .patch(validateUpdateTask, TaskController.updateTask)
  .delete(validateUpdateTask, TaskController.deleteTask);

export default router;
