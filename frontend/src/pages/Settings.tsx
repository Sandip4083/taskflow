import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Moon, Sun, Bell, Shield, Key } from 'lucide-react';

export const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <Avatar fallback={user?.name || 'User'} size="lg" className="w-24 h-24 text-2xl" />
              <div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Member
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Profile Details</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={user?.name} className="max-w-md" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input defaultValue={user?.email} disabled className="max-w-md bg-muted" />
                <p className="text-xs text-muted-foreground">Email addresses cannot be changed directly.</p>
              </div>
              <Button className="mt-2">Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Moon className="w-5 h-5" /> Appearance
              </CardTitle>
              <CardDescription>Customize how TaskFlow looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Theme Preference</h4>
                  <p className="text-xs text-muted-foreground">
                    Currently using {theme} mode.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notifications
              </CardTitle>
              <CardDescription>Configure how you receive alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-sm">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground">Receive daily digests and task assignments via email.</p>
                </div>
                <input type="checkbox" className="w-4 h-4 text-primary bg-background border-border rounded" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-destructive">
                <Shield className="w-5 h-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
