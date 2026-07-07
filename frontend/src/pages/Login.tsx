import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Loader2, LogIn, CheckCircle2, Zap, Shield, BarChart3, Users, ArrowRight, Eye, EyeOff } from 'lucide-react';

const features = [
  { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade encryption', color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-500' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track team productivity', color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500' },
  { icon: Users, title: 'Team Collaboration', desc: 'Work together seamlessly', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' },
];

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    } catch (err: unknown) {
      let errorMessage = 'Invalid email or password';
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object') {
          const msg = (errorData as Record<string, unknown>).message || (errorData as Record<string, unknown>).error;
          if (typeof msg === 'string') {
            errorMessage = msg;
          } else if (Array.isArray((errorData as Record<string, unknown>).errors)) {
            const errors = (errorData as Record<string, unknown>).errors as Record<string, unknown>[];
            if (errors.length > 0) errorMessage = String(errors[0]?.msg || errors[0]?.message || JSON.stringify(errors[0]));
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-violet-500/6 rounded-full blur-[120px] animate-float delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/4 rounded-full blur-[140px]" />
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.02] auth-dot-grid" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
        {/* Left side: branding — hidden on mobile */}
        <div className="hidden lg:flex flex-1 flex-col space-y-8 animate-fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20 shadow-sm mb-7">
              <Zap className="w-4 h-4" />
              TaskFlow Pro
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Manage tasks<br />with <span className="text-gradient">precision</span>.
            </h1>
            <p className="text-base xl:text-lg text-muted-foreground leading-relaxed mt-5 max-w-md">
              A premium full-stack Kanban board for modern teams. Collaborate, track productivity, and never miss a deadline.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 bg-card/70 backdrop-blur-sm border border-border/50 p-4 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group animate-fade-in-up ${
                  i === 0 ? 'delay-200' : i === 1 ? 'delay-300' : 'delay-400'
                }`}
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <div className="flex -space-x-2">
              {['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-background flex items-center justify-center text-[9px] font-bold text-white`}>
                  {['S', 'A', 'M', 'K'][i]}
                </div>
              ))}
            </div>
            <span>Trusted by 1,000+ teams worldwide</span>
          </div>
        </div>

        {/* Right side: Login form */}
        <div className="w-full max-w-[420px] animate-fade-in-up delay-100">
          {/* Mobile branding */}
          <div className="text-center lg:hidden mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 animate-float">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome to TaskFlow</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Premium project management for teams</p>
          </div>
          
          <Card className="border-border/50 shadow-2xl shadow-black/10 bg-card/90 backdrop-blur-xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-blue-500" />
            <CardHeader className="space-y-1.5 pb-2 pt-7 px-6 sm:px-8">
              <CardTitle className="text-xl sm:text-2xl font-extrabold text-center">Welcome back</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Sign in to access your workspace
              </p>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pt-4 pb-2">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Error alert */}
                {error && (
                  <div 
                    className="p-3 text-xs sm:text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 animate-fade-in flex items-start gap-2.5"
                    role="alert"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0 animate-pulse" />
                    {error}
                  </div>
                )}
                
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="login-email">
                    Email address
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="bg-background/60 h-11 focus:shadow-lg focus:shadow-primary/10"
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="login-password">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-background/60 h-11 pr-10 focus:shadow-lg focus:shadow-primary/10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm sm:text-base group relative overflow-hidden mt-2 shadow-md shadow-primary/25" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign in
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-7 border-t border-border/40 px-6 sm:px-8 mt-2">
              <div className="text-xs sm:text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4 transition-colors">
                  Create one free
                </Link>
              </div>
            </CardFooter>
          </Card>

          <p className="text-center text-[10px] text-muted-foreground/40 mt-5 lg:hidden">
            By signing in, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};
