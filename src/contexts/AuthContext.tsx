import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
  logout: () => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    goal: 'weight_loss' | 'muscle_gain';
    subscription_plan: string;
  }) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSION: 'gym_session_v3',
  PROFILE: (uid: string) => `gym_profile_v3_${uid}`
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeUpdateAuthState = useCallback(async (newSession: Session | null) => {
    try {
      setSession(newSession);
      
      if (newSession?.user) {
        // Fetch user profile with proper error handling
        const { data: profile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', newSession.user.id)
          .single();

        if (fetchError) throw fetchError;

        if (profile) {
          const validatedProfile: UserProfile = {
            id: profile.id,
            name: profile.name || 'Anonymous',
            goal: profile.goal === 'muscle_gain' ? 'muscle_gain' : 'weight_loss',
            role: profile.role === 'admin' ? 'admin' : 'user',
            membership_expiry: profile.membership_expiry || new Date().toISOString(),
            start_date: profile.start_date || new Date().toISOString(),
            subscription_plan: profile.subscription_plan,
            payment_method: profile.payment_method
          };
          setUser(validatedProfile);
          localStorage.setItem(STORAGE_KEYS.PROFILE(newSession.user.id), JSON.stringify(validatedProfile));
        }
      } else {
        if (user) {
          localStorage.removeItem(STORAGE_KEYS.PROFILE(user.id));
        }
        setUser(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update auth state');
      console.error('Auth state update error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        if (!isMounted) return;

        await safeUpdateAuthState(session);
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
          if (isMounted) {
            await safeUpdateAuthState(session);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Initialization failed');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [safeUpdateAuthState]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    goal: 'weight_loss' | 'muscle_gain';
    subscription_plan: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Create auth user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            goal: userData.goal,
            subscription_plan: userData.subscription_plan
          }
        }
      });

      if (authError) throw authError;
      if (!user) throw new Error('User creation failed');

      // Create profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          name: userData.name,
          goal: userData.goal,
          role: 'user',
          start_date: new Date().toISOString(),
          membership_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_plan: userData.subscription_plan
        }]);

      if (profileError) throw profileError;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    login,
    logout,
    register,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
