import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loader2, KeyRound, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      let errorMessage = 'Failed to reset password. The link may be invalid or expired.';
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object') {
          const msg = (errorData as Record<string, unknown>).message || (errorData as Record<string, unknown>).error;
          if (typeof msg === 'string') {
            errorMessage = msg;
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
    if (!password) return { label: '', color: '', widthClass: 'w-0' };
    let checks = 0;
    if (password.length >= 6) checks++;
    if (password.length >= 8) checks++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) checks++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) checks++;
    
    if (checks <= 1) return { label: 'Weak', color: 'bg-red-500', widthClass: 'w-1/4' };
    if (checks === 2) return { label: 'Fair', color: 'bg-amber-500', widthClass: 'w-1/2' };
    if (checks === 3) return { label: 'Good', color: 'bg-blue-500', widthClass: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', widthClass: 'w-full' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-violet-500/6 rounded-full blur-[120px] animate-float delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/4 rounded-full blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.02] auth-dot-grid" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] mx-auto px-4 sm:px-6 animate-fade-in-up">
        <Card className="border-border/50 shadow-2xl shadow-black/10 bg-card/90 backdrop-blur-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-blue-500" />
          <CardHeader className="space-y-1.5 pb-2 pt-7 px-6 sm:px-8">
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-center">Reset password</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Please enter your new password below
            </p>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pt-4 pb-7">
            {success ? (
              <div className="space-y-4 py-2">
                <div className="p-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col items-center gap-3 text-center animate-fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Password Reset Successfully!</h3>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Redirecting you to the sign-in page in a few seconds...
                    </p>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="inline-flex w-full justify-center items-center gap-1.5 py-2.5 px-4 bg-primary text-white rounded-xl hover:bg-primary/95 transition-colors font-bold text-center"
                >
                  Go to Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Error alert */}
                {error && (
                  <div 
                    className="p-3 text-xs sm:text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20 animate-fade-in flex items-start gap-2.5"
                    role="alert"
                  >
                    <ShieldAlert className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="reset-password">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-background/60 h-11 pr-10 focus:shadow-lg focus:shadow-primary/10"
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

                  {/* Password strength bar */}
                  {password && (
                    <div className="space-y-1 pt-1">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strength.color} ${strength.widthClass} transition-all duration-300`} 
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span className="font-semibold">{strength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="reset-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-background/60 h-11 pr-10 focus:shadow-lg focus:shadow-primary/10"
                      autoComplete="new-password"
                    />
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/0 w-0 h-0" />
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
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
