import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Loader2, Mail, ArrowRight, Key, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(true);
      // Retrieve simulation data if returned in response for development
      if (res.data.token) {
        setResetToken(res.data.token);
      }
    } catch (err: unknown) {
      let errorMessage = 'Could not request password reset';
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
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-center">Reset your password</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              We'll send you instructions to reset your password
            </p>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pt-4 pb-2">
            {success ? (
              <div className="space-y-4 py-2">
                <div className="p-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col items-center gap-3 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Reset Request Sent!</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Check your email for the reset instructions.
                    </p>
                  </div>
                </div>

                {/* Development environment Simulation Block */}
                {resetToken && (
                  <div className="p-3 text-xs text-violet-600 dark:text-violet-400 bg-violet-500/10 rounded-xl border border-violet-500/20 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Key className="w-3.5 h-3.5" />
                      <span>Local Development Mode</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      No SMTP mail server is configured. Use this generated link to reset the password:
                    </p>
                    <Link
                      to={`/reset-password/${resetToken}`}
                      className="inline-flex w-full justify-center items-center gap-1 py-1.5 px-3 bg-primary text-white rounded-lg hover:bg-primary/95 transition-colors font-bold text-center mt-1"
                    >
                      Reset Password Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
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

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold leading-none" htmlFor="forgot-email">
                    Email address
                  </label>
                  <div className="relative">
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      className="bg-background/60 h-11 pl-10 focus:shadow-lg focus:shadow-primary/10"
                      autoComplete="email"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                      <span>Send reset instructions</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4 pb-7 border-t border-border/40 px-6 sm:px-8 mt-4">
            <div className="text-xs sm:text-sm text-center text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4 transition-colors">
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
