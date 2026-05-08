import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Loader2, LogIn, CheckCircle2, Zap, Shield, BarChart3, Users } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade encryption' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track team productivity' },
  { icon: Users, title: 'Team Collaboration', desc: 'Work together seamlessly' },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'object' 
        ? (errorData.error || errorData.message || JSON.stringify(errorData))
        : (errorData || err.message || 'Failed to login');
      setError(String(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-background">
      {/* Left side: branding/hero — hidden on mobile and tablet */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 flex-col justify-center items-center p-8 xl:p-12 border-r border-border/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 animate-gradient" />
        
        <div className="max-w-md space-y-6 xl:space-y-8 z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 shadow-sm">
            <Zap className="w-4 h-4" />
            TaskFlow Pro
          </div>
          <h1 className="text-3xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Manage tasks with <span className="text-gradient">precision</span>.
          </h1>
          <p className="text-base xl:text-lg text-muted-foreground leading-relaxed">
            A premium full-stack Kanban board for modern teams. Collaborate in real-time, track productivity, and never miss a deadline.
          </p>

          <div className="space-y-3 pt-2 xl:pt-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 bg-card/50 border border-border/50 p-3 xl:p-4 rounded-xl hover:border-primary/30 transition-all duration-300 animate-fade-in-up">
                <div className="w-9 h-9 xl:w-10 xl:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 xl:w-5 xl:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-32 -right-32 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl animate-float delay-500" />
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in-up">
          {/* Mobile logo */}
          <div className="text-center lg:hidden mb-4 sm:mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">TaskFlow</h1>
            <p className="text-sm text-muted-foreground mt-1">Premium project management</p>
          </div>
          
          <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
            <CardHeader className="space-y-1 pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">Welcome back</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {error && (
                  <div className="p-3 text-xs sm:text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-fade-in flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium leading-none" htmlFor="email">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium leading-none" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full mt-4 sm:mt-6 h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  Sign in
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-6 sm:pb-8 border-t border-border/50 px-4 sm:px-6">
              <div className="text-xs sm:text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
