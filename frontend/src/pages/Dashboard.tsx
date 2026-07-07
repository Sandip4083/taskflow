import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, BarChart3, Activity, Zap, ArrowUpRight, FolderKanban } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

type ProjectStat = { name: string; total: number; done: number; progress: number };
type ActivityItem = { id?: string; _id?: string; title: string; status: string; priority: string; updatedAt: string };

// Skeleton loader components
const SkeletonCard = () => (
  <Card className="overflow-hidden animate-pulse border-border/50">
    <div className="h-0.5 w-full skeleton" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5 sm:px-6">
      <div className="h-3 w-20 skeleton" />
      <div className="w-9 h-9 skeleton rounded-xl" />
    </CardHeader>
    <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
      <div className="h-8 w-16 skeleton mb-1.5" />
      <div className="h-2 w-24 skeleton rounded-full" />
    </CardContent>
  </Card>
);

const SkeletonChart = () => (
  <Card className="overflow-hidden animate-pulse border-border/50">
    <div className="h-0.5 w-full skeleton" />
    <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
      <div className="h-5 w-36 skeleton" />
    </CardHeader>
    <CardContent className="h-[260px] sm:h-[300px] flex items-center justify-center">
      <div className="w-36 h-36 skeleton rounded-full" />
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="page-container space-y-5 sm:space-y-8">
        <div className="animate-fade-in-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 sm:gap-3">
            <div className="page-header-icon">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1.5 ml-11 sm:ml-[52px] text-sm">Loading your analytics...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] gap-4 text-destructive">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center border border-destructive/20">
          <AlertCircle className="h-8 w-8 opacity-70" />
        </div>
        <div className="text-center">
          <p className="font-bold text-base">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground mt-1">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const stats = data.stats || { total: 0, done: 0, todo: 0, inProgress: 0, overdue: 0, highPriority: 0 };
  
  const pieData = [
    { name: 'To Do', value: stats.todo, color: '#94a3b8' },
    { name: 'In Progress', value: stats.inProgress, color: '#6366f1' },
    { name: 'Done', value: stats.done, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const barData = data.projectStats?.map((p: ProjectStat) => ({
    name: p.name?.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    done: p.done,
    pending: p.total - p.done
  })) || [];

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const completedProjectsCount = data.projectStats?.filter((p: ProjectStat) => p.total > 0 && p.total === p.done).length || 0;
  const activeProjectsCount = (data.totalProjects || 0) - completedProjectsCount;

  const statCards = [
    { 
      title: 'Projects', 
      value: data.totalProjects || 0, 
      icon: FolderKanban, 
      color: 'text-indigo-500 dark:text-indigo-400', 
      bg: 'bg-indigo-500/10', 
      border: 'border-indigo-500/20', 
      gradient: 'from-indigo-500/10 to-blue-500/5',
      change: `${activeProjectsCount} active · ${completedProjectsCount} completed` 
    },
    { 
      title: 'Total Tasks', 
      value: stats.total, 
      icon: TrendingUp, 
      color: 'text-primary', 
      bg: 'bg-primary/10', 
      border: 'border-primary/20', 
      gradient: 'from-primary/10 to-violet-500/5',
      change: `${data.totalProjects} project${data.totalProjects !== 1 ? 's' : ''}` 
    },
    { 
      title: 'Completed', 
      value: stats.done, 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/20', 
      gradient: 'from-emerald-500/10 to-teal-500/5',
      change: `${completionRate}% completion rate` 
    },
    { 
      title: 'High Priority', 
      value: stats.highPriority, 
      icon: AlertCircle, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/20', 
      gradient: 'from-amber-500/10 to-orange-500/5',
      change: stats.highPriority > 0 ? 'Needs attention' : 'All clear ✓' 
    },
    { 
      title: 'Overdue', 
      value: stats.overdue, 
      icon: Clock, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20', 
      gradient: 'from-red-500/10 to-rose-500/5',
      change: stats.overdue > 0 ? 'Action required' : 'On track ✓'
    },
  ];

  const recentActivity = data.recentActivity || [];

  return (
    <div className="page-container space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
          <div className="page-header-icon">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1.5 ml-11 sm:ml-[52px] text-sm">
          Overview of your tasks and productivity.
        </p>
      </div>

      {/* Completion summary banner */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-primary/8 via-violet-500/5 to-blue-500/5 border border-primary/15 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base">
              {completionRate === 100 ? '🎉 All tasks completed!' : 
               completionRate >= 75 ? '🔥 Great progress!' :
               completionRate >= 50 ? '💪 Keep going!' :
               '🚀 Let\'s get started!'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {stats.done} of {stats.total} tasks completed across {data.totalProjects} project{data.totalProjects !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-36 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out progress-bar-fill",
                  completionRate === 100 
                    ? 'bg-emerald-500' 
                    : 'bg-gradient-to-r from-primary to-emerald-500'
                )}
                {...{ style: { '--progress-width': `${completionRate}%` } as React.CSSProperties }}
              />
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">{completionRate}%</span>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
        {statCards.map((stat, idx) => (
          <Card 
            key={stat.title} 
            className={cn(
              'group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/50 animate-fade-in-up overflow-hidden bg-gradient-to-br',
              stat.gradient
            )} 
            style={{ animationDelay: `${idx * 75}ms` }}
          >
            <div className={`h-0.5 w-full ${stat.bg}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 pt-3 sm:pt-5 px-4 sm:px-5">
              <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shrink-0',
                stat.bg, stat.border
              )}>
                <stat.icon className={cn('h-4 w-4 sm:h-[18px] sm:w-[18px]', stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stat.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Task Status Pie */}
        <Card className="animate-fade-in-up hover:shadow-md transition-all duration-300 overflow-hidden border-border/50">
          <div className="h-0.5 w-full bg-gradient-to-r from-slate-400 via-indigo-500 to-emerald-500" />
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-bold">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Task Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[280px] flex items-center justify-center px-2 sm:px-4">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={4} 
                    dataKey="value" 
                    strokeWidth={2} 
                    stroke="hsl(var(--background))"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '10px', 
                      fontSize: '12px', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontFamily: 'Inter, sans-serif',
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    formatter={(value: string) => (
                      <span className="text-[11px] text-muted-foreground font-sans">
                        {value}
                      </span>
                    )} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No tasks yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Create tasks to see statistics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Progress Bar */}
        <Card className="animate-fade-in-up hover:shadow-md transition-all duration-300 overflow-hidden border-border/50 delay-100">
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-slate-400" />
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-bold">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[280px] px-2 sm:px-4">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '10px', 
                      fontSize: '11px', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      fontFamily: 'Inter, sans-serif',
                    }} 
                  />
                  <Bar dataKey="done" stackId="a" fill="#22c55e" name="Done" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#94a3b8" name="Pending" radius={[0, 4, 4, 0]} />
                  <Legend 
                    verticalAlign="bottom" 
                    formatter={(value: string) => (
                      <span className="text-[11px] text-muted-foreground font-sans">
                        {value}
                      </span>
                    )} 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-3">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No projects yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Create projects to see progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      {recentActivity.length > 0 && (
        <Card className="animate-fade-in-up overflow-hidden border-border/50">
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-primary to-blue-500" />
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-bold">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div className="absolute left-[13px] sm:left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-border/80 via-border/50 to-transparent" />
              
              {recentActivity.slice(0, 10).map((item: ActivityItem, idx: number) => {
                const statusColors: Record<string, string> = {
                  todo: 'bg-slate-400',
                  in_progress: 'bg-indigo-500',
                  done: 'bg-emerald-500',
                };
                const statusLabels: Record<string, string> = {
                  todo: 'To Do',
                  in_progress: 'In Progress',
                  done: 'Done',
                };
                const priorityVariants: Record<string, 'danger' | 'warning' | 'info'> = {
                  high: 'danger',
                  medium: 'warning',
                  low: 'info',
                };

                return (
                  <div 
                    key={item.id || item._id || idx}
                    className={cn(
                      'flex items-start gap-3 sm:gap-4 py-2.5 sm:py-3 relative animate-fade-in-up group',
                      idx === 0 ? 'delay-0' : idx === 1 ? 'delay-50' : idx === 2 ? 'delay-100' : idx === 3 ? 'delay-150' : idx === 4 ? 'delay-200' : idx === 5 ? 'delay-225' : idx === 6 ? 'delay-270' : idx === 7 ? 'delay-315' : idx === 8 ? 'delay-360' : 'delay-400'
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      'w-[26px] h-[26px] sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-card transition-transform duration-200 group-hover:scale-110',
                      statusColors[item.status] || 'bg-muted'
                    )}>
                      {item.status === 'done' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      ) : item.status === 'in_progress' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs sm:text-sm font-semibold truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={priorityVariants[item.priority] || 'info'} className="text-[8px] sm:text-[10px] capitalize px-1.5 py-0">
                          {item.priority}
                        </Badge>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium">
                          {statusLabels[item.status] || item.status}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground/50 font-medium whitespace-nowrap shrink-0 pt-1">
                      {item.updatedAt ? (() => { try { return format(new Date(item.updatedAt), 'MMM d'); } catch { return ''; } })() : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
