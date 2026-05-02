import { Router } from 'express';
import { getUsers, getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/users', getUsers);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllNotificationsRead);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
