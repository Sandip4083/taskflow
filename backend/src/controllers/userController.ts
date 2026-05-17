import type { Response } from 'express';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { generateAccessToken } from '../services/authService.js';

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

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new (await import('../utils/ApiError.js')).ApiError(404, 'User not found');

  const { name } = req.body;
  if (name !== undefined) user.name = name.trim();

  await user.save();

  // Return new token so frontend updates auth state
  const token = generateAccessToken(user);
  res.json({ user: user.toJSON(), token });
});

export const updateAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { ApiError } = await import('../utils/ApiError.js');
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, 'User not found');

  const { avatar } = req.body;
  if (!avatar) throw new ApiError(400, 'Avatar data is required');

  // Validate it's a data URL image (base64)
  if (!avatar.startsWith('data:image/')) {
    throw new ApiError(400, 'Invalid image format. Must be a data URL.');
  }

  // Check size (~2MB limit for base64)
  if (avatar.length > 2 * 1024 * 1024) {
    throw new ApiError(400, 'Image too large. Max 2MB.');
  }

  user.avatar = avatar;
  await user.save();

  const token = generateAccessToken(user);
  res.json({ user: user.toJSON(), token });
});
