import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Loader2, UserPlus, Zap, Sparkles, Globe, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

const benefits = [
  { icon: Sparkles, title: 'Smart Task Management', desc: 'AI-powered prioritization', color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-500' },
  { icon: Globe, title: 'Access Anywhere', desc: 'Cloud-synced across devices', color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500' },
  { icon: Lock, title: 'Bank-level Security', desc: 'Your data stays private', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' },
];

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (!password) return { label: '', color: '', barColor: '', width: '0%', checks: 0 };
    let checks = 0;
    if (password.length >= 6) checks++;
    if (password.length >= 8) checks++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) checks++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) checks++;
    
    if (checks <= 1) return { label: 'Weak', color: 'text-red-500', barColor: 'bg-red-500', width: '25%', checks };
    if (checks === 2) return { label: 'Fair', color: 'text-amber-500', barColor: 'bg-amber-500', width: '50%', checks };
    if (checks === 3) return { label: 'Good', color: 'text-blue-500', barColor: 'bg-blue-500', width: '75%', checks };
    return { label: 'Strong', color: 'text-emerald-500', barColor: 'bg-emerald-500', width: '100%', checks };
  };

  const strength = getPasswordStrength();

  const passwordRules = [
    { label: 'At least 6 characters', met: password.length >= 6 },
    { label: 'Upper & lowercase', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Number or symbol', met: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-emerald-500/6 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/3 -left-40 w-[500px] h-[500px] bg-blue-500/6 rounded-full blur-[120px] animate-float delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/4 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.02] auth-dot-grid" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row-reverse items-center gap-10 lg:gap-16">
        {/* Right side: branding — hidden on mobile */}
        <div className="hidden lg:flex flex-1 flex-col space-y-8 animate-fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-500/20 shadow-sm mb-7">
              <Sparkles className="w-4 h-4" />
              Free to get started
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Start collaborating<br /><span className="text-gradient">today</span>.
            </h1>
            <p className="text-base xl:text-lg text-muted-foreground leading-relaxed mt-5 max-w-md">
              Create an account to build projects, invite team members, and track your tasks effortlessly.
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 bg-card/70 backdrop-blur-sm border border-border/50 p-4 rounded-2xl hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group animate-fade-in-up ${
                  i === 0 ? 'delay-200' : i === 1 ? 'delay-300' : 'delay-400'
                }`}
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${b.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <b.icon className={`w-5 h-5 ${b.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-5 text-xs text-muted-foreground/60">
            {[
              { label: 'No credit card' },
              { label: 'Free forever' },
              { label: 'Cancel anytime' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Left side: Register form */}
        <div className="w-full max-w-[420px] animate-fade-in-up delay-100">
          {/* Mobile branding */}
          <div className="text-center lg:hidden mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-violet-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 animate-float">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Start managing projects for free</p>
          </div>
          
          <Card className="border-border/50 shadow-2xl shadow-black/10 bg-card/90 backdrop-blur-xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary via-blue-500 to-emerald-500" />
            <CardHeader className="space-y-1.5 pb-2 pt-7 px-6 sm:px-8">
              <CardTitle className="text-xl sm:text-2xl font-extrabold text-center">Create an account</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Fill in your details to get started for free
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

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="reg-name">Full Name</label>
                  <Input 
                    id="reg-name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="John Doe" 
                    className="bg-background/60 h-11 focus:shadow-lg focus:shadow-primary/10"
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="reg-email">Email address</label>
                  <Input 
                    id="reg-email"
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
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="reg-password">Password</label>
                  <div className="relative">
                    <Input 
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      placeholder="Create a strong password" 
                      className="bg-background/60 h-11 pr-10 focus:shadow-lg focus:shadow-primary/10"
                      minLength={6}
                      autoComplete="new-password"
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

                  {/* Password strength indicator */}
                  {password && (
                    <div className="space-y-2 animate-fade-in pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3, 4].map(i => (
                            <div 
                              key={i} 
                              className={cn(
                                'h-1 flex-1 rounded-full transition-all duration-500',
                                i <= strength.checks ? strength.barColor : 'bg-muted'
                              )} 
                            />
                          ))}
                        </div>
                        <span className={cn('text-[10px] font-bold shrink-0', strength.color)}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {passwordRules.map((rule, i) => (
                          <span key={i} className={cn(
                            'text-[10px] flex items-center gap-1 transition-colors font-medium',
                            rule.met ? 'text-emerald-500' : 'text-muted-foreground/50'
                          )}>
                            <Check className={cn('w-2.5 h-2.5', rule.met ? 'opacity-100' : 'opacity-30')} />
                            {rule.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                      <UserPlus className="w-4 h-4" />
                      Create account
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4 pb-7 border-t border-border/40 px-6 sm:px-8 mt-2">
              <div className="text-xs sm:text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4 transition-colors">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>

          <p className="text-center text-[10px] text-muted-foreground/40 mt-5 lg:hidden">
            By signing up, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};
