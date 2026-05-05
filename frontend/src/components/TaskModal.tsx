import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { X, Calendar, Clock, User, MessageSquare, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type Comment = { id: string; text: string; author: { _id: string, name: string }; createdAt: string; };

interface TaskModalProps {
  task: any;
  projectId: string;
  onClose: () => void;
}

export const TaskModal = ({ task, projectId: _projectId, onClose }: TaskModalProps) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['task-comments', task.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/tasks/${task.id}/comments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.comments;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await axios.post(`${API_URL}/tasks/${task.id}/comments`, { text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', task.id] });
      setNewComment('');
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    }
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{task.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md">
                <div className={`w-2 h-2 rounded-full ${task.status === 'todo' ? 'bg-slate-400' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'}`} />
                <span className="capitalize">{task.status.replace('_', ' ')}</span>
              </span>
              <Badge variant={getPriorityVariant(task.priority)} className="capitalize px-2 py-1">{task.priority} Priority</Badge>
              {task.dueDate && (
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-muted-foreground hover:bg-muted">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Description</h3>
                <div className="bg-muted/30 p-4 rounded-lg text-sm text-foreground/90 leading-relaxed border border-border/50 min-h-[100px]">
                  {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Assignee</h3>
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                  {task.assignee ? (
                    <>
                      <Avatar fallback={task.assignee.name} size="sm" />
                      <span className="text-sm font-medium">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comments ({comments.length})
            </h3>
            
            <div className="space-y-4 mb-4">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">No comments yet. Be the first to start the discussion!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar fallback={comment.author.name} size="sm" className="mt-0.5" />
                    <div className="flex-1 bg-muted/30 border border-border/50 p-3 rounded-xl rounded-tl-none">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(comment.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-foreground/90">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 items-start mt-4 pt-2">
              <div className="flex-1">
                <Input 
                  placeholder="Write a comment..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  className="bg-muted/50 border-border"
                />
              </div>
              <Button type="submit" disabled={!newComment.trim() || addCommentMutation.isPending} className="shrink-0">
                {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
