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
import { Plus, ArrowLeft, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

import { TaskModal } from '../components/TaskModal';

type Task = { id: string; title: string; description: string; status: string; priority: string; assignee?: { _id: string, name: string, avatar?: string }; dueDate?: string; };
type Project = { id: string; name: string; description: string; owner: string; members: string[]; tasks: Task[] };


export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch Project Data
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

  // Fetch Users for Assignment (Removed unused 'users' query)

  // Mutations
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

    // If dropped outside a valid droppable area, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const task = project?.tasks.find(t => t.id === draggableId);
    if (!task) return;

    // We changed the column
    if (destination.droppableId !== source.droppableId) {
      updateTaskMutation.mutate({ taskId: draggableId, updates: { status: destination.droppableId } });
    }
  };

  if (isLoading) return <div className="p-8 text-center bg-background min-h-screen flex items-center justify-center text-muted-foreground">Loading project...</div>;
  if (error || !project) return <div className="p-8 text-center text-destructive flex items-center justify-center min-h-screen"><AlertCircle className="mr-2"/> Project not found or access denied</div>;

  const groupedTasks = {
    todo: project.tasks.filter(t => t.status === 'todo'),
    in_progress: project.tasks.filter(t => t.status === 'in_progress'),
    done: project.tasks.filter(t => t.status === 'done'),
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl h-full flex flex-col">
      <div className="flex-shrink-0">
        <Button variant="ghost" className="mb-4 -ml-4 text-muted-foreground hover:bg-muted/50" onClick={() => navigate('/')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-card p-6 rounded-xl border border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
            <p className="text-muted-foreground mt-2">{project.description}</p>
          </div>
          <Button onClick={() => setIsCreatingTask(true)} className="shadow-md hover:shadow-lg transition-all"><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
        </div>
      </div>

      {isCreatingTask && (
        <Card className="mb-8 border-primary/20 shadow-md flex-shrink-0 bg-card overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-blue-500" />
          <CardContent className="pt-6">
            <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(newTask); }} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus required placeholder="E.g., Update landing page copy" />
              </div>
              <div className="md:col-span-2">
                <Input label="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Add more details about this task..." />
              </div>
              <div>
                 <label className="text-sm font-medium leading-none block mb-2">Priority</label>
                 <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                 </select>
              </div>
              <div>
                 <label className="text-sm font-medium leading-none block mb-2">Due Date</label>
                 <Input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsCreatingTask(false)}>Cancel</Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>{createTaskMutation.isPending ? 'Saving...' : 'Save Task'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-[500px] pb-4">
          {(['todo', 'in_progress', 'done'] as const).map(status => (
            <div key={status} className="bg-muted/30 rounded-xl flex flex-col border border-border/50 h-full overflow-hidden">
               <h3 className="font-semibold p-4 capitalize flex justify-between items-center text-foreground shrink-0 border-b border-border/50 bg-muted/20">
                 <div className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${status === 'todo' ? 'bg-slate-400' : status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'}`} />
                   {status.replace('_', ' ')}
                 </div>
                 <span className="bg-background border border-border text-muted-foreground text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">{groupedTasks[status].length}</span>
               </h3>
               
               <Droppable droppableId={status}>
                 {(provided, snapshot) => (
                   <div 
                     className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                     ref={provided.innerRef}
                     {...provided.droppableProps}
                   >
                     <div className="space-y-3 min-h-[100px]">
                       {groupedTasks[status].map((task, index) => (
                         <Draggable key={task.id} draggableId={task.id} index={index}>
                           {(provided, snapshot) => (
                             <div
                               ref={provided.innerRef}
                               {...provided.draggableProps}
                               {...provided.dragHandleProps}
                               style={{ ...provided.draggableProps.style }}
                             >
                               <Card 
                                 onClick={() => setSelectedTask(task)}
                                 className={`cursor-pointer hover:border-primary/50 transition-all bg-card ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary scale-[1.02] rotate-1' : 'shadow-sm hover:shadow-md'}`}
                               >
                                 <CardContent className="p-4">
                                   <div className="flex justify-between items-start mb-2 gap-2">
                                     <h4 className="font-medium text-sm leading-tight flex-1">{task.title}</h4>
                                   </div>
                                   {task.description && <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{task.description}</p>}
                                   
                                   <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                                      <div className="flex items-center gap-2">
                                        <Badge variant={getPriorityVariant(task.priority)} className="capitalize">{task.priority}</Badge>
                                        {task.dueDate && (
                                          <span className="text-[10px] flex items-center gap-1 text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm font-medium">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {task.assignee ? (
                                          <Avatar fallback={task.assignee.name} size="sm" className="w-6 h-6 text-[10px]" />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground" title="Unassigned">
                                            <span className="text-[10px]">+</span>
                                          </div>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); deleteTaskMutation.mutate(task.id); }}>
                                          <Trash2 className="w-3 h-3" />
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
           <div className="h-24 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-border/50 rounded-lg mx-1 opacity-50">
              Drop tasks here
           </div>
         )}
       </div>
     </div>
   )}
 </Droppable>
</div>
))}
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
