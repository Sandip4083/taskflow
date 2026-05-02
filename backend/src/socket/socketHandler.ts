import type { Server } from 'socket.io';
import { verifyAccessToken } from '../services/authService.js';

export const setupSocket = (io: Server) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = verifyAccessToken(token);
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`🔌 User connected: ${userId}`);

    // Join personal notification room
    socket.join(`user:${userId}`);

    // Join project rooms
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${userId} joined project ${projectId}`);
    });

    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    // Task events — broadcast to project room
    socket.on('task:update', (data: { projectId: string; task: any }) => {
      socket.to(`project:${data.projectId}`).emit('task:updated', data.task);
    });

    socket.on('task:create', (data: { projectId: string; task: any }) => {
      socket.to(`project:${data.projectId}`).emit('task:created', data.task);
    });

    socket.on('task:delete', (data: { projectId: string; taskId: string }) => {
      socket.to(`project:${data.projectId}`).emit('task:deleted', data.taskId);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId}`);
    });
  });
};
