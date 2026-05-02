import type { Response } from 'express';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { AuthRequest } from '../middleware/auth.js';
import { createNotification } from '../services/notificationService.js';

export const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user._id;
  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }],
  }).sort({ updatedAt: -1 });

  res.json({ projects: projects.map(p => p.toJSON()) });
});

export const getProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  // Check access
  const userId = req.user._id.toString();
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((m) => m.toString() === userId);
  if (!isOwner && !isMember) throw new ApiError(403, 'Access denied');

  const tasks = await Task.find({ project: project._id }).sort({ createdAt: -1 });

  // Return flat project + tasks array (matching MSW shape)
  res.json({
    ...project.toJSON(),
    tasks: tasks.map(t => t.toJSON()),
  });
});

export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: [req.user._id],
  });

  res.status(201).json(project.toJSON());
});

export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the owner can update this project');
  }

  const { name, description } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  await project.save();

  res.json(project.toJSON());
});

export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the owner can delete this project');
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.status(204).send();
});

export const addMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the owner can add members');
  }

  const { userId } = req.body;
  if (!userId) throw new ApiError(400, 'userId is required');

  if (project.members.some((m) => m.toString() === userId)) {
    throw new ApiError(409, 'User is already a member');
  }

  project.members.push(userId);
  await project.save();

  await createNotification({
    type: 'project_invite',
    message: `You were added to project "${project.name}"`,
    userId,
    relatedProject: project._id.toString(),
  });

  res.json(project.toJSON());
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  if (project.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the owner can remove members');
  }

  const { userId } = req.params;
  if (userId === project.owner.toString()) {
    throw new ApiError(400, 'Cannot remove the owner');
  }

  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();

  res.json(project.toJSON());
});
