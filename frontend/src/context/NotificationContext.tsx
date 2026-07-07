import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

interface NotificationSettings {
  pushEnabled: boolean;
  emailNotifications: boolean;
  dueDateReminders: boolean;
  reminderHours: number; // hours before due date to remind
  pushPermission: NotificationPermission | 'unsupported';
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  requestPushPermission: () => Promise<boolean>;
  sendTestNotification: () => void;
}

const defaultSettings: NotificationSettings = {
  pushEnabled: false,
  emailNotifications: true,
  dueDateReminders: true,
  reminderHours: 24,
  pushPermission: 'default',
};

const STORAGE_KEY = 'taskflow_notification_settings';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    let pushPermission: 'default' | 'granted' | 'denied' | 'unsupported' = 'default';
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        pushPermission = 'unsupported';
      } else {
        pushPermission = Notification.permission;
      }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed, pushPermission };
      }
    } catch {
      // ignore
    }
    return { ...defaultSettings, pushPermission };
  });

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Due date reminder scheduler — checks every 5 minutes
  useEffect(() => {
    if (!settings.dueDateReminders) return;

    const checkDueDates = () => {
      try {
        const projects = JSON.parse(localStorage.getItem('taskflow_tasks_cache') || '[]');
        if (!Array.isArray(projects)) return;
        
        const now = new Date();
        const reminderMs = settings.reminderHours * 60 * 60 * 1000;
        const notifiedKey = 'taskflow_notified_tasks';
        const notifiedSet: Set<string> = new Set(
          JSON.parse(localStorage.getItem(notifiedKey) || '[]')
        );

        projects.forEach((task: { _id?: string; id?: string; title?: string; dueDate?: string; status?: string }) => {
          const taskId = task._id || task.id;
          if (!taskId || !task.dueDate || task.status === 'done') return;
          
          const due = new Date(task.dueDate);
          const timeToDue = due.getTime() - now.getTime();
          
          if (timeToDue > 0 && timeToDue <= reminderMs && !notifiedSet.has(taskId)) {
            notifiedSet.add(taskId);
            const hoursLeft = Math.round(timeToDue / (60 * 60 * 1000));
            
            // Browser push notification
            if (settings.pushEnabled && Notification.permission === 'granted') {
              new Notification('TaskFlow — Task Due Soon', {
                body: `"${task.title}" is due in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `due-${taskId}`,
              });
            }
            
            // In-app toast reminder
            toast.warning(`⏰ "${task.title}" due in ${hoursLeft}h`, {
              description: 'Don\'t forget to complete this task!',
              duration: 8000,
            });
            
            localStorage.setItem(notifiedKey, JSON.stringify([...notifiedSet]));
          }
        });
      } catch {
        // ignore cache errors
      }
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, [settings.dueDateReminders, settings.pushEnabled, settings.reminderHours]);

  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser.');
      return false;
    }

    if (Notification.permission === 'denied') {
      toast.error('Push notifications are blocked. Please enable them in your browser settings.', {
        duration: 6000,
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      setSettings(s => ({ ...s, pushPermission: 'granted', pushEnabled: true }));
      return true;
    }

    const permission = await Notification.requestPermission();
    setSettings(s => ({ ...s, pushPermission: permission, pushEnabled: permission === 'granted' }));

    if (permission === 'granted') {
      toast.success('Push notifications enabled!');
      return true;
    } else {
      toast.error('Push notification permission denied.');
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(() => {
    if (Notification.permission !== 'granted') {
      toast.error('Please enable push notifications first.');
      return;
    }
    new Notification('TaskFlow — Test Notification 🎉', {
      body: 'Push notifications are working correctly!',
      icon: '/favicon.ico',
    });
    toast.success('Test notification sent!');
  }, []);

  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    setSettings(s => ({ ...s, ...updates }));
  }, []);

  return (
    <NotificationContext.Provider value={{ settings, updateSettings, requestPushPermission, sendTestNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
