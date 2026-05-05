import type { Response } from 'express';
import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

export const getComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('author', 'name email avatar')
    .sort({ createdAt: 1 });

  res.json({ comments });
});

export const addComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const comment = await Comment.create({
    text: req.body.text,
    author: req.user._id,
    task: taskId,
  });

  // Add to activity log
  task.activityLog.push({
    action: 'comment_added',
    user: req.user._id,
    timestamp: new Date(),
    details: req.body.text.substring(0, 100),
  });
  await task.save();

  // Notify task assignee
  if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
    await createNotification({
      type: 'comment_added',
      message: `New comment on "${task.title}": ${req.body.text.substring(0, 50)}`,
      userId: task.assignee.toString(),
      relatedTask: taskId as string,
      relatedProject: task.project.toString(),
    });
  }

  const populated = await comment.populate('author', 'name email avatar');
  res.status(201).json(populated.toJSON());
});

export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Cannot delete this comment');
  }

  await comment.deleteOne();
  res.status(204).send();
});
