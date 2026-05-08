import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Calendar, Settings, LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: FolderKanban, label: 'Projects', description: 'Manage workspaces' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Analytics & stats' },
    { to: '/calendar', icon: Calendar, label: 'Calendar', description: 'Upcoming deadlines' },
    { to: '/settings', icon: Settings, label: 'Settings', description: 'Preferences' },
  ];

  return (
    <>
      {/* Hamburger button — fixed in navbar area */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-[0.85rem] sm:top-[1.1rem] left-3 sm:left-4 z-50 p-1.5 sm:p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 text-foreground group"
        title="Open sidebar"
      >
        <Menu className="w-5 h-5 group-hover:text-primary transition-colors" />
      </button>

      {/* Overlay backdrop — click to close */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-[280px] sm:w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col shadow-2xl shadow-black/20 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-5 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-foreground">TaskFlow</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border/50">
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent p-2.5 sm:p-3 rounded-xl border border-primary/10">
              <Avatar fallback={user.name} size="md" className="shrink-0" />
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div className="flex-1 py-3 sm:py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2 sm:mb-3">Navigation</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/10'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <div className={cn(
                'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0',
                'bg-muted group-hover:bg-primary/10'
              )}>
                <item.icon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
              </div>
              <div className="min-w-0">
                <span className="block text-sm">{item.label}</span>
                <span className="text-[10px] text-muted-foreground/70 font-normal hidden sm:block">{item.description}</span>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-border/50 shrink-0">
          <button
            onClick={() => { logout(); setIsOpen(false); }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted group-hover:bg-destructive/10 flex items-center justify-center transition-all duration-200 shrink-0">
              <LogOut className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] shrink-0" />
            </div>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
