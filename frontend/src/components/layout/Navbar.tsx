import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="border-b bg-card text-card-foreground sticky top-0 z-40">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left: space for hamburger + logo */}
        <div className="flex items-center gap-3">
          {/* Spacer for the hamburger button (40px) */}
          <div className="w-9" />
          <div className="font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate('/')}>
            TaskFlow
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium hidden sm:inline">Hello, {user.name}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
