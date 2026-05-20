/* cSpell:words pangea */
import { isPast, isToday as dateIsToday } from 'date-fns';
import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Plus, ArrowLeft, Trash2, Calendar, AlertCircle, Loader2, GripVertical, CheckCircle2, Search, Filter, Download, UserPlus, X as XIcon, ChevronDown, ChevronRight, Circle, ArrowRightCircle, CheckCircle, MoreHorizontal, Layers } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import { TaskModal } from '../components/TaskModal';

type Task = { id: string; title: string; description: string; status: string; priority: string; assignee?: { _id: string, name: string, avatar?: string }; dueDate?: string; order?: number; };
type Project = { id: string; name: string; description: string; owner: string; members: string[]; tasks: Task[] };

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-slate-400', headerBg: 'from-slate-500/10 to-transparent', borderColor: 'border-slate-300/30 dark:border-slate-600/30', icon: Circle, iconColor: 'text-slate-400' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', headerBg: 'from-blue-500/10 to-transparent', borderColor: 'border-blue-300/30 dark:border-blue-600/30', icon: ArrowRightCircle, iconColor: 'text-blue-500' },
  done: { label: 'Done', color: 'bg-emerald-500', headerBg: 'from-emerald-500/10 to-transparent', borderColor: 'border-emerald-300/30 dark:border-emerald-600/30', icon: CheckCircle, iconColor: 'text-emerald-500' },
};

