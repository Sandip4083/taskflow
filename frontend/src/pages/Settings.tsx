import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import {
  Moon, Sun, Bell, BellOff, Shield, Settings as SettingsIcon, Palette,
  Monitor, Loader2, CheckCircle2, Camera, Upload, Clock, Mail,
  Zap, AlertTriangle, ChevronRight, Smartphone, Check,
  Keyboard, Download, Trash2, Globe, Lock, Database, RefreshCw, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

// ── Settings section tabs ────────────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: 'Profile', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'data', label: 'Data & Privacy', icon: Monitor },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Toggle Switch component ──────────────────────────────────────────────────
const Toggle = ({
  checked,
  onChange,
  id,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
}) => (
  <button
    id={id}
    {...{ 'aria-pressed': checked ? 'true' : 'false' }}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
      checked
        ? 'bg-primary border-primary'
        : 'bg-muted border-border/70',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={cn(
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-200',
        checked ? 'translate-x-5' : 'translate-x-0.5'
      )}
    />
  </button>
);

// ── Notification row ─────────────────────────────────────────────────────────
const NotifRow = ({
  icon: Icon,
  iconClass,
  title,
  desc,
  checked,
  onChange,
  id,
  disabled,
  children,
}: {
  icon: React.ElementType;
  iconClass: string;
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <div className={cn(
    'rounded-2xl border transition-all duration-200 overflow-hidden',
    checked ? 'border-primary/20 bg-primary/[0.02]' : 'border-border/50 bg-card/50'
  )}>
    <div className="flex items-start gap-3 p-3.5 sm:p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', iconClass)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={id} className="font-semibold text-sm cursor-pointer select-none">{title}</label>
          <Toggle checked={checked} onChange={onChange} id={id} disabled={disabled} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
        {children && checked && (
          <div className="mt-3 pt-3 border-t border-border/40">
            {children}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Main Settings Page ───────────────────────────────────────────────────────
export const Settings = () => {
  const { user, login } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings: notifSettings, updateSettings, requestPushPermission, sendTestNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [name, setName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [requestingPush, setRequestingPush] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await axios.patch(`${API_URL}/users/profile`, { name: newName }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success('Profile updated successfully!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (avatarData: string) => {
      const res = await axios.patch(`${API_URL}/users/avatar`, { avatar: avatarData }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return res.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      setAvatarPreview(null);
      toast.success('Profile picture updated!');
    },
    onError: () => toast.error('Failed to upload picture. Try a smaller image.'),
  });

  const handleSave = () => {
    if (!name.trim()) return toast.error('Name cannot be empty');
    if (name.trim() === user?.name) return toast.info('No changes to save');
    updateProfileMutation.mutate(name.trim());
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const reader = new FileReader();
    reader.onload = (event) => setAvatarPreview(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!enabled) {
      updateSettings({ pushEnabled: false });
      return;
    }
    setRequestingPush(true);
    const granted = await requestPushPermission();
    if (!granted) updateSettings({ pushEnabled: false });
    setRequestingPush(false);
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light', desc: 'Clean & bright', gradient: 'from-amber-400 to-orange-400' },
    { value: 'dark' as const, icon: Moon, label: 'Dark', desc: 'Easy on eyes', gradient: 'from-indigo-500 to-purple-600' },
    { value: 'system' as const, icon: Monitor, label: 'System', desc: 'Follow OS', gradient: 'from-slate-400 to-slate-600' },
  ];

  const currentAvatar = avatarPreview || user?.avatar;
  const pushSupported = 'Notification' in window;
  const pushPermissionDenied = notifSettings.pushPermission === 'denied';

  return (
    <div className="page-container space-y-5 sm:space-y-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="animate-fade-in-down">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <div className="page-header-icon">
            <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground mt-1.5 ml-11 sm:ml-[52px] text-sm">
          Manage your account, appearance, and notification preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
        {/* ── Left sidebar: tabs + profile card ── */}
        <div className="lg:w-64 xl:w-72 shrink-0 space-y-4">
          {/* Profile card */}
          <Card className="border-border/50 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="h-16 sm:h-20 bg-gradient-to-br from-primary/25 via-violet-500/20 to-blue-500/15" />
            <CardContent className="pt-0 flex flex-col items-center text-center -mt-8 sm:-mt-10 pb-4 sm:pb-5">
              {/* Avatar */}
              <div className="relative group mb-2.5">
                {currentAvatar ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-4 ring-card shadow-xl overflow-hidden">
                    <img src={currentAvatar} alt={user?.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Avatar fallback={user?.name || 'User'} size="lg" className="w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl ring-4 ring-card shadow-xl" />
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                  aria-label="Change profile photo"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileSelect}
                  aria-label="Upload avatar"
                />
              </div>

              {avatarPreview && (
                <div className="flex items-center gap-2 animate-fade-in mb-2">
                  <Button size="sm" onClick={() => uploadAvatarMutation.mutate(avatarPreview)} disabled={uploadAvatarMutation.isPending} className="text-xs h-7">
                    {uploadAvatarMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-xs h-7">
                    Cancel
                  </Button>
                </div>
              )}

              {!avatarPreview && (
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-primary hover:text-primary/70 font-medium flex items-center gap-1 cursor-pointer transition-colors mb-1">
                  <Camera className="w-3 h-3" /> Change photo
                </button>
              )}

              <h3 className="font-bold text-base mt-1">{user?.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 break-all px-2">{user?.email}</p>
              <Badge variant="default" className="mt-2.5 gap-1 text-[10px]">
                <Shield className="w-3 h-3" /> Member
              </Badge>
            </CardContent>
          </Card>

          {/* Tab navigation */}
          <Card className="border-border/50 shadow-sm animate-fade-in-up overflow-hidden">
            <nav className="p-2 space-y-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left group',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/15'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent',
                      tab.id === 'danger' && !isActive && 'hover:text-destructive hover:bg-destructive/5'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', tab.id === 'danger' && !isActive && 'group-hover:text-destructive')} />
                    <span className="flex-1">{tab.label}</span>
                    <ChevronRight className={cn('w-3.5 h-3.5 transition-transform duration-200', isActive ? 'text-primary rotate-90' : 'text-muted-foreground/30')} />
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-5">

          {/* ━━ PROFILE TAB ━━ */}
          {activeTab === 'profile' && (
            <Card className="animate-fade-in-up overflow-hidden border-border/50">
              <div className="h-0.5 w-full bg-gradient-to-r from-primary to-violet-500" />
              <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                <CardTitle className="text-base sm:text-lg">Profile Details</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pb-5 sm:pb-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium" htmlFor="profile-name">Full Name</label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium" htmlFor="profile-email">Email Address</label>
                    <Input
                      id="profile-email"
                      defaultValue={user?.email}
                      disabled
                      className="bg-muted/40 cursor-not-allowed opacity-70"
                    />
                    <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                  </div>
                </div>
                <Button
                  className="mt-1 w-full sm:w-auto gap-1.5"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending || name.trim() === user?.name || !name.trim()}
                >
                  {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : updateProfileMutation.isSuccess && name.trim() === user?.name ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ━━ APPEARANCE TAB ━━ */}
          {activeTab === 'appearance' && (
            <Card className="animate-fade-in-up overflow-hidden border-border/50">
              <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Appearance
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Customize how TaskFlow looks on your device.</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6">
                <div className="grid grid-cols-3 gap-3 max-w-sm">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={cn(
                        'relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-center group hover:border-primary/40 flex flex-col items-center gap-2 overflow-hidden',
                        theme === opt.value
                          ? 'border-primary bg-primary/8 shadow-md shadow-primary/10'
                          : 'border-border/50 hover:bg-muted/50 bg-card'
                      )}
                      aria-label={`Set ${opt.label} theme`}
                      {...{ 'aria-pressed': theme === opt.value ? 'true' : 'false' }}
                    >
                      {theme === opt.value && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                      <div className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                        theme === opt.value ? `bg-gradient-to-br ${opt.gradient} shadow-md` : 'bg-muted'
                      )}>
                        <opt.icon className={cn('w-4 h-4', theme === opt.value ? 'text-white' : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <p className={cn('text-xs font-bold', theme === opt.value ? 'text-primary' : 'text-foreground')}>{opt.label}</p>
                        <p className="text-[9px] text-muted-foreground hidden sm:block leading-tight">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Current theme: <span className="font-semibold text-foreground capitalize">{theme}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* ━━ NOTIFICATIONS TAB ━━ */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /> Notifications
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Configure how and when TaskFlow notifies you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-4 sm:px-6 pb-5 sm:pb-6">

                  {/* Email notifications */}
                  <NotifRow
                    id="toggle-email"
                    icon={Mail}
                    iconClass="bg-blue-500/10 text-blue-500"
                    title="Email Notifications"
                    desc="Receive daily digests and task assignment emails."
                    checked={notifSettings.emailNotifications}
                    onChange={(v) => {
                      updateSettings({ emailNotifications: v });
                      toast.success(v ? 'Email notifications enabled' : 'Email notifications disabled');
                    }}
                  />

                  {/* Push notifications */}
                  <NotifRow
                    id="toggle-push"
                    icon={notifSettings.pushEnabled ? Smartphone : BellOff}
                    iconClass={notifSettings.pushEnabled ? 'bg-violet-500/10 text-violet-500' : 'bg-muted text-muted-foreground'}
                    title="Push Notifications"
                    desc={
                      !pushSupported
                        ? 'Not supported in this browser.'
                        : pushPermissionDenied
                        ? 'Blocked by browser. Enable in browser settings.'
                        : 'Get instant browser alerts for important updates.'
                    }
                    checked={notifSettings.pushEnabled && notifSettings.pushPermission === 'granted'}
                    onChange={handlePushToggle}
                    disabled={!pushSupported || pushPermissionDenied || requestingPush}
                  >
                    {/* Test notification button */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={sendTestNotification}
                        className="text-xs h-8 gap-1.5"
                        disabled={notifSettings.pushPermission !== 'granted'}
                      >
                        <Zap className="w-3 h-3" /> Send Test Notification
                      </Button>
                      {notifSettings.pushPermission === 'granted' && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Permission granted
                        </span>
                      )}
                    </div>
                    {pushPermissionDenied && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Open browser settings and allow notifications for this site.
                      </p>
                    )}
                  </NotifRow>

                  {/* Due date reminders */}
                  <NotifRow
                    id="toggle-due"
                    icon={Clock}
                    iconClass="bg-amber-500/10 text-amber-500"
                    title="Due Date Reminders"
                    desc="Get notified before tasks are due so you never miss a deadline."
                    checked={notifSettings.dueDateReminders}
                    onChange={(v) => {
                      updateSettings({ dueDateReminders: v });
                      toast.success(v ? 'Due date reminders enabled' : 'Due date reminders disabled');
                    }}
                  >
                    {/* Reminder timing */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground/80">Remind me before deadline:</p>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 6, 12, 24, 48].map((hours) => (
                          <button
                            key={hours}
                            onClick={() => {
                              updateSettings({ reminderHours: hours });
                              toast.success(`Reminder set to ${hours}h before deadline`);
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200',
                              notifSettings.reminderHours === hours
                                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                                : 'border-border/60 bg-card hover:border-amber-400/50 hover:bg-amber-500/5 text-muted-foreground'
                            )}
                          >
                            {hours < 24 ? `${hours}h` : `${hours / 24}d`}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Currently: <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {notifSettings.reminderHours < 24
                            ? `${notifSettings.reminderHours} hour${notifSettings.reminderHours !== 1 ? 's' : ''}`
                            : `${notifSettings.reminderHours / 24} day${notifSettings.reminderHours / 24 !== 1 ? 's' : ''}`
                          }
                        </span> before due date
                      </p>
                    </div>
                  </NotifRow>

                </CardContent>
              </Card>

              {/* Info card */}
              <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                <Bell className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">How notifications work</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Push notifications use your browser's built-in notification system.
                    Due date reminders check your tasks automatically every 5 minutes.
                    Your preferences are saved locally and applied instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ━━ DANGER ZONE TAB ━━ */}
          {/* ━━ PRODUCTIVITY TAB ━━ */}
          {activeTab === 'productivity' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
              {/* Keyboard Shortcuts */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-purple-600" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" /> Keyboard Shortcuts
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Quick actions to boost your productivity.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      { keys: ['Ctrl', 'K'], action: 'Open command palette' },
                      { keys: ['Ctrl', 'N'], action: 'Create new task' },
                      { keys: ['Ctrl', '/'], action: 'Search tasks' },
                      { keys: ['Esc'], action: 'Close modal / sidebar' },
                      { keys: ['Ctrl', 'D'], action: 'Go to Dashboard' },
                      { keys: ['Ctrl', 'P'], action: 'Go to Projects' },
                      { keys: ['Ctrl', 'S'], action: 'Save current form' },
                      { keys: ['?'], action: 'Show shortcuts help' },
                    ].map((shortcut) => (
                      <div key={shortcut.action} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/40 transition-colors group">
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{shortcut.action}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((k) => (
                            <kbd key={k} className="px-2 py-0.5 text-[10px] font-mono font-bold bg-muted border border-border/70 rounded-lg text-foreground shadow-sm">{k}</kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Task Defaults */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /> Task Defaults
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Set default values when creating new tasks.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium" htmlFor="default-priority">Default Priority</label>
                      <select
                        id="default-priority"
                        className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                        defaultValue={localStorage.getItem('tf_default_priority') || 'medium'}
                        onChange={(e) => { localStorage.setItem('tf_default_priority', e.target.value); toast.success('Default priority saved'); }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium" htmlFor="default-status">Default Status</label>
                      <select
                        id="default-status"
                        className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                        defaultValue={localStorage.getItem('tf_default_status') || 'todo'}
                        onChange={(e) => { localStorage.setItem('tf_default_status', e.target.value); toast.success('Default status saved'); }}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      These defaults will be pre-selected when you open the "Add Task" form in any project.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Work Hours */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> Work Schedule
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Set your typical work hours for smarter reminders.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium" htmlFor="work-start">Work Start Time</label>
                      <Input
                        id="work-start"
                        type="time"
                        defaultValue={localStorage.getItem('tf_work_start') || '09:00'}
                        onChange={(e) => localStorage.setItem('tf_work_start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium" htmlFor="work-end">Work End Time</label>
                      <Input
                        id="work-end"
                        type="time"
                        defaultValue={localStorage.getItem('tf_work_end') || '17:00'}
                        onChange={(e) => localStorage.setItem('tf_work_end', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => {
                      const start = (document.getElementById('work-start') as HTMLInputElement)?.value;
                      const end = (document.getElementById('work-end') as HTMLInputElement)?.value;
                      if (start) localStorage.setItem('tf_work_start', start);
                      if (end) localStorage.setItem('tf_work_end', end);
                      toast.success('Work schedule saved!');
                    }}
                  >
                    <Check className="w-4 h-4" /> Save Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ━━ DATA & PRIVACY TAB ━━ */}
          {activeTab === 'data' && (
            <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
              {/* Export data */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> Export Your Data
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Download a copy of your TaskFlow data.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm font-semibold">Account Data (JSON)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Profile, settings, and all preferences.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 mt-1"
                        onClick={() => {
                          const data = {
                            profile: { name: user?.name, email: user?.email },
                            notificationSettings: notifSettings,
                            exportedAt: new Date().toISOString(),
                          };
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'taskflow_data.json';
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Data exported as JSON!');
                        }}
                      >
                        <Download className="w-3.5 h-3.5" /> Export JSON
                      </Button>
                    </div>
                    <div className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold">Settings (CSV)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Export notification preferences as CSV.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 mt-1"
                        onClick={() => {
                          const rows = [
                            ['Setting', 'Value'],
                            ['Push Notifications', notifSettings.pushEnabled ? 'Enabled' : 'Disabled'],
                            ['Email Notifications', notifSettings.emailNotifications ? 'Enabled' : 'Disabled'],
                            ['Due Date Reminders', notifSettings.dueDateReminders ? 'Enabled' : 'Disabled'],
                            ['Reminder Hours', String(notifSettings.reminderHours)],
                            ['Theme', theme],
                          ];
                          const csv = rows.map(r => r.join(',')).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'taskflow_settings.csv';
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success('Settings exported as CSV!');
                        }}
                      >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage & Cache */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Cache & Storage
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage local data stored in your browser.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card/60">
                    <div>
                      <p className="text-sm font-semibold">App Cache</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Stored queries, task previews, and session data.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 shrink-0"
                      onClick={() => {
                        ['taskflow_tasks_cache', 'taskflow_notified_tasks'].forEach(k => localStorage.removeItem(k));
                        toast.success('App cache cleared!');
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Cache
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card/60">
                    <div>
                      <p className="text-sm font-semibold">Notification History</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Reset which tasks have triggered reminders.</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 shrink-0"
                      onClick={() => {
                        localStorage.removeItem('taskflow_notified_tasks');
                        toast.success('Notification history cleared!');
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="overflow-hidden border-border/50">
                <div className="h-0.5 w-full bg-gradient-to-r from-slate-500 to-slate-600" />
                <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" /> Security
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage your session and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card/60">
                    <div>
                      <p className="text-sm font-semibold">Active Session</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Logged in as <span className="font-medium text-foreground">{user?.email}</span>
                      </p>
                    </div>
                    <Badge variant="default" className="gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 bg-muted/30 rounded-2xl border border-border/40">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your session token is stored locally and expires automatically.
                      Signing out removes all session data from this device.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'danger' && (
            <Card className="border-destructive/25 animate-fade-in-up overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
              <CardHeader className="px-4 sm:px-6 pt-5 pb-1">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-destructive">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> Danger Zone
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Irreversible actions — proceed with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                <div className="p-4 bg-destructive/5 border border-destructive/15 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Permanently delete your account and all associated data.{' '}
                        <strong className="text-foreground">This action cannot be undone.</strong>
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto gap-2"
                    onClick={() => toast.error('Account deletion is not available in this version')}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
