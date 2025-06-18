
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Home, Target, User, Settings, LogOut, Moon, Sun, BarChart3 } from 'lucide-react';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Check if dark mode is already enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm shadow-lg border-t border-border z-50">
      {/* Mobile Navigation - Always visible on mobile */}
      <div className="md:hidden">
        <div className="flex justify-around py-2">
          <Link 
            to="/dashboard"
            className={`flex flex-col items-center py-1 px-2 text-xs transition-colors ${
              isActive('/dashboard') ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <Home className="h-4 w-4 mb-1" />
            <span>Home</span>
          </Link>
          <Link 
            to="/workout-plan"
            className={`flex flex-col items-center py-1 px-2 text-xs transition-colors ${
              isActive('/workout-plan') ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <Target className="h-4 w-4 mb-1" />
            <span>Workout</span>
          </Link>
          <Link 
            to="/progress"
            className={`flex flex-col items-center py-1 px-2 text-xs transition-colors ${
              isActive('/progress') ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4 mb-1" />
            <span>Progress</span>
          </Link>
          <Link 
            to="/profile"
            className={`flex flex-col items-center py-1 px-2 text-xs transition-colors ${
              isActive('/profile') ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            <User className="h-4 w-4 mb-1" />
            <span>Profile</span>
          </Link>
          {user?.role === 'admin' && (
            <Link 
              to="/admin"
              className={`flex flex-col items-center py-1 px-2 text-xs transition-colors ${
                isActive('/admin') ? 'text-blue-600' : 'text-muted-foreground'
              }`}
            >
              <Settings className="h-4 w-4 mb-1" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-emerald-500" />
              <span className="text-lg font-bold text-foreground">Attram Gym</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                    : 'text-muted-foreground hover:text-emerald-600'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link 
                to="/workout-plan" 
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive('/workout-plan') 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                    : 'text-muted-foreground hover:text-emerald-600'
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Workout</span>
              </Link>

              <Link 
                to="/progress" 
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive('/progress') 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                    : 'text-muted-foreground hover:text-emerald-600'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Progress</span>
              </Link>

              <Link 
                to="/profile" 
                className={`flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profile') 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' 
                    : 'text-muted-foreground hover:text-emerald-600'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>

              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center space-x-2 px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'text-muted-foreground hover:text-blue-600'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                  <Badge variant="secondary" className="text-xs">ADMIN</Badge>
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleDarkMode}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.goal?.replace('_', ' ')} • {user?.role}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-muted-foreground hover:text-red-600 p-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
