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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile && !error) {
        console.log('User profile loaded:', profile);
        setUser({
          id: profile.id,
          name: profile.name,
          goal: profile.goal,
          role: profile.role,
          membership_expiry: profile.membership_expiry || '',
          start_date: profile.start_date || '',
          subscription_plan: profile.subscription_plan || 'basic',
          payment_method: profile.payment_method || 'none'
        });
      } else {
        console.error('Error fetching user profile:', error);
        setUser(null);
      }
    } catch (err) {
      console.error('Error in profile fetch:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session:', session?.user?.email || 'No session');
          setSession(session);

          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No session');
        setSession(session);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No session, clearing user');
          setUser(null);
        }

        // ✅ Always stop loading after session is handled
        console.log('Auth state change - setting loading to false');
        setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      console.log('AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt for:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error);
        return false;
      }
      console.log('Login successful');
      return true;
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
  }): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
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

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
