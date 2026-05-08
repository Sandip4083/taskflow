import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CheckCircle2, Clock, AlertCircle, TrendingUp, BarChart3, Loader2, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
      <div className="p-6 sm:p-8 flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading analytics...</p>
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

  const barData = data.projectStats?.map((p: any) => ({
    name: p.name?.length > 12 ? p.name.slice(0, 12) + '…' : p.name,
    done: p.done,
    pending: p.total - p.done
  })) || [];

  const statCards = [
    { title: 'Total Tasks', value: stats.total, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { title: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', sub: stats.total > 0 ? `${Math.round((stats.done / stats.total) * 100)}% rate` : '0%' },
    { title: 'High Priority', value: stats.highPriority, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { title: 'Overdue', value: stats.overdue, icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border-border/50 animate-fade-in-up overflow-hidden`}>
            <div className={`h-0.5 w-full ${stat.bg}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 pt-3 sm:pt-5 px-3 sm:px-6">
              <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 ${stat.bg} rounded-md sm:rounded-lg flex items-center justify-center border ${stat.border} transition-transform duration-300 group-hover:scale-110 shrink-0`}>
                <stat.icon className={`h-3.5 w-3.5 sm:h-[18px] sm:w-[18px] ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-xl sm:text-3xl font-bold tracking-tight">{stat.value}</div>
              {stat.sub && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{stat.sub}</p>}
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
    </div>
  );
};
