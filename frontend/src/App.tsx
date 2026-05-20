import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { queryClient } from './lib/react-query';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/CommandPalette';

// Lazy load all page components for code splitting & faster initial load
const Login = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const ProjectList = React.lazy(() => import('./pages/ProjectList').then(m => ({ default: m.ProjectList })));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const CalendarView = React.lazy(() => import('./pages/CalendarView').then(m => ({ default: m.CalendarView })));
const Settings = React.lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Minimal loading spinner for Suspense fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-xs text-muted-foreground/60 font-medium">Loading...</span>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <CommandPalette />
                  <Sidebar />
                  <main className="flex-1 overflow-y-auto bg-muted/20">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<ProjectList />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/calendar" element={<CalendarView />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </Suspense>
                  </main>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
            <Toaster position="bottom-right" richColors closeButton />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
