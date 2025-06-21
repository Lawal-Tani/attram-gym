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

const CACHE_KEYS = {
  SESSION: 'pwa_session',
  PROFILE: (uid: string) => `pwa_profile_${uid}`
};

// Helper to check goal type safely
const isValidGoal = (goal: any): goal is 'weight_loss' | 'muscle_gain' => {
  return goal === 'weight_loss' || goal === 'muscle_gain';
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
        // Try to load from cache on error
        const cached = localStorage.getItem(CACHE_KEYS.PROFILE(userId));
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch (parseError) {
            console.error('Error parsing cached profile:', parseError);
          }
        }
      } else if (profile) {
        const typedProfile: UserProfile = {
          ...profile,
          goal: isValidGoal(profile.goal) ? profile.goal : 'weight_loss',
          role: profile.role === 'admin' ? 'admin' : 'user'
        };
        localStorage.setItem(CACHE_KEYS.PROFILE(userId), JSON.stringify(typedProfile));
        setUser(typedProfile);
      }
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      // Try to load from cache on unexpected error
      const cached = localStorage.getItem(CACHE_KEYS.PROFILE(userId));
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (parseError) {
          console.error('Error parsing cached profile:', parseError);
        }
      }
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
      setLoading(true);
      try {
        // First try to get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Fallback to cached session if available
          const cachedSession = localStorage.getItem(CACHE_KEYS.SESSION);
          if (cachedSession) {
            try {
              const parsedSession = JSON.parse(cachedSession);
              await handleSessionChange(parsedSession);
            } catch (parseError) {
              console.error('Error parsing cached session:', parseError);
              localStorage.removeItem(CACHE_KEYS.SESSION);
              await handleSessionChange(null);
            }
          } else {
            await handleSessionChange(null);
          }
        } else {
          await handleSessionChange(session);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        await handleSessionChange(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      return !!data.user;
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
            subscription_plan: userData.subscription_plan,
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error.message);
        return false;
      }

      if (data?.user) {
        // Insert new profile row into users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            name: userData.name,
            goal: userData.goal,
            role: 'user',
            start_date: new Date().toISOString(),
            membership_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_plan: userData.subscription_plan,
          }]);

        if (insertError) {
          console.error('Insert profile error:', insertError.message);
          return false;
        }

        return true;
      }

      return false;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem(CACHE_KEYS.SESSION);
      if (user) localStorage.removeItem(CACHE_KEYS.PROFILE(user.id));
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
