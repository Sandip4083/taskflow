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
    refetchInterval: 30000, // Poll every 30s
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
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl text-card-foreground sticky top-0 z-40 shadow-sm">
      <div className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: space for hamburger + logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spacer for the hamburger button — only when logged in */}
          {!isAuthPage && <div className="w-8 sm:w-9" />}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">
              TaskFlow
            </span>
          </div>
        </div>

        {/* Center: Ctrl+K search trigger */}
        {user && !isAuthPage && (
          <button
            onClick={() => { const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }); window.dispatchEvent(event); }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted border border-border/50 rounded-lg transition-all duration-200 hover:border-primary/30 group"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="ml-4 flex items-center gap-0.5 text-[10px] text-muted-foreground/60 bg-background px-1.5 py-0.5 rounded border border-border/50 font-mono group-hover:text-primary/60">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        )}

        {/* Right: controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-indigo-500" />
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
              >
                <Bell className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-[18px] sm:h-[18px] bg-red-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-card animate-scale-in shadow-lg shadow-red-500/30">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[380px] bg-card border border-border/50 rounded-xl shadow-2xl shadow-black/20 overflow-hidden animate-scale-in z-50">
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-[10px] sm:text-xs text-primary hover:underline font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 20).map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 border-b border-border/30 transition-all duration-200 cursor-pointer hover:bg-muted/30',
                            !notif.read && 'bg-primary/[0.03]'
                          )}
                          onClick={() => {
                            if (!notif.read) markOneReadMutation.mutate(notif.id);
                          }}
                        >
                          <span className="text-base sm:text-lg shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-xs sm:text-sm leading-relaxed',
                              !notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'
                            )}>
                              {notif.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                              {format(new Date(notif.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 shadow-sm shadow-primary/30" />
                          )}
                          {notif.read && (
                            <Check className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-1" />
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
            <div className="flex items-center gap-1.5 sm:gap-3 ml-1 sm:ml-2">
              <div className="hidden sm:flex items-center gap-2.5 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <Avatar fallback={user.name} src={user.avatar} size="sm" className="h-6 w-6 text-[9px]" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              {/* Mobile: just show avatar */}
              <div className="flex sm:hidden">
                <Avatar fallback={user.name} src={user.avatar} size="sm" className="h-7 w-7 text-[10px]" />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={logout}
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title="Logout"
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
