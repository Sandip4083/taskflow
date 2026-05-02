import type { Response } from 'express';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await User.find().select('name email avatar role createdAt');
  // Frontend expects { users: [{ id, name, email }] }
  res.json({
    users: users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
    })),
  });
});

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  );
  res.json({ success: true });
});

export const markAllNotificationsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );
  res.json({ success: true });
});
