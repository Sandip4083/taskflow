import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Calendar, Settings,
  LogOut, Menu, X, Zap, ChevronRight, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../config';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data.projects;
    },
    enabled: !!user && !isAuthPage,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    enabled: !!user && !isAuthPage,
  });

  if (isAuthPage) return null;

  const projectCount = Array.isArray(projects) ? projects.length : 0;
  const overdueCount = analyticsData?.stats?.overdue || 0;
  const completedCount = analyticsData?.stats?.completed || 0;

  const navItems = [
    {
      to: '/',
      icon: FolderKanban,
      label: 'Projects',
      description: 'Manage workspaces',
      badge: projectCount > 0 ? projectCount : null,
      badgeVariant: 'primary' as const,
      activeColor: 'from-violet-500 to-purple-600',
    },
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Analytics & stats',
      badge: null,
      badgeVariant: 'default' as const,
      activeColor: 'from-blue-500 to-cyan-500',
    },
    {
      to: '/calendar',
      icon: Calendar,
      label: 'Calendar',
      description: 'Upcoming deadlines',
      badge: overdueCount > 0 ? overdueCount : null,
      badgeVariant: 'danger' as const,
      activeColor: 'from-orange-500 to-red-500',
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
      description: 'Preferences',
      badge: null,
      badgeVariant: 'default' as const,
      activeColor: 'from-emerald-500 to-teal-500',
    },
  ];

  const badgeClasses = {
    primary: 'bg-violet-500/20 text-violet-600 dark:text-violet-300 border border-violet-400/30',
    danger: 'bg-red-500/20 text-red-600 dark:text-red-300 border border-red-400/30',
    default: '',
  };

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-[0.85rem] sm:top-[1.05rem] left-3 sm:left-4 z-50 p-2 rounded-xl hover:bg-primary/10 active:scale-95 transition-all duration-200 text-foreground group"
        title="Open navigation"
        aria-label="Open navigation menu"
        {...{ 'aria-expanded': isOpen ? 'true' : 'false' }}
        aria-controls="sidebar-panel"
      >
        <Menu className="w-5 h-5 group-hover:text-primary transition-colors" />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-all duration-300',
          isOpen
            ? 'bg-black/50 backdrop-blur-sm pointer-events-auto'
            : 'bg-transparent pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        id="sidebar-panel"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col',
          'w-[280px] sm:w-[300px]',
          /* Solid, high-contrast background */
          'bg-white dark:bg-[#0f1117] border-r border-slate-200 dark:border-slate-800',
          'shadow-2xl shadow-black/20',
          'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* ── Top accent bar ── */}
        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 shrink-0" />

        {/* ── Header ── */}
        <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">TaskFlow</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">Workspace</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── User profile card ── */}
        {user && (
          <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="relative shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-violet-400/30" />
                ) : (
                  <Avatar fallback={user.name} size="md" className="w-10 h-10 rounded-xl" />
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f1117] shadow-sm" />
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="shrink-0 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20">
                Online
              </div>
            </div>
          </div>
        )}

        {/* ── Quick stats ── */}
        {(projectCount > 0 || completedCount > 0 || overdueCount >= 0) && (
          <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Projects', value: projectCount, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20' },
                { label: 'Done', value: completedCount, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' },
                { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400', bg: overdueCount > 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
              ].map((stat) => (
                <div key={stat.label} className={cn('rounded-xl p-2 text-center border', stat.bg)}>
                  <p className={cn('text-base font-bold leading-none mb-0.5', stat.color)}>{stat.value}</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-none">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto custom-scrollbar">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 mb-2">
            Navigation
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:text-slate-900 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-violet-500 rounded-full" />
                  )}

                  {/* Icon box */}
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0',
                    isActive
                      ? `bg-gradient-to-br ${item.activeColor} shadow-md`
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  )}>
                    <item.icon className={cn(
                      'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    )} />
                  </div>

                  {/* Labels */}
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-tight">{item.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight hidden sm:block">
                      {item.description}
                    </span>
                  </div>

                  {/* Badge */}
                  {item.badge !== null ? (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[20px] text-center',
                      badgeClasses[item.badgeVariant]
                    )}>
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className={cn(
                      'w-3.5 h-3.5 shrink-0 transition-all duration-200',
                      isActive ? 'text-violet-400 opacity-60' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                    )} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* ── Status bar ── */}
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex-1">
              All systems <span className="text-emerald-600 dark:text-emerald-400 font-bold">operational</span>
            </p>
          </div>
        </div>

        {/* ── Logout ── */}
        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 active:scale-[0.98] transition-all duration-200 group border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
            aria-label="Logout"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-red-500/10 flex items-center justify-center transition-all duration-200 shrink-0">
              <LogOut className="w-4 h-4 shrink-0" />
            </div>
            <span className="font-semibold">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
