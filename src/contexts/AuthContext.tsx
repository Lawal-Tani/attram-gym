import React, { createContext, useContext, useState, useEffect } from 'react';
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
  register: (userData: { name: string; email: string; password: string; goal: 'weight_loss' | 'muscle_gain'; subscription_plan: string }) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_KEYS = {
  SESSION: 'pwa_session',
  PROFILE: (uid: string) => `pwa_profile_${uid}`
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
  const [isFetching, setIsFetching] = useState(false);

  // ✅ FIXED: fetchUserProfile with proper try/catch
  const fetchUserProfile = async (userId: string) => {
    if (isFetching) return;
    setIsFetching(true);

    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Supabase error fetching profile:', error.message);
        const cached = localStorage.getItem(CACHE_KEYS.PROFILE(userId));
        if (cached) setUser(JSON.parse(cached));
      } else if (profile) {
        localStorage.setItem(CACHE_KEYS.PROFILE(userId), JSON.stringify(profile));
        setUser(profile);
      }
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      const cached = localStorage.getItem(CACHE_KEYS.PROFILE(userId));
      if (cached) setUser(JSON.parse(cached));
    } finally {
      setIsFetching(false);
    }
  };

  const handleSessionChange = async (session: Session | null) => {
    setSession(session);
    if (session?.user) {
      localStorage.setItem(CACHE_KEYS.SESSION, JSON.stringify(session));
      await fetchUserProfile(session.user.id);
    } else {
      localStorage.removeItem(CACHE_KEYS.SESSION);
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const cachedSession = localStorage.getItem(CACHE_KEYS.SESSION);
      if (cachedSession) {
        handleSessionChange(JSON.parse(cachedSession));
      }

      const { data: { session } } = await supabase.auth.getSession();
      handleSessionChange(session);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        handleSessionChange(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return !error;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    goal: 'weight_loss' | 'muscle_gain';
    subscription_plan: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
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

      if (data?.user) {
        localStorage.setItem(CACHE_KEYS.SESSION, JSON.stringify(data.session));
      }
      return !error;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(CACHE_KEYS.SESSION);
    if (user) localStorage.removeItem(CACHE_KEYS.PROFILE(user.id));
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
