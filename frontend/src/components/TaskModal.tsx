import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar } from './ui/Avatar';
import { X, Calendar, Clock, User, MessageSquare, Send, Loader2, Activity, CheckSquare, Square, Plus, Trash2, ListChecks, Pencil, Check, Circle, ArrowRightCircle, CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '../lib/utils';

type Comment = { id: string; text: string; author: { _id: string, name: string }; createdAt: string; };
type Subtask = { id: string; title: string; completed: boolean; };
type ActivityLogEntry = { action: string; details?: string; timestamp: string; };

type TaskData = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: { _id: string; name: string; avatar?: string };
  dueDate?: string;
  activityLog?: ActivityLogEntry[];
};

interface TaskModalProps {
  task: TaskData;
  projectId: string;
  onClose: () => void;
}

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-400', bg: 'bg-slate-400' },
  { value: 'in_progress', label: 'In Progress', icon: ArrowRightCircle, color: 'text-blue-500', bg: 'bg-blue-500' },
  { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' },
  { value: 'high', label: 'High', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30' },
];

export const TaskModal = ({ task, projectId, onClose }: TaskModalProps) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  // Inline editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  // Dropdown state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  // Activity log toggle
  const [showActivityLog, setShowActivityLog] = useState(false);

  // Focus inputs when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);
  useEffect(() => {
    if (isEditingDescription && descInputRef.current) descInputRef.current.focus();
  }, [isEditingDescription]);

  // Comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['task-comments', task.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/tasks/${task.id}/comments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.comments;
    },
  });

  // Subtasks
  const { data: subtasks = [], isLoading: isLoadingSubtasks } = useQuery<Subtask[]>({
    queryKey: ['task-subtasks', task.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/tasks/${task.id}/subtasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.subtasks;
    },
  });

  // Fetch full task data (for activity log)
  const { data: fullTaskData } = useQuery<TaskData>({
    queryKey: ['task-detail', task.id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/tasks/${task.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

  const activityLog = fullTaskData?.activityLog || task.activityLog || [];

  // Update task mutation (for inline edits, status, priority)
  const updateTaskMutation = useMutation({
    mutationFn: async (updates: Partial<TaskData>) => {
      const res = await axios.patch(`${API_URL}/tasks/${task.id}`, updates, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task-detail', task.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
    onError: () => {
      toast.error('Failed to update task');
    }
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

  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await axios.post(`${API_URL}/tasks/${task.id}/subtasks`, { title }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', task.id] });
      setNewSubtask('');
      toast.success('Subtask added');
    },
    onError: () => {
      toast.error('Failed to add subtask');
    }
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const res = await axios.patch(`${API_URL}/subtasks/${subtaskId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', task.id] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      await axios.delete(`${API_URL}/subtasks/${subtaskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-subtasks', task.id] });
      toast.success('Subtask removed');
    },
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    addSubtaskMutation.mutate(newSubtask);
  };

  // Inline edit handlers
  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTaskMutation.mutate({ title: editTitle.trim() });
      toast.success('Title updated');
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (editDescription !== task.description) {
      updateTaskMutation.mutate({ description: editDescription });
      toast.success('Description updated');
    }
    setIsEditingDescription(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== task.status) {
      updateTaskMutation.mutate({ status: newStatus });
      const label = statusOptions.find(s => s.value === newStatus)?.label;
      toast.success(`Status changed to ${label}`);
    }
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (newPriority: string) => {
    if (newPriority !== task.priority) {
      updateTaskMutation.mutate({ priority: newPriority });
      toast.success(`Priority changed to ${newPriority}`);
    }
    setShowPriorityDropdown(false);
  };



  const getDueDateStyle = () => {
    if (!task.dueDate) return {};
    const due = new Date(task.dueDate);
    if (task.status === 'done') return { variant: 'success' as const, label: 'Completed' };
    if (isPast(due) && !isToday(due)) return { variant: 'danger' as const, label: 'Overdue' };
    if (isToday(due)) return { variant: 'warning' as const, label: 'Due today' };
    if (isTomorrow(due)) return { variant: 'warning' as const, label: 'Due tomorrow' };
    return { variant: 'outline' as const, label: null };
  };

  const dueDateStyle = getDueDateStyle();
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const currentStatus = statusOptions.find(s => s.value === task.status);
  const currentPriority = priorityOptions.find(p => p.value === task.priority);

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
            {/* Inline editable title */}
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') { setEditTitle(task.title); setIsEditingTitle(false); } }}
                  className="text-lg sm:text-2xl font-bold tracking-tight bg-transparent border-b-2 border-primary/50 focus:outline-none focus:border-primary w-full py-0.5"
                  aria-label="Edit task title"
                  placeholder="Task title"
                />
                <button onClick={handleSaveTitle} className="p-1 hover:bg-primary/10 rounded text-primary shrink-0" title="Save title">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h2 
                className="text-lg sm:text-2xl font-bold tracking-tight line-clamp-2 group cursor-pointer hover:text-primary/80 transition-colors flex items-start gap-2"
                onClick={() => { setEditTitle(task.title); setIsEditingTitle(true); }}
              >
                {task.title}
                <Pencil className="w-3.5 h-3.5 mt-1.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
              </h2>
            )}

            {/* Interactive status & priority badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm text-muted-foreground">
              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowPriorityDropdown(false); }}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full border border-border/50 hover:border-primary/30 transition-all text-[10px] sm:text-xs bg-card hover:bg-muted/30"
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${currentStatus?.bg}`} />
                  <span className="capitalize font-medium">{task.status.replace('_', ' ')}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-muted-foreground/50" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute left-0 top-full mt-1 z-30 bg-card border border-border/50 rounded-lg shadow-xl p-1 min-w-[150px] status-menu">
                    {statusOptions.map(s => {
                      const StatusIcon = s.icon;
                      return (
                        <button
                          key={s.value}
                          onClick={() => handleStatusChange(s.value)}
                          className={cn(
                            "flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md transition-all",
                            task.status === s.value 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          <StatusIcon className={cn("w-3.5 h-3.5", s.color)} />
                          {s.label}
                          {task.status === s.value && <CheckCircle className="w-3 h-3 ml-auto text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Priority dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowStatusDropdown(false); }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all text-[10px] sm:text-xs capitalize font-medium hover:opacity-80",
                    currentPriority?.bg
                  )}
                >
                  {task.priority}
                  <ChevronDown className="w-2.5 h-2.5 opacity-50" />
                </button>
                {showPriorityDropdown && (
                  <div className="absolute left-0 top-full mt-1 z-30 bg-card border border-border/50 rounded-lg shadow-xl p-1 min-w-[120px] status-menu">
                    {priorityOptions.map(p => (
                      <button
                        key={p.value}
                        onClick={() => handlePriorityChange(p.value)}
                        className={cn(
                          "flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md transition-all capitalize",
                          task.priority === p.value 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full", p.value === 'high' ? 'bg-red-500' : p.value === 'medium' ? 'bg-amber-500' : 'bg-blue-500')} />
                        {p.label}
                        {task.priority === p.value && <CheckCircle className="w-3 h-3 ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {task.dueDate && (
                <Badge variant={dueDateStyle.variant || 'outline'} className="gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {format(new Date(task.dueDate), 'MMM d')}
                  {dueDateStyle.label && <span className="font-bold">· {dueDateStyle.label}</span>}
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

        {/* Close dropdowns when clicking body */}
        {(showStatusDropdown || showPriorityDropdown) && (
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => { setShowStatusDropdown(false); setShowPriorityDropdown(false); }} 
          />
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-8 custom-scrollbar">
          
          {/* Details */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-2 space-y-3 sm:space-y-4">
              <div>
                <h3 className="font-semibold mb-1.5 sm:mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Description
                </h3>
                {/* Inline editable description */}
                {isEditingDescription ? (
                  <div className="relative">
                    <textarea
                      ref={descInputRef}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      onBlur={handleSaveDescription}
                      onKeyDown={(e) => { if (e.key === 'Escape') { setEditDescription(task.description || ''); setIsEditingDescription(false); } }}
                      className="w-full bg-muted/20 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-foreground/90 leading-relaxed border-2 border-primary/30 min-h-[100px] sm:min-h-[120px] focus:outline-none focus:border-primary/50 resize-none"
                      placeholder="Add a description..."
                    />
                    <div className="flex justify-end gap-1.5 mt-1.5">
                      <button 
                        onClick={() => { setEditDescription(task.description || ''); setIsEditingDescription(false); }}
                        className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveDescription}
                        className="text-[10px] sm:text-xs text-primary font-medium hover:bg-primary/10 px-2 py-1 rounded transition-all flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="bg-muted/20 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm text-foreground/90 leading-relaxed border border-border/30 min-h-[60px] sm:min-h-[100px] cursor-pointer hover:border-primary/20 transition-all group relative"
                    onClick={() => { setEditDescription(task.description || ''); setIsEditingDescription(true); }}
                  >
                    {task.description || <span className="text-muted-foreground italic">Click to add a description...</span>}
                    <Pencil className="w-3 h-3 absolute top-3 right-3 opacity-0 group-hover:opacity-40 text-muted-foreground transition-opacity" />
                  </div>
                )}
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
                  <div className={cn(
                    "bg-muted/20 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-medium",
                    dueDateStyle.variant === 'danger' ? 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400' :
                    dueDateStyle.variant === 'warning' ? 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400' :
                    'border-border/30'
                  )}>
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    {dueDateStyle.label && <span className="block text-[10px] mt-0.5 font-bold">{dueDateStyle.label}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-xs sm:text-sm">
                <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> 
                Checklist ({completedSubtasks}/{subtasks.length})
              </h3>
              {subtasks.length > 0 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{subtaskProgress}%</span>
              )}
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-700 ease-out",
                    subtaskProgress === 100 ? 'bg-emerald-500' : 'bg-primary'
                  )}
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              {isLoadingSubtasks ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : subtasks.length === 0 ? (
                <div className="text-center py-3 sm:py-4 border-2 border-dashed border-border/30 rounded-lg sm:rounded-xl">
                  <ListChecks className="w-6 h-6 text-muted-foreground/20 mx-auto mb-1" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">No checklist items yet.</p>
                </div>
              ) : (
                subtasks.map((subtask) => (
                  <div 
                    key={subtask.id} 
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border border-border/30 group transition-all duration-200 hover:border-primary/20",
                      subtask.completed && "bg-muted/20 opacity-70"
                    )}
                  >
                    <button
                      onClick={() => toggleSubtaskMutation.mutate(subtask.id)}
                      className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {subtask.completed ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    <span className={cn(
                      "text-xs sm:text-sm flex-1 transition-all",
                      subtask.completed && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                      title="Delete subtask"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add subtask form */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 items-center">
              <div className="flex-1">
                <Input 
                  placeholder="Add a checklist item..." 
                  value={newSubtask} 
                  onChange={(e) => setNewSubtask(e.target.value)} 
                  className="bg-muted/30 border-border/50 text-sm h-9"
                />
              </div>
              <Button type="submit" disabled={!newSubtask.trim() || addSubtaskMutation.isPending} size="sm" variant="outline" className="shrink-0 h-9">
                {addSubtaskMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              </Button>
            </form>
          </div>

          {/* Activity Log Section */}
          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-border/30">
            <button
              onClick={() => setShowActivityLog(!showActivityLog)}
              className="font-semibold flex items-center gap-2 text-xs sm:text-sm w-full hover:text-primary/80 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> 
              Activity Log ({activityLog.length})
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground/50 ml-auto transition-transform", showActivityLog && "rotate-180")} />
            </button>

            {showActivityLog && (
              <div className="space-y-2 animate-fade-in">
                {activityLog.length === 0 ? (
                  <div className="text-center py-3 sm:py-4 border-2 border-dashed border-border/30 rounded-lg sm:rounded-xl">
                    <Activity className="w-6 h-6 text-muted-foreground/20 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">No activity recorded.</p>
                  </div>
                ) : (
                  <div className="relative space-y-0">
                    {/* Timeline line */}
                    <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/40" />
                    {activityLog.slice().reverse().slice(0, 10).map((entry, idx) => (
                      <div key={idx} className="flex items-start gap-3 py-2 relative animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                        <div className={cn(
                          "w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 z-10 ring-3 ring-card",
                          entry.action === 'created' ? 'bg-emerald-500' : 'bg-blue-500'
                        )}>
                          {entry.action === 'created' ? (
                            <Plus className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <Pencil className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-xs text-foreground/80 leading-relaxed">
                            <span className="font-medium capitalize">{entry.action}</span>
                            {entry.details && <span className="text-muted-foreground"> — {entry.details}</span>}
                          </p>
                          {entry.timestamp && (
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 mt-0.5 font-medium">
                              {(() => { try { return format(new Date(entry.timestamp), 'MMM d, h:mm a'); } catch { return ''; } })()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
