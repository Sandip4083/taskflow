import type { Response } from 'express';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

export const getTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: projectId } = req.params;
  const { status, priority, assignee, search, sortBy, order } = req.query;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const filter: any = { project: projectId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortField = (sortBy as string) || 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const tasks = await Task.find(filter).sort({ [sortField]: sortOrder });

  res.json({ tasks: tasks.map(t => t.toJSON()) });
});

export const createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: projectId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  // Frontend sends assignee_id and due_date — map to backend fields
  const { title, description, status, priority, assignee_id, due_date } = req.body;

  const task = await Task.create({
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    project: projectId,
    assignee: assignee_id || undefined,
    dueDate: due_date || undefined,
    activityLog: [
      {
        action: 'created',
        user: req.user._id,
        details: `Task "${title}" created`,
      },
    ],
  });

  // Notify assignee
  if (assignee_id && assignee_id !== req.user._id.toString()) {
    await createNotification({
      type: 'task_assigned',
      message: `You were assigned to "${title}" in ${project.name}`,
      userId: assignee_id,
      relatedTask: task._id.toString(),
      relatedProject: projectId as string,
    });
  }

  res.status(201).json(task.toJSON());
});

export const updateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  // Accept both frontend snake_case and backend camelCase
  const { title, description, status, priority, assignee_id, due_date } = req.body;
  const changes: string[] = [];

  if (title !== undefined && title !== task.title) { changes.push(`title → "${title}"`); task.title = title; }
  if (description !== undefined) { task.description = description; }
  if (status !== undefined && status !== task.status) { changes.push(`status → ${status}`); task.status = status; }
  if (priority !== undefined && priority !== task.priority) { changes.push(`priority → ${priority}`); task.priority = priority; }
  if (due_date !== undefined) { task.dueDate = due_date; }

  if (assignee_id !== undefined && assignee_id !== task.assignee?.toString()) {
    changes.push('assignee changed');
    task.assignee = assignee_id || undefined;
    if (assignee_id && assignee_id !== req.user._id.toString()) {
      const project = await Project.findById(task.project);
      await createNotification({
        type: 'task_assigned',
        message: `You were assigned to "${task.title}" in ${project?.name}`,
        userId: assignee_id,
        relatedTask: task._id.toString(),
        relatedProject: task.project.toString(),
      });
    }
  }

  if (changes.length > 0) {
    task.activityLog.push({
      action: 'updated',
      user: req.user._id,
      timestamp: new Date(),
      details: changes.join(', '),
    });
  }

  await task.save();
  res.json(task.toJSON());
});

export const deleteTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  await task.deleteOne();
  res.status(204).send();
});

export const getTask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  res.json(task.toJSON());
});
