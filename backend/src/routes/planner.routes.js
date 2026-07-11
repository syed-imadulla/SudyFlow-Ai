import express from 'express';
import { PlannerController } from '../controllers/planner.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateCreatePlannerEvent, validateUpdatePlannerEvent } from '../validators/planner.validator.js';

const router = express.Router();

router.use(authenticate); // Require authentication for all planner endpoints

// UI compatibility routes
router.get('/daily', PlannerController.getDailyBlocks);
router.get('/deadlines', PlannerController.getUpcomingDeadlines);
router.get('/weekly-stats', PlannerController.getWeeklyStats);
router.get('/monthly', PlannerController.getMonthlyCalendar);

// Date range specific routes
router.get('/today', PlannerController.getToday);
router.get('/week', PlannerController.getWeek);
router.get('/month', PlannerController.getMonth);
router.get('/events', PlannerController.getEventsByRange);

// Event CRUD
router.route('/')
  .get(PlannerController.getEvents)
  .post(validateCreatePlannerEvent, PlannerController.createEvent);

router.route('/:id')
  .get(validateUpdatePlannerEvent, PlannerController.getEventById)
  .patch(validateUpdatePlannerEvent, PlannerController.updateEvent)
  .delete(validateUpdatePlannerEvent, PlannerController.deleteEvent);

export default router;
