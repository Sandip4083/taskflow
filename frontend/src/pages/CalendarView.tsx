import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isPast } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, FolderKanban, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { TaskModal } from '../components/TaskModal';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: { _id: string; name: string; avatar?: string };
  dueDate?: string;
  due_date?: string;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
}


export const CalendarView = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [createTaskDate, setCreateTaskDate] = React.useState<Date | null>(null);
  const queryClient = useQueryClient();

  const { data: projectsData = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.projects;
    },
  });

  const projectIds = React.useMemo(() => {
    return projectsData.map((p: Project) => p.id);
  }, [projectsData]);
  
  const { data: allTasks = [] } = useQuery({
    queryKey: ['calendar-tasks', projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      const promises = projectIds.map((id: string) => 
        axios.get(`${API_URL}/projects/${id}/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
      );
      const responses = await Promise.all(promises);
      const tasks = responses.flatMap((res: { data: { tasks: Task[] } }, index: number) => {
        const projId = projectIds[index];
        const projTasks = res.data?.tasks || [];
        return projTasks.map((t: Task) => ({ ...t, projectId: projId }));
      });
      return tasks.filter((t: Task) => t.dueDate || t.due_date);
    },
    enabled: projectIds.length > 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Start offset: 0=Sun, 1=Mon, …
  const startOffset = monthStart.getDay();

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const totalUpcoming = allTasks.filter((t: Task) => {
    if (t.status === 'done') return false;
    const dateStr = t.dueDate || t.due_date;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return taskDate >= todayDate;
  }).length;

  const overdueCount = allTasks.filter((t: Task) => {
    if (t.status === 'done') return false;
    const dateStr = t.dueDate || t.due_date;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return taskDate < todayDate;
  }).length;

  const projectTasksMap = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of allTasks) {
      const list = map.get(t.projectId) || [];
      list.push(t);
      map.set(t.projectId, list);
    }
    return map;
  }, [allTasks]);

  const projectStats = React.useMemo(() => {
    let completed = 0;
    let active = 0;
    for (const pid of projectIds) {
      const ptasks = projectTasksMap.get(pid) || [];
      if (ptasks.length > 0 && ptasks.every(t => t.status === 'done')) {
        completed++;
      } else {
        active++;
      }
    }
    return { completed, active };
  }, [projectIds, projectTasksMap]);

  if (isLoading) {
    return (
      <div className="page-container flex flex-col gap-6">
        {/* Header skeleton */}
        <div className="animate-fade-in-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="page-header-icon">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Calendar
          </h1>
        </div>
        <Card className="flex-1 animate-pulse overflow-hidden border-border/50">
          <div className="h-[500px] skeleton rounded-xl" />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container flex flex-col" {...{ style: { minHeight: 'calc(100vh - 3.5rem)' } }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 sm:mb-8 flex-shrink-0 gap-3 sm:gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
            <div className="page-header-icon">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Calendar
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-2 ml-11 sm:ml-[52px]">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-xl">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {totalUpcoming} Upcoming Tasks
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-xl">
              <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {overdueCount} Expired/Overdue
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl">
              <FolderKanban className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {projectIds.length} Projects ({projectStats.active} active, {projectStats.completed} completed)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday} 
            className="text-xs sm:text-sm"
            aria-label="Go to today"
          >
            Today
          </Button>
          <div className="flex items-center gap-0.5 bg-card border border-border/50 p-1 rounded-xl shadow-sm flex-1 sm:flex-none justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" 
              onClick={prevMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-bold min-w-[110px] sm:min-w-[140px] text-center text-xs sm:text-sm">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" 
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm animate-fade-in-up border-border/40 min-h-[400px]">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/20 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="py-2 sm:py-3 text-center">
              <span className="hidden sm:inline text-xs font-bold text-muted-foreground uppercase tracking-wider">{day}</span>
              <span className="sm:hidden text-[10px] font-bold text-muted-foreground uppercase">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar bg-card">
          {/* Offset cells for first day */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-border/20 bg-muted/5 min-h-[60px] sm:min-h-[100px]" />
          ))}
          
          {daysInMonth.map((day) => {
            const dayTasks = allTasks.filter((task: Task) => {
              const d = task.dueDate || task.due_date;
              return d && isSameDay(new Date(d), day);
            });
            const isCurrentDay = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const MAX_VISIBLE = 3;
            
            const isPastDay = isPast(day) && !isToday(day);
            const hasUncompleted = dayTasks.some(t => t.status !== 'done');
            const hasCompleted = dayTasks.length > 0 && dayTasks.every(t => t.status === 'done');

            let cellBgClass = '';
            if (isCurrentDay) {
              cellBgClass = 'bg-primary/[0.05] ring-1 ring-inset ring-primary/20';
            } else if (isPastDay && hasUncompleted) {
              // Missed deadline day - light red/rose
              cellBgClass = 'bg-red-500/[0.06] dark:bg-red-500/[0.04] ring-1 ring-inset ring-red-500/20 border-red-500/15';
            } else if (hasUncompleted) {
              // Upcoming deadline day - light violet/indigo
              cellBgClass = 'bg-violet-500/[0.06] dark:bg-violet-500/[0.04] ring-1 ring-inset ring-violet-500/20 border-violet-500/15';
            } else if (hasCompleted) {
              // All deadlines completed - light green
              cellBgClass = 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.04] ring-1 ring-inset ring-emerald-500/20 border-emerald-500/15';
            } else if (isWeekend) {
              cellBgClass = 'bg-muted/5';
            }

            return (
              <div 
                key={day.toISOString()} 
                onClick={() => setCreateTaskDate(day)}
                className={`group border-r border-b border-border/20 p-1 sm:p-2 relative min-h-[60px] sm:min-h-[100px] transition-colors duration-200 hover:bg-muted/15 cursor-pointer ${cellBgClass}`}
              >
                {/* Hover Plus Button */}
                <div className="absolute left-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-colors">
                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                </div>
                {/* Day number */}
                <div className={`text-right mb-1 sm:mb-1.5`}>
                  <span className={isCurrentDay 
                    ? 'bg-primary text-primary-foreground w-5 h-5 sm:w-7 sm:h-7 inline-flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold shadow-sm shadow-primary/40' 
                    : `text-[10px] sm:text-xs font-medium ${isWeekend ? 'text-muted-foreground/60' : 'text-muted-foreground'}`
                  }>
                    {format(day, 'd')}
                  </span>
                </div>
                
                {/* Task pills */}
                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, MAX_VISIBLE).map((task: Task) => {
                    const colors = {
                      high: { bg: 'bg-red-500/12', border: 'border-red-500/25', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
                      medium: { bg: 'bg-amber-500/12', border: 'border-amber-500/25', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
                      low: { bg: 'bg-blue-500/12', border: 'border-blue-500/25', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
                    };
                    const c = colors[task.priority as keyof typeof colors] || colors.low;
                    
                    return (
                      <div 
                        key={task.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                        }}
                        className="task-pill-element truncate rounded border bg-card/60 dark:bg-card/20 hover:opacity-80 transition-opacity cursor-pointer text-[7px] sm:text-[10px] px-0.5 sm:px-1.5 py-0.5 flex items-center gap-1 font-medium border-border/50"
                        title={`${task.title} (${task.priority} priority)`}
                      >
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${c.dot} shrink-0`} />
                        <span className="truncate text-foreground/90">{task.title}</span>
                      </div>
                    );
                  })}
                  {dayTasks.length > MAX_VISIBLE && (
                    <span className="text-[8px] sm:text-[10px] text-muted-foreground/70 font-semibold px-0.5 sm:px-1">
                      +{dayTasks.length - MAX_VISIBLE} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 pt-3.5 border-t border-border/20 animate-fade-in text-xs">
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-muted-foreground/60 font-medium">Priority:</span>
          {[
            { color: 'bg-red-500', label: 'High' },
            { color: 'bg-amber-500', label: 'Medium' },
            { color: 'bg-blue-500', label: 'Low' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3.5 flex-wrap">
          <span className="text-muted-foreground/60 font-medium">Status:</span>
          {[
            { color: 'bg-violet-500/10 border-violet-500/20 dark:bg-violet-500/5', label: 'Upcoming Deadline' },
            { color: 'bg-red-500/10 border-red-500/20 dark:bg-red-500/5', label: 'Missed Deadline' },
            { color: 'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/5', label: 'Completed' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded border ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          projectId={selectedTask.projectId} 
          onClose={() => {
            setSelectedTask(null);
            // Invalidate queries so calendar updates if task details were modified
            queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
          }} 
        />
      )}
      {createTaskDate && (
        <CreateTaskModal
          date={createTaskDate}
          projects={projectsData}
          onClose={() => setCreateTaskDate(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
          }}
        />
      )}
    </div>
  );
};

// --- Create Task Modal for Calendar ---
interface CreateTaskModalProps {
  date: Date;
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTaskModal = ({ date, projects, onClose, onSuccess }: CreateTaskModalProps) => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [projectId, setProjectId] = React.useState(projects[0]?.id || '');
  const [priority, setPriority] = React.useState('medium');
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description: string; priority: string; due_date: string }) => {
      if (!projectId) throw new Error('Please select a project');
      const res = await axios.post(`${API_URL}/projects/${projectId}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks'] });
      onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!projectId) {
      toast.error('Please create or select a project first.');
      return;
    }
    
    // Format date as YYYY-MM-DD local
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dateStr
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md border-primary/25 shadow-xl animate-scale-in overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-violet-500 to-blue-500" />
        <CardHeader className="pt-5 pb-2 px-5 sm:px-6">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create Task
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            For {format(date, 'MMMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="modal-project" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
                Project
              </label>
              <select
                id="modal-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                required
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="modal-title" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
                Task Title
              </label>
              <input
                id="modal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="modal-desc" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
                Description (optional)
              </label>
              <textarea
                id="modal-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div>
              <label htmlFor="modal-priority" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
                Priority
              </label>
              <select
                id="modal-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="ghost" onClick={onClose} disabled={createTaskMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTaskMutation.isPending || !title.trim()}>
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
