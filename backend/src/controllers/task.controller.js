import { catchAsync } from '../utils/asyncWrapper.js';
import { TaskService } from '../services/task.service.js';
import { HTTP_STATUS } from '../constants/index.js';

export class TaskController {
  static getTasks = catchAsync(async (req, res) => {
    const tasks = await TaskService.getTasks(req.user._id, req.query);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: tasks
    });
  });

  static getTaskById = catchAsync(async (req, res) => {
    const task = await TaskService.getTaskById(req.user._id, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: task
    });
  });

  static createTask = catchAsync(async (req, res) => {
    const task = await TaskService.createTask(req.user._id, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      statusCode: HTTP_STATUS.CREATED,
      data: task
    });
  });

  static updateTask = catchAsync(async (req, res) => {
    const task = await TaskService.updateTask(req.user._id, req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      data: task
    });
  });

  static deleteTask = catchAsync(async (req, res) => {
    await TaskService.deleteTask(req.user._id, req.params.id);
    res.status(HTTP_STATUS.OK).json({
      status: 'success',
      statusCode: HTTP_STATUS.OK,
      message: 'Task deleted successfully'
    });
  });
}
