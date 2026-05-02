import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember,
} from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(auth);

router.get('/', getProjects);
router.get('/:id', getProject);

router.post(
  '/',
  [body('name').notEmpty().withMessage('Project name is required')],
  validate,
  createProject
);

router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', [body('userId').notEmpty()], validate, addMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
