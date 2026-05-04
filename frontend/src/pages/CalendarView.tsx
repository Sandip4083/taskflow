import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Fetch all tasks for the user (we'll fetch from all projects for the calendar)
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

  // We need tasks with due dates. Let's fetch all tasks from all projects
  // In a real app, you'd have a specific endpoint for user's tasks
  const projectIds = projectsData?.projects?.map((p: any) => p.id) || [];
  
  const { data: allTasks = [] } = useQuery({
    queryKey: ['calendar-tasks', projectIds],
    queryFn: async () => {
      if (projectIds.length === 0) return [];
      // Fetch tasks for each project
      const promises = projectIds.map((id: string) => 
        axios.get(`${API_URL}/projects/${id}/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
      );
      const responses = await Promise.all(promises);
      const tasks = responses.flatMap((res: any) => res.data?.tasks || []);
      return tasks.filter((t: any) => t.dueDate || t.due_date); // Support both field names
    },
    enabled: projectIds.length > 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-2">View your upcoming deadlines and schedules.</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border p-1 rounded-lg shadow-sm">
          <button onClick={prevMonth} className="px-3 py-1 hover:bg-muted rounded-md text-sm font-medium">&lt; Prev</button>
          <span className="font-bold min-w-[120px] text-center">{format(currentDate, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="px-3 py-1 hover:bg-muted rounded-md text-sm font-medium">Next &gt;</button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto bg-card">
          {/* Fill empty days at start of month */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-border/50 bg-muted/20" />
          ))}
          
          {daysInMonth.map((day) => {
            const dayTasks = allTasks.filter((task: any) => {
              const d = task.dueDate || task.due_date;
              return d && isSameDay(new Date(d), day);
            });
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`border-r border-b border-border/50 p-2 relative min-h-[100px] transition-colors hover:bg-muted/10 ${isCurrentDay ? 'bg-primary/5' : ''}`}
              >
                <div className={`text-right text-sm mb-2 ${isCurrentDay ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  <span className={isCurrentDay ? 'bg-primary text-primary-foreground w-6 h-6 inline-flex items-center justify-center rounded-full' : ''}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-1 overflow-y-auto max-h-[100px]">
                  {dayTasks.map((task: any) => (
                    <div 
                      key={task.id} 
                      className="text-xs truncate px-2 py-1 rounded-md border"
                      style={{
                        backgroundColor: task.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                         task.priority === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        borderColor: task.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : 
                                     task.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                        color: task.priority === 'high' ? '#ef4444' : 
                               task.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
