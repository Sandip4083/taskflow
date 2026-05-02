import { Router } from 'express';
import { body } from 'express-validator';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(auth);

router.get('/tasks/:taskId/comments', getComments);
router.post(
  '/tasks/:taskId/comments',
  [body('text').notEmpty().withMessage('Comment text is required')],
  validate,
  addComment
);
router.delete('/comments/:commentId', deleteComment);

export default router;
