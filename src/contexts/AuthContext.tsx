import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  goal: 'weight_loss' | 'muscle_gain';
  role: 'user' | 'admin';
  membership_expiry: string;
  start_date: string;
  subscription_plan?: string;
  payment_method?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    goal: 'weight_loss' | 'muscle_gain';
    subscription_plan: string;
  }) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSION: 'gym_session',
  PROFILE: (uid: string) => `gym_profile_${uid}`
} as const;

const isValidGoal = (goal: unknown): goal is 'weight_loss' | 'muscle_gain' => {
  return goal === 'weight_loss' || goal === 'muscle_gain';
};

const isValidRole = (role: unknown): role is 'user' | 'admin' => {
  return role === 'user' || role === 'admin';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Loading user profile for:', userId);
      
      const response = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (response.error) {
        console.error('Database error:', response.error);
        return null;
      }

      if (!response.data || response.data.length === 0) {
        console.warn('No user profile found');
        return null;
      }

      const profileData = response.data[0];
      const profile: UserProfile = {
        id: profileData.id,
        name: profileData.name || '',
        goal: isValidGoal(profileData.goal) ? profileData.goal : 'weight_loss',
        role: isValidRole(profileData.role) ? profileData.role : 'user',
        membership_expiry: profileData.membership_expiry || '',
        start_date: profileData.start_date || '',
        subscription_plan: profileData.subscription_plan,
        payment_method: profileData.payment_method,
      };

      console.log('Profile loaded successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (newSession: Session | null) => {
    console.log('Updating auth state, session exists:', !!newSession);
    
    setSession(newSession);
    
    if (newSession?.user) {
      try {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
        const profile = await loadUserProfile(newSession.user.id);
        if (profile) {
          localStorage.setItem(STORAGE_KEYS.PROFILE(newSession.user.id), JSON.stringify(profile));
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error updating auth state:', error);
        setUser(null);
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      if (user) {
        localStorage.removeItem(STORAGE_KEYS.PROFILE(user.id));
      }
      setUser(null);
    }
    
    setLoading(false);
  }, [loadUserProfile, user]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          await updateAuthState(data.session);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        if (mounted) {
          await updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error.message);
        return false;
      }

      console.log('Login successful');
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    goal: 'weight_loss' | 'muscle_gain';
    subscription_plan: string;
  }): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', userData.email);

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            goal: userData.goal,
            subscription_plan: userData.subscription_plan,
          }
        }
      });

      if (error) {
        console.error('Registration failed:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('No user returned from registration');
        return false;
      }

      console.log('User registered, creating profile...');

      const profileData = {
        id: data.user.id,
        name: userData.name,
        goal: userData.goal,
        role: 'user' as const,
        start_date: new Date().toISOString(),
        membership_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_plan: userData.subscription_plan,
      };

      const { error: insertError } = await supabase
        .from('users')
        .insert([profileData]);

      if (insertError) {
        console.error('Profile creation failed:', insertError.message);
        return false;
      }

      console.log('Registration completed successfully');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out...');
      
      await supabase.auth.signOut();
      
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      if (user) {
        localStorage.removeItem(STORAGE_KEYS.PROFILE(user.id));
      }
      
      setUser(null);
      setSession(null);
      
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
