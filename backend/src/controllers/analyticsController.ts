import type { Response } from 'express';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';

export const getOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;

  // Get user's projects
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  });
  const projectIds = projects.map((p) => p._id);

  // Aggregate task stats
  const [stats] = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              { $and: [{ $ne: ['$status', 'done'] }, { $lt: ['$dueDate', new Date()] }, { $ne: ['$dueDate', null] }] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Tasks by priority
  const byPriority = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  // Per-project stats
  const projectStats = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project',
      },
    },
    { $unwind: '$project' },
    {
      $project: {
        name: '$project.name',
        total: 1,
        done: 1,
        progress: { $cond: [{ $eq: ['$total', 0] }, 0, { $multiply: [{ $divide: ['$done', '$total'] }, 100] }] },
      },
    },
  ]);

  // Recent activity (last 20 tasks updated)
  const recentActivity = await Task.find({ project: { $in: projectIds } })
    .populate('assignee', 'name avatar')
    .sort({ updatedAt: -1 })
    .limit(20)
    .select('title status priority updatedAt project');

  res.json({
    stats: stats || { total: 0, todo: 0, inProgress: 0, done: 0, highPriority: 0, overdue: 0 },
    byPriority,
    projectStats,
    recentActivity,
    totalProjects: projects.length,
  });
});

export const getProductivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  });
  const projectIds = projects.map((p) => p._id);

  // Tasks completed per week (last 12 weeks)
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const weekly = await Task.aggregate([
    {
      $match: {
        project: { $in: projectIds },
        status: 'done',
        updatedAt: { $gte: twelveWeeksAgo },
      },
    },
    {
      $group: {
        _id: { $week: '$updatedAt' },
        count: { $sum: 1 },
        year: { $first: { $year: '$updatedAt' } },
      },
    },
    { $sort: { year: 1, '_id': 1 } },
  ]);

  res.json({ weekly });
});
