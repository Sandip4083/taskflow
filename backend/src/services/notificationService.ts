import { Notification } from '../models/Notification.js';
import mongoose from 'mongoose';

export const createNotification = async (data: {
  type: 'task_assigned' | 'task_updated' | 'comment_added' | 'project_invite' | 'due_soon';
  message: string;
  userId: string;
  relatedTask?: string;
  relatedProject?: string;
}) => {
  const notification = await Notification.create({
    type: data.type,
    message: data.message,
    user: new mongoose.Types.ObjectId(data.userId),
    relatedTask: data.relatedTask ? new mongoose.Types.ObjectId(data.relatedTask) : undefined,
    relatedProject: data.relatedProject ? new mongoose.Types.ObjectId(data.relatedProject) : undefined,
  });

  return notification;
};
