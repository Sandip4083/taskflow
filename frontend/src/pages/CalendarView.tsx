import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

  const projectIds = projectsData?.projects?.map((p: any) => p.id) || [];
  
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
      const tasks = responses.flatMap((res: any) => res.data?.tasks || []);
      return tasks.filter((t: any) => t.dueDate || t.due_date);
    },
    enabled: projectIds.length > 0,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const totalUpcoming = allTasks.filter((t: any) => {
    const d = new Date(t.dueDate || t.due_date);
    return d >= new Date();
  }).length;

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-8 flex-shrink-0 gap-3 sm:gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 ml-10 sm:ml-[52px] text-xs sm:text-sm">
            {totalUpcoming} upcoming {totalUpcoming === 1 ? 'deadline' : 'deadlines'}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs sm:text-sm">Today</Button>
          <div className="flex items-center gap-0.5 sm:gap-1 bg-card border border-border/50 p-0.5 sm:p-1 rounded-lg sm:rounded-xl shadow-sm flex-1 sm:flex-none">
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md sm:rounded-lg" onClick={prevMonth}>
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <span className="font-bold min-w-[100px] sm:min-w-[140px] text-center text-xs sm:text-sm">{format(currentDate, 'MMM yyyy')}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-md sm:rounded-lg" onClick={nextMonth}>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden shadow-sm animate-fade-in-up border-border/50 min-h-0">
        <div className="grid grid-cols-7 border-b border-border/50 bg-muted/30">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="p-1.5 sm:p-3 text-center text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span className="hidden sm:inline">{{ 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' }[i]}</span>
              <span className="sm:hidden">{day}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto bg-card custom-scrollbar">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-border/30 bg-muted/10" />
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
                className={`border-r border-b border-border/30 p-1 sm:p-2 relative min-h-[50px] sm:min-h-[100px] transition-all duration-200 ${
                  isCurrentDay ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                }`}
              >
                <div className={`text-right mb-0.5 sm:mb-2 ${isCurrentDay ? 'font-bold' : 'text-muted-foreground'}`}>
                  <span className={isCurrentDay 
                    ? 'bg-primary text-primary-foreground w-5 h-5 sm:w-7 sm:h-7 inline-flex items-center justify-center rounded-full text-[10px] sm:text-xs font-bold shadow-sm shadow-primary/30' 
                    : 'text-[10px] sm:text-xs'
                  }>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="space-y-0.5 sm:space-y-1 overflow-y-auto max-h-[30px] sm:max-h-[80px] custom-scrollbar">
                  {dayTasks.slice(0, window.innerWidth < 640 ? 2 : 5).map((task: any) => {
                    const colors = {
                      high: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
                      medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
                      low: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
                    };
                    const c = colors[task.priority as keyof typeof colors] || colors.low;
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`truncate rounded-sm sm:rounded-md border ${c.bg} ${c.border} ${c.text} font-medium flex items-center gap-0.5 sm:gap-1.5 hover:opacity-80 transition-opacity cursor-default text-[7px] sm:text-[10px] px-0.5 sm:px-2 py-0.5 sm:py-1`}
                        title={`${task.title} (${task.priority} priority)`}
                      >
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${c.dot} shrink-0`} />
                        <span className="truncate hidden sm:inline">{task.title}</span>
                        <span className="truncate sm:hidden">{task.title.slice(0, 6)}</span>
                      </div>
                    );
                  })}
                  {dayTasks.length > (window.innerWidth < 640 ? 2 : 5) && (
                    <span className="text-[8px] sm:text-[10px] text-muted-foreground font-medium px-1">+{dayTasks.length - (window.innerWidth < 640 ? 2 : 5)} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
