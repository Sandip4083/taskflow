import { Router } from 'express';
import { body } from 'express-validator';
import { getTasks, createTask, updateTask, deleteTask, getTask } from '../controllers/taskController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(auth);

// Project-scoped task routes
router.get('/projects/:id/tasks', getTasks);
router.post(
  '/projects/:id/tasks',
  [body('title').notEmpty().withMessage('Task title is required')],
  validate,
  createTask
);

// Task-specific routes
router.get('/tasks/:id', getTask);
router.patch('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;
