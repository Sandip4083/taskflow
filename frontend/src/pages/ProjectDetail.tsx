/* cSpell:words pangea */
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Plus, ArrowLeft, Trash2, Calendar, AlertCircle, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import { TaskModal } from '../components/TaskModal';

type Task = { id: string; title: string; description: string; status: string; priority: string; assignee?: { _id: string, name: string, avatar?: string }; dueDate?: string; };
type Project = { id: string; name: string; description: string; owner: string; members: string[]; tasks: Task[] };

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-slate-400', headerBg: 'from-slate-500/10 to-transparent', borderColor: 'border-slate-300/30 dark:border-slate-600/30' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', headerBg: 'from-blue-500/10 to-transparent', borderColor: 'border-blue-300/30 dark:border-blue-600/30' },
  done: { label: 'Done', color: 'bg-emerald-500', headerBg: 'from-emerald-500/10 to-transparent', borderColor: 'border-emerald-300/30 dark:border-emerald-600/30' },
};

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
      toast.success('Task deleted');
    }
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = project?.tasks.find(t => t.id === draggableId);
    if (!task) return;

    if (destination.droppableId !== source.droppableId) {
      updateTaskMutation.mutate({ taskId: draggableId, updates: { status: destination.droppableId } });
      toast.success(`Task moved to ${statusConfig[destination.droppableId as keyof typeof statusConfig]?.label}`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading project...</p>
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

  const groupedTasks = {
    todo: project.tasks.filter(t => t.status === 'todo'),
    in_progress: project.tasks.filter(t => t.status === 'in_progress'),
    done: project.tasks.filter(t => t.status === 'done'),
  };

  const totalTasks = project.tasks.length;
  const doneTasks = groupedTasks.done.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl h-full flex flex-col">
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
                <div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground whitespace-nowrap">{progress}%</span>
              <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:flex">{totalTasks} tasks</Badge>
            </div>
          </div>
          <Button onClick={() => setIsCreatingTask(true)} className="shadow-md shadow-primary/20 w-full sm:w-auto mt-2 sm:mt-0">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

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
                 <select className="flex h-10 sm:h-11 w-full rounded-lg border border-input bg-background px-3 sm:px-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
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
        <div className="flex-1 min-h-[400px] sm:min-h-[500px] pb-4 overflow-x-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-6 min-w-[720px] md:min-w-0 h-full">
            {(['todo', 'in_progress', 'done'] as const).map(status => {
              const config = statusConfig[status];
              return (
                <div key={status} className={`bg-gradient-to-b ${config.headerBg} rounded-xl sm:rounded-2xl flex flex-col border ${config.borderColor} h-full overflow-hidden animate-fade-in-up`}>
                  <h3 className="font-semibold p-3 sm:p-4 capitalize flex justify-between items-center text-foreground shrink-0 border-b border-border/30 text-xs sm:text-base">
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${config.color} shadow-sm`} />
                      <span>{config.label}</span>
                    </div>
                    <span className="bg-background/80 border border-border/50 text-muted-foreground text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      {groupedTasks[status].length}
                    </span>
                  </h3>
                  
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div 
                        className={`flex-1 p-2 sm:p-3 overflow-y-auto custom-scrollbar transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20 ring-inset rounded-b-xl' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="space-y-2 sm:space-y-3 min-h-[80px] sm:min-h-[100px]">
                          {groupedTasks[status].map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  <Card 
                                    onClick={() => setSelectedTask(task)}
                                    className={`cursor-pointer transition-all duration-200 bg-card group ${
                                      snapshot.isDragging 
                                        ? 'shadow-2xl ring-2 ring-primary/40 scale-[1.02] rotate-1' 
                                        : 'shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5'
                                    }`}
                                  >
                                    <CardContent className="p-2.5 sm:p-4">
                                      <div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                        <div {...provided.dragHandleProps} className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors hidden sm:block">
                                          <GripVertical className="w-4 h-4" />
                                        </div>
                                        <h4 className="font-medium text-xs sm:text-sm leading-tight flex-1 line-clamp-2">{task.title}</h4>
                                      </div>
                                      {task.description && <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-4 line-clamp-2 sm:pl-6">{task.description}</p>}
                                      
                                      <div className="flex items-center justify-between mt-auto pt-1.5 sm:pt-2 border-t border-border/30">
                                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                          <Badge variant={getPriorityVariant(task.priority)} className="capitalize text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0">{task.priority}</Badge>
                                          {task.dueDate && (
                                            <span className="text-[8px] sm:text-[10px] flex items-center gap-0.5 sm:gap-1 text-muted-foreground bg-muted/50 px-1 sm:px-1.5 py-0.5 rounded font-medium">
                                              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          {task.assignee ? (
                                            <Avatar fallback={task.assignee.name} size="sm" className="w-5 h-5 sm:w-6 sm:h-6 text-[8px] sm:text-[9px]" />
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
                          {groupedTasks[status].length === 0 && !snapshot.isDraggingOver && (
                            <div className="h-16 sm:h-24 flex items-center justify-center text-[10px] sm:text-xs text-muted-foreground/50 border-2 border-dashed border-border/30 rounded-lg sm:rounded-xl mx-1">
                              Drop tasks here
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

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
