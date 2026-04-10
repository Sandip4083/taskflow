import { API_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';

type Task = { id: string; title: string; description: string; status: string; priority: string; assignee_id?: string; due_date?: string; };
type Project = { id: string; name: string; description: string; owner_id: string; tasks: Task[] };
type User = { id: string; name: string; email: string };

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Task Creation Mode
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });

  // Drag and Drop State
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/projects/${id}`),
        axios.get(`${API_URL}/users`)
      ]);
      setProject(projRes.data);
      setUsers(usersRes.data.users);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const { data } = await axios.post(`${API_URL}/projects/${id}/tasks`, newTask);
      setProject(p => p ? { ...p, tasks: [...p.tasks, data] } : null);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });
      setIsCreatingTask(false);
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete task?')) return;
    try {
      // Optimistic update
      setProject(p => p ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : null);
      await axios.delete(`${API_URL}/tasks/${taskId}`);
    } catch (err) {
      setError('Failed to delete task');
      fetchData(); // revert
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setProject(p => p ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) } : null);
      await axios.patch(`${API_URL}/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      setError('Failed to update task status');
      fetchData();
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    const task = project?.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    updateTaskStatus(taskId, newStatus);
  };

  if (loading) return <div className="p-8 text-center bg-background min-h-screen">Loading project...</div>;
  if (!project) return <div className="p-8 text-center text-destructive">Project not found</div>;

  const groupedTasks = {
    todo: project.tasks.filter(t => t.status === 'todo'),
    in_progress: project.tasks.filter(t => t.status === 'in_progress'),
    done: project.tasks.filter(t => t.status === 'done'),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" className="mb-4 -ml-4 text-muted-foreground" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
      </Button>
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>
        <Button onClick={() => setIsCreatingTask(true)}><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
      </div>

      {error && <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-md">{error}</div>}

      {isCreatingTask && (
        <Card className="mb-8 border-primary/20 shadow-md">
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTask} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input label="Task Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus required />
              </div>
              <div className="md:col-span-2">
                <Input label="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div>
                 <label className="text-sm font-medium leading-none block mb-2">Priority</label>
                 <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                 </select>
              </div>
              <div>
                 <label className="text-sm font-medium leading-none block mb-2">Assignee</label>
                 <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newTask.assignee_id} onChange={e => setNewTask({...newTask, assignee_id: e.target.value})}>
                   <option value="">Unassigned</option>
                   {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                 </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreatingTask(false)}>Cancel</Button>
                <Button type="submit">Save Task</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {(['todo', 'in_progress', 'done'] as const).map(status => (
          <div 
            key={status} 
            className={`bg-muted/50 rounded-xl p-4 flex flex-col border h-full min-h-[500px] transition-colors ${dragOverStatus === status ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
             <h3 className="font-semibold mb-4 capitalize px-2 flex justify-between items-center">
               {status.replace('_', ' ')}
               <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">{groupedTasks[status].length}</span>
             </h3>
             <div className="space-y-3 flex-1">
               {groupedTasks[status].map(task => (
                 <Card 
                   key={task.id} 
                   draggable 
                   onDragStart={(e) => handleDragStart(e, task.id)}
                   className="cursor-pointer hover:border-primary/40 transition-colors shadow-sm active:scale-95 active:shadow-md cursor-grab active:cursor-grabbing"
                 >
                   <CardContent className="p-4">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                       <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                         <Trash2 className="w-3 h-3" />
                       </Button>
                     </div>
                     {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>}
                     <div className="flex items-center justify-between mt-auto pt-2 border-t text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${task.priority==='high'?'bg-destructive/10 text-destructive':task.priority==='medium'?'bg-amber-500/10 text-amber-600 dark:text-amber-400':'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                          {task.priority}
                        </span>
                        <select 
                          className="bg-transparent border-0 text-xs text-muted-foreground focus:ring-0 p-0 cursor-pointer"
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                     </div>
                   </CardContent>
                 </Card>
               ))}
               {groupedTasks[status].length === 0 && (
                 <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                    No tasks
                 </div>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
