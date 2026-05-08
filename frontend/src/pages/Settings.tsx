import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Moon, Sun, Bell, Shield, Settings as SettingsIcon, Palette, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');

  const handleSave = () => {
    toast.success('Settings saved! (Profile update coming soon)');
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light', desc: 'Clean & bright' },
    { value: 'dark' as const, icon: Moon, label: 'Dark', desc: 'Easy on eyes' },
    { value: 'system' as const, icon: Monitor, label: 'System', desc: 'Match OS' },
  ];

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5 sm:space-y-8">
      <div className="animate-fade-in-down">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center border border-primary/20 shrink-0">
            <SettingsIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 ml-10 sm:ml-[52px] text-xs sm:text-sm">Manage your account preferences.</p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile card — full width on mobile, stacks on top */}
        <div className="md:col-span-1">
          <Card className="border-border/50 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="h-16 sm:h-20 bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20" />
            <CardContent className="pt-0 flex flex-col items-center text-center -mt-6 sm:-mt-8 pb-4 sm:pb-6">
              <Avatar fallback={user?.name || 'User'} size="lg" className="w-12 h-12 sm:w-16 sm:h-16 text-lg sm:text-xl ring-4 ring-card shadow-lg" />
              <div className="mt-3 sm:mt-4">
                <h3 className="font-bold text-base sm:text-lg">{user?.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 break-all">{user?.email}</p>
              </div>
              <Badge variant="default" className="mt-2 sm:mt-3 gap-1 text-[10px] sm:text-xs">
                <Shield className="w-3 h-3" />
                Member
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <Card className="animate-fade-in-up overflow-hidden border-border/50">
            <div className="h-0.5 w-full bg-gradient-to-r from-primary to-purple-500" />
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl">Profile Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-full sm:max-w-md" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Email Address</label>
                <Input defaultValue={user?.email} disabled className="max-w-full sm:max-w-md bg-muted/50 cursor-not-allowed" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>
              <Button className="mt-2 w-full sm:w-auto" onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up overflow-hidden border-border/50">
            <div className="h-0.5 w-full bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Appearance
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Customize how TaskFlow looks.</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {themeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`p-2.5 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-center group hover:border-primary/50 ${
                      theme === opt.value 
                        ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                        : 'border-border/50 hover:bg-muted/50'
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 transition-transform duration-200 group-hover:scale-110 ${
                      theme === opt.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <p className="text-[10px] sm:text-sm font-semibold">{opt.label}</p>
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up overflow-hidden border-border/50">
            <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Notifications
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure your alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              {[
                { title: 'Email Notifications', desc: 'Daily digests and task assignments.' },
                { title: 'Push Notifications', desc: 'Instant browser updates.' },
                { title: 'Due Date Reminders', desc: '24 hours before deadlines.' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 border border-border/50 rounded-lg sm:rounded-xl bg-card hover:border-primary/20 transition-all duration-200 group gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-medium text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i === 0} />
                    <div className="w-9 h-5 sm:w-11 sm:h-6 bg-muted peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-primary shadow-inner" />
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-destructive/20 animate-fade-in-up overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-red-500 to-rose-500" />
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-destructive">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Permanently delete your account and all data. This cannot be undone.
              </p>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={() => toast.error('Account deletion is not available')}>
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
