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
  logout: () => Promise<void>;
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
  SESSION: 'gym_session_v2',
  PROFILE: (uid: string) => `gym_profile_v2_${uid}`
} as const;

// Type guards with proper error logging
const isValidGoal = (goal: unknown): goal is 'weight_loss' | 'muscle_gain' => {
  const isValid = goal === 'weight_loss' || goal === 'muscle_gain';
  if (!isValid) console.warn(`Invalid goal value: ${goal}`);
  return isValid;
};

const isValidRole = (role: unknown): role is 'user' | 'admin' => {
  const isValid = role === 'user' || role === 'admin';
  if (!isValid) console.warn(`Invalid role value: ${role}`);
  return isValid;
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
  const [isMounted, setIsMounted] = useState(true);

  // Enhanced profile loader with offline support
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      // 1. Try network fetch
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // 2. Validate and transform data
      const profile: UserProfile = {
        id: data.id,
        name: data.name || 'Anonymous',
        goal: isValidGoal(data.goal) ? data.goal : 'weight_loss',
        role: isValidRole(data.role) ? data.role : 'user',
        membership_expiry: data.membership_expiry || new Date().toISOString(),
        start_date: data.start_date || new Date().toISOString(),
        subscription_plan: data.subscription_plan,
        payment_method: data.payment_method,
      };

      // 3. Cache the profile
      localStorage.setItem(STORAGE_KEYS.PROFILE(userId), JSON.stringify(profile));
      return profile;

    } catch (error) {
      console.error('Profile load error:', error);
      
      // 4. Fallback to cached profile
      const cached = localStorage.getItem(STORAGE_KEYS.PROFILE(userId));
      return cached ? JSON.parse(cached) : null;
    }
  }, []);

  // Unified auth state handler
  const updateAuthState = useCallback(async (newSession: Session | null) => {
    if (!isMounted) return;

    try {
      setSession(newSession);
      
      if (newSession?.user) {
        // 1. Cache session
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
        
        // 2. Load profile (network + cache fallback)
        const profile = await loadUserProfile(newSession.user.id);
        setUser(profile);
      } else {
        // 3. Clear auth state
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        if (user) localStorage.removeItem(STORAGE_KEYS.PROFILE(user.id));
        setUser(null);
      }
    } catch (error) {
      console.error('Auth state update error:', error);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [isMounted, loadUserProfile, user]);

  // Initialize auth state
  useEffect(() => {
    setIsMounted(true);

    const initAuth = async () => {
      try {
        // 1. Check for cached session
        const cachedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
        if (cachedSession) {
          updateAuthState(JSON.parse(cachedSession));
        }

        // 2. Validate with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        await updateAuthState(session);
      } catch (error) {
        console.error('Auth init error:', error);
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // 3. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(updateAuthState);

    return () => {
      setIsMounted(false);
      subscription?.unsubscribe();
    };
  }, [updateAuthState, isMounted]);

  // Login with error boundary
  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return !error;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  // Registration with profile creation
  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    goal: 'weight_loss' | 'muscle_gain';
    subscription_plan: string;
  }) => {
    try {
      // 1. Create auth account
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

      if (error || !data.user) return false;

      // 2. Create user profile
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
        .insert(profileData);

      return !insertError;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }, []);

  // Logout with cleanup
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      if (user) localStorage.removeItem(STORAGE_KEYS.PROFILE(user.id));
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [user]);

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
