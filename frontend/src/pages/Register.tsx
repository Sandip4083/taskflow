import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Loader2, UserPlus, Zap, Sparkles, Globe, Lock } from 'lucide-react';

const benefits = [
  { icon: Sparkles, title: 'AI-powered insights', desc: 'Smart task prioritization' },
  { icon: Globe, title: 'Access anywhere', desc: 'Cloud-synced across devices' },
  { icon: Lock, title: 'Bank-level security', desc: 'Your data stays private' },
];

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, { name, email, password });
      navigate('/login');
    } catch (err: unknown) {
      let errorMessage = 'Registration failed';
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
          } else {
            errorMessage = JSON.stringify(errorData);
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

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (password.length < 8) return { label: 'Fair', color: 'bg-amber-500', width: '50%' };
    if (password.length < 12) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row-reverse bg-background">
      {/* Right side: branding/hero — hidden on mobile */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-bl from-primary/5 via-blue-500/5 to-emerald-500/5 flex-col justify-center items-center p-8 xl:p-12 border-l border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary via-blue-500 to-emerald-500 animate-gradient" />
        <div className="max-w-md space-y-6 xl:space-y-8 z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Free to get started
          </div>
          <h1 className="text-3xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Start collaborating <span className="text-gradient">today</span>.
          </h1>
          <p className="text-base xl:text-lg text-muted-foreground leading-relaxed">
            Create an account to build projects, invite team members, and track your tasks effortlessly.
          </p>

          <div className="space-y-3 pt-2 xl:pt-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-4 bg-card/50 border border-border/50 p-3 xl:p-4 rounded-xl hover:border-primary/30 transition-all duration-300 animate-fade-in-up">
                <div className="w-9 h-9 xl:w-10 xl:h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <b.icon className="w-4 h-4 xl:w-5 xl:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{b.title}</h3>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 -right-32 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-float delay-500" />
      </div>

      {/* Left side: Register form */}
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
            <p className="text-sm text-muted-foreground mt-1">Create your free account</p>
          </div>
          
          <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />
            <CardHeader className="space-y-1 pb-4 sm:pb-6 pt-6 sm:pt-8 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">Create an account</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Enter your details below to get started
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
                  <label className="text-xs sm:text-sm font-medium leading-none" htmlFor="name">
                    Full Name
                  </label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className="bg-background/50" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium leading-none" htmlFor="email">
                    Email address
                  </label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" className="bg-background/50" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium leading-none" htmlFor="password">
                    Password
                  </label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="bg-background/50" minLength={6} />
                  {password && (
                    <div className="space-y-1 animate-fade-in">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} rounded-full transition-all duration-500`} style={{ width: strength.width }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right font-medium">{strength.label}</p>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full mt-4 sm:mt-6 h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Create account
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-6 sm:pb-8 border-t border-border/50 px-4 sm:px-6">
              <div className="text-xs sm:text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
