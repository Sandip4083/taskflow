import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, BarChart3, Activity, Zap, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

type ProjectStat = { name: string; total: number; done: number; progress: number };
type ActivityItem = { id?: string; _id?: string; title: string; status: string; priority: string; updatedAt: string };

// Skeleton loader components
const SkeletonCard = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="h-0.5 w-full skeleton" />
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-6">
      <div className="h-3 w-20 skeleton" />
      <div className="w-9 h-9 skeleton rounded-lg" />
    </CardHeader>
    <CardContent className="px-6 pb-6">
      <div className="h-8 w-16 skeleton mb-1" />
      <div className="h-2 w-12 skeleton" />
    </CardContent>
  </Card>
);

const SkeletonChart = () => (
  <Card className="overflow-hidden animate-pulse">
    <div className="h-0.5 w-full skeleton" />
    <CardHeader className="px-6 pt-6">
      <div className="h-5 w-32 skeleton" />
    </CardHeader>
    <CardContent className="h-[300px] flex items-center justify-center">
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8">
        <div className="animate-fade-in-down">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 ml-10 sm:ml-[52px] text-sm">Loading your analytics...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
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
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center h-full gap-4 text-destructive">
        <AlertCircle className="h-12 w-12 opacity-50" />
        <p className="font-medium">Failed to load analytics</p>
      </div>
    );
  }

  const stats = data.stats || { total: 0, done: 0, todo: 0, inProgress: 0, overdue: 0, highPriority: 0 };
  
  const pieData = [
    { name: 'To Do', value: stats.todo, color: '#94a3b8' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Done', value: stats.done, color: '#22c55e' },
  ].filter(d => d.value > 0);

  const barData = data.projectStats?.map((p: ProjectStat) => ({
    name: p.name?.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    done: p.done,
    pending: p.total - p.done
  })) || [];

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', change: `${data.totalProjects} projects` },
    { title: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', change: `${completionRate}% rate` },
    { title: 'High Priority', value: stats.highPriority, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', change: stats.highPriority > 0 ? 'Needs attention' : 'All clear' },
    { title: 'Overdue', value: stats.overdue, icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', change: stats.overdue > 0 ? 'Action required' : 'On track' },
  ];

  // Recent activity from recentActivity data
  const recentActivity = data.recentActivity || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 ml-10 sm:ml-[52px] text-sm">Overview of your tasks and productivity.</p>
      </div>

      {/* Completion summary banner */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-blue-500/5 border border-primary/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in-up">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base">
              {completionRate === 100 ? '🎉 All tasks completed!' : 
               completionRate >= 75 ? '🔥 Great progress!' :
               completionRate >= 50 ? '💪 Keep going!' :
               'Let\'s get started!'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {stats.done} of {stats.total} tasks completed across {data.totalProjects} project{data.totalProjects !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-32 h-2.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">{completionRate}%</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map((stat, idx) => (
          <Card key={stat.title} className={`group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/50 animate-fade-in-up overflow-hidden`} style={{ animationDelay: `${idx * 75}ms` }}>
            <div className={`h-0.5 w-full ${stat.bg}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 pt-3 sm:pt-5 px-3 sm:px-6">
              <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 ${stat.bg} rounded-md sm:rounded-lg flex items-center justify-center border ${stat.border} transition-transform duration-300 group-hover:scale-110 shrink-0`}>
                <stat.icon className={`h-3.5 w-3.5 sm:h-[18px] sm:w-[18px] ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-xl sm:text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center gap-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="animate-fade-in-up hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-slate-400 via-blue-500 to-emerald-500" />
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Task Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] flex items-center justify-center px-2 sm:px-6">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" strokeWidth={2} stroke="hsl(var(--background))">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No tasks yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-slate-400" />
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] px-2 sm:px-6">
             {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="done" stackId="a" fill="#22c55e" name="Done" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#94a3b8" name="Pending" radius={[0, 4, 4, 0]} />
                  <Legend verticalAlign="bottom" formatter={(value: string) => <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{value}</span>} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex flex-col items-center justify-center">
                 <BarChart3 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                 <p className="text-muted-foreground text-sm">No projects yet.</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      {recentActivity.length > 0 && (
        <Card className="animate-fade-in-up overflow-hidden">
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-primary to-blue-500" />
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-px bg-border/50" />
              
              {recentActivity.slice(0, 10).map((item: ActivityItem, idx: number) => {
                const statusColors: Record<string, string> = {
                  todo: 'bg-slate-400',
                  in_progress: 'bg-blue-500',
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
                    className="flex items-start gap-3 sm:gap-4 py-2.5 sm:py-3 relative animate-fade-in-up group"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "w-[22px] h-[22px] sm:w-[30px] sm:h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-card transition-transform group-hover:scale-110",
                      statusColors[item.status] || 'bg-muted'
                    )}>
                      {item.status === 'done' ? (
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      ) : item.status === 'in_progress' ? (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs sm:text-sm font-medium truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={priorityVariants[item.priority] || 'info'} className="text-[8px] sm:text-[10px] capitalize px-1.5 py-0">
                          {item.priority}
                        </Badge>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground/70 font-medium">
                          {statusLabels[item.status] || item.status}
                        </span>
                      </div>
                    </div>
                    
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap shrink-0 pt-1">
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
