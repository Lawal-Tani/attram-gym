
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Home, Target, User, Settings, LogOut } from 'lucide-react';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold text-gray-800">Attram Gym</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link 
              to="/workout-plan" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/workout-plan') 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <Target className="h-4 w-4" />
              <span>Workout</span>
            </Link>

            <Link 
              to="/profile" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile') 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'text-gray-600 hover:text-emerald-600'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>

            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
                <Badge variant="secondary" className="text-xs">ADMIN</Badge>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.goal?.replace('_', ' ')} • {user?.role}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="flex justify-around py-2">
          <Link 
            to="/dashboard"
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              isActive('/dashboard') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <Home className="h-5 w-5 mb-1" />
            <span>Home</span>
          </Link>
          <Link 
            to="/workout-plan"
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              isActive('/workout-plan') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <Target className="h-5 w-5 mb-1" />
            <span>Workout</span>
          </Link>
          <Link 
            to="/profile"
            className={`flex flex-col items-center py-2 px-4 text-xs ${
              isActive('/profile') ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <User className="h-5 w-5 mb-1" />
            <span>Profile</span>
          </Link>
          {user?.role === 'admin' && (
            <Link 
              to="/admin"
              className={`flex flex-col items-center py-2 px-4 text-xs ${
                isActive('/admin') ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Settings className="h-5 w-5 mb-1" />
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