const STATUSES = ['todo', 'in_progress', 'done'] as const;

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New features state
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [statusMenuTaskId, setStatusMenuTaskId] = useState<string | null>(null);

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

  // Derive allDone from project data
  const allDone = useMemo(() => {
    return !!(project && project.tasks.length > 0 && project.tasks.every(t => t.status === 'done'));
  }, [project]);

  // Trigger confetti via callback (not inside an effect)
  const triggerConfetti = useCallback(() => {
    if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
    setShowConfetti(true);
    confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => {
      await axios.patch(`${API_URL}/tasks/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['project', id] });
      const previousProject = queryClient.getQueryData<Project>(['project', id]);
      if (previousProject) {
        queryClient.setQueryData(['project', id], {
          ...previousProject,
          tasks: previousProject.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
        });
      }
      return { previousProject };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', id], context.previousProject);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, 'id' | 'assignee' | 'dueDate'> & { assignee_id?: string, due_date?: string }) => {
      const res = await axios.post(`${API_URL}/projects/${id}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      setIsCreatingTask(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });
      toast.success('Task created successfully');
    },
    onError: () => {
      toast.error('Failed to create task');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await axios.delete(`${API_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['project', id] });
      const previousProject = queryClient.getQueryData<Project>(['project', id]);
      if (previousProject) {
        queryClient.setQueryData(['project', id], {
          ...previousProject,
          tasks: previousProject.tasks.filter(t => t.id !== taskId)
        });
      }
      return { previousProject };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(['project', id], context.previousProject);
      }
      toast.error('Failed to delete task');
    },
    onSuccess: () => {
      toast.success('Task deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
    }
  });

  // ── FIXED drag-and-drop handler ──────────────────────────────────
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (!project) return;

    const task = project.tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Step 1: Build column arrays (clean copies, no shared references)
    const columns: Record<string, Task[]> = {};
    for (const status of STATUSES) {
      columns[status] = project.tasks
        .filter(t => t.status === status)
        .map(t => ({ ...t })); // shallow clone each task
    }

    // Step 2: Remove the dragged task from the source column
    const sourceColumn = columns[source.droppableId];
    const [removedTask] = sourceColumn.splice(source.index, 1);

    // Step 3: Update status if cross-column move
    if (source.droppableId !== destination.droppableId) {
      removedTask.status = destination.droppableId;
    }

    // Step 4: Insert into destination column at the correct index
    const destColumn = columns[destination.droppableId];
    destColumn.splice(destination.index, 0, removedTask);

    // Step 5: Flatten all columns back into a single array
    const reordered = STATUSES.flatMap(status => columns[status]);

    // Step 6: Optimistic UI update
    queryClient.setQueryData(['project', id], {
      ...project,
      tasks: reordered,
    });

    // Step 7: Persist cross-column status change to the server
    if (source.droppableId !== destination.droppableId) {
      updateTaskMutation.mutate({ taskId: draggableId, updates: { status: destination.droppableId } });

      const destLabel = statusConfig[destination.droppableId as keyof typeof statusConfig]?.label;
      if (destination.droppableId === 'done') {
        toast.success(`✅ Task completed!`);
        const remainingUndone = project.tasks.filter(t => t.id !== draggableId && t.status !== 'done').length;
        if (remainingUndone === 0) triggerConfetti();
      } else {
        toast.success(`Task moved to ${destLabel}`);
      }
    }
  };

  // ── Quick status change ────────────────────────────────────────
  const handleQuickStatusChange = (taskId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusMenuTaskId(null);
    const task = project?.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });

    const destLabel = statusConfig[newStatus as keyof typeof statusConfig]?.label;
    if (newStatus === 'done') {
      toast.success(`✅ Task completed!`);
      const remainingUndone = project?.tasks.filter(t => t.id !== taskId && t.status !== 'done').length ?? 1;
      if (remainingUndone === 0) triggerConfetti();
    } else {
      toast.success(`Task moved to ${destLabel}`);
    }
  };

  // ── Bulk actions ──────────────────────────────────────────────
  const toggleTaskSelection = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedTasks.size} selected task(s)?`)) return;
    selectedTasks.forEach(taskId => deleteTaskMutation.mutate(taskId));
    setSelectedTasks(new Set());
    setBulkMode(false);
    toast.success(`${selectedTasks.size} task(s) deleted`);
  };

  const handleBulkMove = (newStatus: string) => {
    selectedTasks.forEach(taskId => {
      updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
    });
    const destLabel = statusConfig[newStatus as keyof typeof statusConfig]?.label;
    toast.success(`${selectedTasks.size} task(s) moved to ${destLabel}`);
    setSelectedTasks(new Set());
    setBulkMode(false);
  };

  const toggleBulkMode = () => {
    setBulkMode(prev => !prev);
    if (bulkMode) setSelectedTasks(new Set());
  };

  // ── Column collapse ──────────────────────────────────────────
  const toggleColumnCollapse = (status: string) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl h-full flex flex-col">
        <div className="animate-fade-in-down mb-6 sm:mb-8">
          <div className="h-9 w-20 skeleton rounded mb-4" />
          <div className="bg-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border/50">
            <div className="h-7 w-48 skeleton mb-2" />
            <div className="h-4 w-64 skeleton mb-4" />
            <div className="h-2 w-40 skeleton rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-6 flex-1">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-xl sm:rounded-2xl border border-border/30 p-3 sm:p-4 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 skeleton rounded-full" />
                  <div className="h-4 w-20 skeleton" />
                </div>
                <div className="h-5 w-6 skeleton rounded-full" />
              </div>
              <div className="space-y-3">
                {[1,2].map(j => (
                  <div key={j} className="rounded-xl border bg-card p-3 sm:p-4">
                    <div className="h-4 w-3/4 skeleton mb-2" />
                    <div className="h-3 w-full skeleton mb-3" />
                    <div className="flex gap-2">
                      <div className="h-4 w-12 skeleton rounded-full" />
                      <div className="h-4 w-16 skeleton rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !project) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-destructive">
        <AlertCircle className="h-12 w-12 opacity-50" />
        <p className="font-medium text-sm sm:text-base">Project not found or access denied</p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Projects</Button>
      </div>
    );
  }

  // Apply filters to tasks
  const filteredTasks = project.tasks.filter(t => {
    if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase()) && !t.description?.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const groupedTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    done: filteredTasks.filter(t => t.status === 'done'),
  };

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const activeFilters = (filterSearch ? 1 : 0) + (filterPriority !== 'all' ? 1 : 0);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Assignee', 'Due Date'];
    const rows = project.tasks.map(t => [
      t.title,
      t.description || '',
      t.status,
      t.priority,
      t.assignee?.name || 'Unassigned',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_tasks.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Tasks exported to CSV');
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl h-full flex flex-col relative">
      {/* Confetti overlay — only the animation, not persistent */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎉</div>
            <p className="text-xl sm:text-2xl font-bold text-foreground bg-card/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-primary/30 shadow-xl">
              All tasks completed!
            </p>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 animate-fade-in-down">
        <Button variant="ghost" className="mb-3 sm:mb-4 -ml-2 sm:-ml-4 text-muted-foreground hover:bg-muted/50 group text-sm" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </Button>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 bg-gradient-to-r from-card to-card/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border/50 shadow-sm">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground truncate">{project.name}</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-base line-clamp-2">{project.description || 'No description'}</p>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3">
              <div className="flex-1 max-w-[200px] sm:max-w-xs h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-emerald-500'}`} style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap">{progress}%</span>
              <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:flex">{totalTasks} tasks</Badge>
              {allDone && totalTasks > 0 && (
                <Badge variant="success" className="text-[10px] sm:text-xs gap-1 hidden sm:flex">
                  <CheckCircle2 className="w-3 h-3" /> All Done!
                </Badge>
              )}
            </div>
          </div>
          <Button onClick={() => setIsCreatingTask(true)} className="shadow-md shadow-primary/20 w-full sm:w-auto mt-2 sm:mt-0">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-2 mb-4 animate-fade-in">
        <div className="relative flex-1 min-w-[150px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input 
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-card border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none focus:border-primary/50 transition-all"
          />
          {filterSearch && (
            <button onClick={() => setFilterSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded" title="Clear search">
              <XIcon className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm border rounded-lg transition-all ${
            activeFilters > 0 ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border/50 bg-card text-muted-foreground hover:border-primary/30'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
          {activeFilters > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilters}</span>
          )}
        </button>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm border border-border/50 bg-card text-muted-foreground rounded-lg hover:border-primary/30 transition-all"
          title="Export tasks to CSV"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>

        <button
          onClick={() => setShowMemberModal(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm border border-border/50 bg-card text-muted-foreground rounded-lg hover:border-primary/30 transition-all"
          title="Manage members"
        >
          <UserPlus className="w-3.5 h-3.5" /> Members
        </button>

        {/* Bulk select toggle */}
        <button
          onClick={toggleBulkMode}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm border rounded-lg transition-all ${
            bulkMode ? 'border-primary/50 bg-primary/5 text-primary' : 'border-border/50 bg-card text-muted-foreground hover:border-primary/30'
          }`}
          title="Toggle bulk selection mode"
        >
          <Layers className="w-3.5 h-3.5" /> Select
        </button>
      </div>

      {/* Bulk actions toolbar */}
      {bulkMode && selectedTasks.size > 0 && (
        <div className="flex-shrink-0 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl flex flex-wrap gap-2 items-center bulk-toolbar">
          <span className="text-xs sm:text-sm font-semibold text-primary mr-2">
            {selectedTasks.size} selected
          </span>
          <div className="flex gap-1.5">
            {STATUSES.map(status => {
              const config = statusConfig[status];
              return (
                <button
                  key={status}
                  onClick={() => handleBulkMove(status)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] sm:text-xs font-medium bg-card border border-border/50 rounded-lg hover:border-primary/30 transition-all"
                >
                  <div className={`w-2 h-2 rounded-full ${config.color}`} />
                  {config.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-destructive bg-destructive/5 border border-destructive/20 rounded-lg hover:bg-destructive/10 transition-all ml-auto"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <button
            onClick={() => { setSelectedTasks(new Set()); setBulkMode(false); }}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all"
            title="Clear selection"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="flex-shrink-0 mb-4 p-3 bg-card border border-border/50 rounded-xl flex flex-wrap gap-3 items-center animate-fade-in-down">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">Priority:</label>
            <div className="flex gap-1">
              {['all', 'high', 'medium', 'low'].map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 text-[10px] sm:text-xs font-medium rounded-md capitalize transition-all ${
                    filterPriority === p 
                      ? p === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                        : p === 'medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                        : p === 'low' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                        : 'bg-primary/10 text-primary border border-primary/30'
                      : 'bg-muted/50 text-muted-foreground border border-transparent hover:border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterSearch(''); setFilterPriority('all'); }}
              className="text-[10px] sm:text-xs text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Member management modal */}
      {showMemberModal && (
        <div className="flex-shrink-0 mb-4 p-4 bg-card border border-border/50 rounded-xl animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Team Members</h3>
            <button onClick={() => setShowMemberModal(false)} className="p-1 hover:bg-muted rounded" title="Close members panel">
              <XIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Enter member email..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <Button size="sm" onClick={() => { toast.info('Member invite sent (demo)'); setMemberEmail(''); }}>
              <UserPlus className="w-3.5 h-3.5" /> Invite
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/30">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">O</div>
              <span className="text-xs font-medium">Owner (You)</span>
            </div>
            {project.members?.length > 0 ? project.members.map((_m, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/30">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-500">M</div>
                <span className="text-xs text-muted-foreground">Member {i + 1}</span>
              </div>
            )) : (
              <span className="text-xs text-muted-foreground/60 py-1.5">No other members yet</span>
            )}
          </div>
        </div>
      )}

      {isCreatingTask && (
        <Card className="mb-6 sm:mb-8 border-primary/20 shadow-lg shadow-primary/5 flex-shrink-0 bg-card overflow-hidden animate-scale-in">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-blue-500" />
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(newTask); }} className="space-y-3 sm:grid sm:gap-4 sm:grid-cols-2 sm:space-y-0">
              <div className="sm:col-span-2">
                <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus required placeholder="E.g., Update landing page" />
              </div>
              <div className="sm:col-span-2">
                <Input label="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Details..." />
              </div>
              <div>
                 <label className="text-xs sm:text-sm font-medium leading-none block mb-1.5 sm:mb-2">Priority</label>
                 <select aria-label="Task priority" className="flex h-10 sm:h-11 w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                 </select>
              </div>
              <div>
                 <label className="text-xs sm:text-sm font-medium leading-none block mb-1.5 sm:mb-2">Due Date</label>
                 <Input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 mt-2 sm:mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsCreatingTask(false)}>Cancel</Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Save
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {/* Horizontal scroll on mobile for the kanban columns */}
        <div className="flex-1 min-h-[400px] sm:min-h-[500px] pb-4" style={{ overflowX: 'auto' }}>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 min-w-[720px] md:min-w-0 h-full">
            {STATUSES.map(status => {
              const config = statusConfig[status];
              const isCollapsed = collapsedColumns.has(status);
              const columnTasks = groupedTasks[status];
              const columnPercentage = totalTasks > 0 ? Math.round((columnTasks.length / totalTasks) * 100) : 0;

              return (
                <div key={status} className={`bg-gradient-to-b ${config.headerBg} rounded-xl sm:rounded-2xl flex flex-col border ${config.borderColor} h-full overflow-hidden animate-fade-in-up`}>
                  {/* Column header */}
                  <div className="font-semibold p-3 sm:p-4 capitalize flex justify-between items-center text-foreground shrink-0 border-b border-border/30 text-xs sm:text-base">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      {/* Collapse/expand toggle */}
                      <button
                        onClick={() => toggleColumnCollapse(status)}
                        className="p-0.5 hover:bg-muted/50 rounded transition-all"
                        title={isCollapsed ? 'Expand column' : 'Collapse column'}
                      >
                        {isCollapsed 
                          ? <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                          : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                        }
                      </button>
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${config.color} shadow-sm`} />
                      <span>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Column percentage */}
                      {totalTasks > 0 && (
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium">
                          {columnPercentage}%
                        </span>
                      )}
                      <span className="bg-background/80 border border-border/50 text-muted-foreground text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Column content — collapsible */}
                  {!isCollapsed && (
                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div 
                          className={`flex-1 p-2 sm:p-3 overflow-y-auto custom-scrollbar transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset rounded-b-xl' : ''}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <div className="space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[100px]">
                            {columnTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style }}
                                  >
                                    <Card 
                                      onClick={() => !bulkMode ? setSelectedTask(task) : toggleTaskSelection(task.id, { stopPropagation: () => {} } as React.MouseEvent)}
                                      className={`cursor-pointer transition-all duration-200 bg-card group ${
                                        snapshot.isDragging 
                                          ? 'shadow-2xl ring-2 ring-primary/40 scale-[1.03] rotate-[1deg]' 
                                          : 'shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5'
                                      } ${selectedTasks.has(task.id) ? 'ring-2 ring-primary/50 bg-primary/[0.03]' : ''}`}
                                    >
                                      <CardContent className="p-2.5 sm:p-4">
                                        <div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                          {/* Bulk selection checkbox */}
                                          {bulkMode && (
                                            <button
                                              onClick={(e) => toggleTaskSelection(task.id, e)}
                                              className="mt-0.5 shrink-0 bulk-checkbox"
                                            >
                                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                                selectedTasks.has(task.id) 
                                                  ? 'bg-primary border-primary' 
                                                  : 'border-muted-foreground/30 hover:border-primary/50'
                                              }`}>
                                                {selectedTasks.has(task.id) && (
                                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                                )}
                                              </div>
                                            </button>
                                          )}
                                          <div className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors touch-manipulation">
                                            <GripVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                          </div>
                                          <h4 className="font-medium text-xs sm:text-sm leading-tight flex-1 line-clamp-2">{task.title}</h4>
                                          
                                          {/* Quick status menu trigger */}
                                          <div className="relative shrink-0">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusMenuTaskId(statusMenuTaskId === task.id ? null : task.id);
                                              }}
                                              className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                                              title="Change status"
                                            >
                                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                            
                                            {/* Quick status dropdown */}
                                            {statusMenuTaskId === task.id && (
                                              <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-border/50 rounded-lg shadow-xl p-1 min-w-[140px] status-menu">
                                                {STATUSES.map(s => {
                                                  const sConfig = statusConfig[s];
                                                  const StatusIcon = sConfig.icon;
                                                  return (
                                                    <button
                                                      key={s}
                                                      onClick={(e) => handleQuickStatusChange(task.id, s, e)}
                                                      className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md transition-all ${
                                                        task.status === s 
                                                          ? 'bg-primary/10 text-primary font-medium' 
                                                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                      }`}
                                                    >
                                                      <StatusIcon className={`w-3.5 h-3.5 ${sConfig.iconColor}`} />
                                                      {sConfig.label}
                                                      {task.status === s && <CheckCircle2 className="w-3 h-3 ml-auto text-primary" />}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {task.description && <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-4 line-clamp-2 sm:pl-6 pl-5">{task.description}</p>}
                                        
                                        <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-border/30">
                                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                            <Badge variant={getPriorityVariant(task.priority)} className="capitalize text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0">{task.priority}</Badge>
                                            {task.dueDate && (() => {
                                              const due = new Date(task.dueDate);
                                              const isOverdue = task.status !== 'done' && isPast(due) && !dateIsToday(due);
                                              const isDueToday = dateIsToday(due);
                                              return (
                                                <span className={`text-[8px] sm:text-[10px] flex items-center gap-0.5 sm:gap-1 px-1 sm:px-1.5 py-0.5 rounded font-medium ${
                                                  isOverdue ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                                                  isDueToday ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                  'text-muted-foreground bg-muted/50'
                                                }`}>
                                                  <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                  {due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                  {isOverdue && <span className="font-bold">!</span>}
                                                </span>
                                              );
                                            })()}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            {task.assignee ? (
                                              <Avatar fallback={task.assignee.name} src={task.assignee.avatar} size="sm" className="w-5 h-5 sm:w-6 sm:h-6 text-[8px] sm:text-[9px]" />
                                            ) : null}
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all" 
                                              onClick={(e) => { e.stopPropagation(); deleteTaskMutation.mutate(task.id); }}
                                            >
                                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                              <div className="h-16 sm:h-24 flex flex-col items-center justify-center text-[10px] sm:text-xs text-muted-foreground/50 border-2 border-dashed border-border/30 rounded-lg sm:rounded-xl mx-1 gap-1">
                                {status === 'todo' && totalTasks === 0 ? (
                                  <>
                                    <Plus className="w-4 h-4 text-muted-foreground/30" />
                                    <span>Add your first task</span>
                                  </>
                                ) : (
                                  <span>Drop tasks here</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  )}

                  {/* Collapsed state indicator */}
                  {isCollapsed && (
                    <div className="p-3 text-center">
                      <p className="text-[10px] sm:text-xs text-muted-foreground/50">
                        {columnTasks.length} task{columnTasks.length !== 1 ? 's' : ''} hidden
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {/* Close status menu when clicking elsewhere */}
      {statusMenuTaskId && (
        <div className="fixed inset-0 z-20" onClick={() => setStatusMenuTaskId(null)} />
      )}

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          projectId={id || ''} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};
