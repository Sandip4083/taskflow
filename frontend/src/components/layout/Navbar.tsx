/* cSpell:words notif */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../../config';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { LogOut, Sun, Moon, Zap, Bell, Check, CheckCheck, Search, Command } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    enabled: !!user && !isAuthPage,
    refetchInterval: 30000,
  });

  const notifications: Notification[] = notifData?.notifications || [];
  const unreadCount: number = notifData?.unreadCount || 0;

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await axios.patch(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return '📋';
      case 'comment_added': return '💬';
      case 'project_invite': return '📁';
      case 'due_soon': return '⏰';
      default: return '🔔';
    }
  };

  return (
    <nav className="border-b border-border/40 bg-card/85 backdrop-blur-xl text-card-foreground sticky top-0 z-40 shadow-sm shadow-black/5">
      <div className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: spacer for hamburger + logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Hamburger spacer — only when logged in */}
          {!isAuthPage && <div className="w-8 sm:w-9" />}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/25 group-hover:shadow-lg group-hover:shadow-primary/35 transition-all duration-300 group-hover:scale-105">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              TaskFlow
            </span>
          </div>
        </div>

        {/* Center: Ctrl+K search trigger */}
        {user && !isAuthPage && (
          <button
            onClick={() => { const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }); window.dispatchEvent(event); }}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border/60 rounded-xl transition-all duration-200 hover:border-primary/30 hover:shadow-sm group max-w-xs flex-1"
            aria-label="Open command palette"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs flex-1 text-left">Search projects, tasks...</span>
            <kbd className="flex items-center gap-0.5 text-[10px] text-muted-foreground/50 bg-background/80 px-1.5 py-0.5 rounded-md border border-border/50 font-mono shrink-0 group-hover:text-primary/50">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        )}

        {/* Right: controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-[17px] sm:w-[17px] text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 sm:h-[17px] sm:w-[17px] text-indigo-500" />
            )}
          </Button>

          {/* Notification Bell */}
          {user && !isAuthPage && (
            <div className="relative" ref={bellRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 transition-all duration-200 relative"
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="h-4 w-4 sm:h-[17px] sm:w-[17px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-card animate-scale-in shadow-lg shadow-red-500/30">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2.5 w-[320px] sm:w-[380px] bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden animate-scale-in z-50">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40 bg-gradient-to-r from-primary/5 via-violet-500/5 to-transparent">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-[10px] text-primary hover:text-primary/70 font-medium flex items-center gap-1 transition-colors"
                        aria-label="Mark all notifications as read"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <Bell className="w-10 h-10 text-muted-foreground/15 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">You're all caught up!</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'flex items-start gap-3 px-4 py-3.5 border-b border-border/20 transition-all duration-200 cursor-pointer hover:bg-muted/30 group',
                            !notif.read && 'bg-primary/[0.03]'
                          )}
                          onClick={() => {
                            if (!notif.read) markOneReadMutation.mutate(notif.id);
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={notif.message}
                        >
                          <span className="text-lg shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-xs leading-relaxed',
                              !notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                            )}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                              {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm shadow-primary/40" />
                          )}
                          {notif.read && (
                            <Check className="w-3.5 h-3.5 text-muted-foreground/25 shrink-0 mt-1" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {user && !isAuthPage && (
            <div className="flex items-center gap-1.5 sm:gap-2 ml-0.5 sm:ml-1">
              <div className="hidden sm:flex items-center gap-2.5 bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-xl border border-border/50 transition-colors cursor-default">
                <Avatar fallback={user.name} src={user.avatar} size="sm" className="h-6 w-6 text-[9px]" />
                <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
              </div>
              {/* Mobile: just avatar */}
              <div className="flex sm:hidden">
                <Avatar fallback={user.name} src={user.avatar} size="sm" className="h-7 w-7 text-[10px]" />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={logout}
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
