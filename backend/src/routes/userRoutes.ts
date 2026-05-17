import { Router } from 'express';
import { body } from 'express-validator';
import { getUsers, getNotifications, markNotificationRead, markAllNotificationsRead, updateProfile, updateAvatar } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(auth);

router.get('/users', getUsers);
router.patch(
  '/users/profile',
  [body('name').optional().isLength({ min: 1 }).withMessage('Name cannot be empty')],
  validate,
  updateProfile
);
router.patch('/users/avatar', updateAvatar);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
