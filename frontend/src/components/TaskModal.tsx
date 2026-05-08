import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { X, Calendar, Clock, User, MessageSquare, Send, Loader2, Activity } from 'lucide-react';
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
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border/50 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-scale-in sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient accent */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 shrink-0" />
        
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-border/30">
          <div className="space-y-2 flex-1 pr-3 sm:pr-4 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight line-clamp-2">{task.title}</h2>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1 sm:gap-1.5 capitalize text-[10px] sm:text-xs">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${task.status === 'todo' ? 'bg-slate-400' : task.status === 'in_progress' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant={getPriorityVariant(task.priority)} className="capitalize text-[10px] sm:text-xs">
                {task.priority}
              </Badge>
              {task.dueDate && (
                <Badge variant="outline" className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:bg-muted shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-8 custom-scrollbar">
          
          {/* Details */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-2 space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Description
                </h3>
                <div className="bg-muted/20 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-foreground/90 leading-relaxed border border-border/30 min-h-[60px] sm:min-h-[100px]">
                  {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
                </div>
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-col gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Assignee
                </h3>
                <div className="flex items-center gap-2 sm:gap-3 bg-muted/20 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border/30">
                  {task.assignee ? (
                    <>
                      <Avatar fallback={task.assignee.name} size="sm" />
                      <span className="text-xs sm:text-sm font-medium truncate">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm text-muted-foreground italic">Unassigned</span>
                  )}
                </div>
              </div>
              {task.dueDate && (
                <div className="flex-1">
                  <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Due Date
                  </h3>
                  <div className="bg-muted/20 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-border/30 text-xs sm:text-sm font-medium">
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border/30">
            <h3 className="font-semibold flex items-center gap-2 text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Comments ({comments.length})
            </h3>
            
            <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
              {isLoadingComments ? (
                <div className="flex items-center justify-center py-4 sm:py-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 sm:py-6 border-2 border-dashed border-border/30 rounded-lg sm:rounded-xl">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/30 mx-auto mb-1.5 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground">No comments yet.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 sm:gap-3 animate-fade-in-up">
                    <Avatar fallback={comment.author.name} size="sm" className="mt-0.5 shrink-0 w-6 h-6 sm:w-7 sm:h-7 text-[9px]" />
                    <div className="flex-1 bg-muted/15 border border-border/30 p-2.5 sm:p-3 rounded-lg sm:rounded-xl rounded-tl-sm min-w-0">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1 gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate">{comment.author.name}</span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium whitespace-nowrap">{format(new Date(comment.createdAt), 'MMM d')}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 items-start mt-3 sm:mt-4 pt-2">
              <div className="flex-1">
                <Input 
                  placeholder="Write a comment..." 
                  value={newComment} 
                  onChange={(e) => setNewComment(e.target.value)} 
                  className="bg-muted/30 border-border/50 text-sm"
                />
              </div>
              <Button type="submit" disabled={!newComment.trim() || addCommentMutation.isPending} className="shrink-0" size="sm">
                {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
