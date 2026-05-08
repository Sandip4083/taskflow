import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { LogOut, Sun, Moon, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className="border-b border-border/50 bg-card/80 backdrop-blur-xl text-card-foreground sticky top-0 z-40 shadow-sm">
      <div className="px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: space for hamburger + logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Spacer for the hamburger button — only when logged in */}
          {!isAuthPage && <div className="w-8 sm:w-9" />}
          <div 
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group" 
            onClick={() => navigate('/')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight">
              TaskFlow
            </span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-indigo-500" />
            )}
          </Button>
          {user && !isAuthPage && (
            <div className="flex items-center gap-1.5 sm:gap-3 ml-1 sm:ml-2">
              <div className="hidden sm:flex items-center gap-2.5 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <Avatar fallback={user.name} size="sm" className="h-6 w-6 text-[9px]" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              {/* Mobile: just show avatar */}
              <div className="flex sm:hidden">
                <Avatar fallback={user.name} size="sm" className="h-7 w-7 text-[10px]" />
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={logout}
                className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
