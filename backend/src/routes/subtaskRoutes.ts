import { Router } from 'express';
import { body } from 'express-validator';
import { getSubtasks, addSubtask, toggleSubtask, deleteSubtask } from '../controllers/subtaskController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(auth);

router.get('/tasks/:taskId/subtasks', getSubtasks);
router.post(
  '/tasks/:taskId/subtasks',
  [body('title').notEmpty().withMessage('Subtask title is required')],
  validate,
  addSubtask
);
router.patch('/subtasks/:subtaskId/toggle', toggleSubtask);
router.delete('/subtasks/:subtaskId', deleteSubtask);

export default router;
