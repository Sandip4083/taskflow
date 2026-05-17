import type { Response } from 'express';
import { Subtask } from '../models/Subtask.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getSubtasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subtasks = await Subtask.find({ task: req.params.taskId }).sort({ createdAt: 1 });
  res.json({ subtasks: subtasks.map(s => s.toJSON()) });
});

export const addSubtask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const subtask = await Subtask.create({
    title: req.body.title,
    task: taskId,
  });

  // Add to activity log
  task.activityLog.push({
    action: 'subtask_added',
    user: req.user._id,
    timestamp: new Date(),
    details: `Added subtask: "${req.body.title}"`,
  });
  await task.save();

  res.status(201).json(subtask.toJSON());
});

export const toggleSubtask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subtask = await Subtask.findById(req.params.subtaskId);
  if (!subtask) throw new ApiError(404, 'Subtask not found');

  subtask.completed = !subtask.completed;
  await subtask.save();

  res.json(subtask.toJSON());
});

export const deleteSubtask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const subtask = await Subtask.findById(req.params.subtaskId);
  if (!subtask) throw new ApiError(404, 'Subtask not found');

  await subtask.deleteOne();
  res.status(204).send();
});
