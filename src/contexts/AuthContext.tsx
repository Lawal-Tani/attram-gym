import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  goal: 'weight_loss' | 'muscle_gain' | 'endurance';
  role: 'user' | 'admin';
  membership_expiry: string;
  start_date: string;
  subscription_plan?: string;
  payment_method?: string;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  equipment_access?: string[];
  limitations?: string[];
  injuries?: string;
  experience_years?: number;
  workout_frequency?: string;
  preferred_duration?: string;
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
    goal: 'weight_loss' | 'muscle_gain' | 'endurance';
    subscription_plan: string;
    fitness_level: 'beginner' | 'intermediate' | 'advanced';
  }) => Promise<boolean>;
  loading: boolean;
  authChecked: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('AuthProvider render - authChecked:', authChecked, 'loading:', loading, 'user:', !!user);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        return null;
      }

      if (profile) {
        const validatedProfile: UserProfile = {
          id: profile.id,
          name: profile.name || 'Anonymous',
          goal: profile.goal === 'muscle_gain' ? 'muscle_gain' : profile.goal === 'endurance' ? 'endurance' : 'weight_loss',
          role: profile.role === 'admin' ? 'admin' : 'user',
          membership_expiry: profile.membership_expiry || new Date().toISOString(),
          start_date: profile.start_date || new Date().toISOString(),
          subscription_plan: profile.subscription_plan || 'basic',
          payment_method: profile.payment_method || 'none',
          fitness_level: (profile.fitness_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
          equipment_access: profile.equipment_access || [],
          limitations: profile.limitations || [],
          injuries: profile.injuries || '',
          experience_years: profile.experience_years || 0,
          workout_frequency: profile.workout_frequency || '3-4',
          preferred_duration: profile.preferred_duration || '30-45',
        };
        console.log('User profile fetched successfully:', validatedProfile);
        return validatedProfile;
      }
      return null;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  const updateAuthState = useCallback(async (newSession: Session | null) => {
    console.log('Updating auth state with session:', !!newSession);
    setSession(newSession);
    
    if (newSession?.user) {
      const profile = await fetchUserProfile(newSession.user.id);
      setUser(profile);
    } else {
      setUser(null);
    }
    
    setAuthChecked(true);
    console.log('Auth state updated - user:', !!newSession?.user);
  }, [fetchUserProfile]);

  const refreshUser = useCallback(async () => {
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      setUser(profile);
    }
  }, [session, fetchUserProfile]);

  useEffect(() => {
    console.log('AuthProvider useEffect starting');
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get initial session
        console.log('Getting initial session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (isMounted) {
          console.log('Initial session retrieved:', !!session);
          await updateAuthState(session);
        }

        // Set up auth state listener
        console.log('Setting up auth state listener...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change event:', event, 'session:', !!session);
          if (isMounted) {
            await updateAuthState(session);
          }
        });

        return () => {
          console.log('Cleaning up auth subscription');
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Auth initialization failed');
          setAuthChecked(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();

    return () => {
      console.log('AuthProvider cleanup');
      isMounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, []); // Removed updateAuthState from dependencies to break circular dependency

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login for:', email);
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Login error:', authError);
        throw authError;
      }

      console.log('Login successful');
      return true;
    } catch (err) {
      console.error('Login failed:', err);
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
    goal: 'weight_loss' | 'muscle_gain' | 'endurance';
    subscription_plan: string;
    fitness_level: 'beginner' | 'intermediate' | 'advanced';
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting registration for:', userData.email);

      // Create auth user
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            goal: userData.goal,
            subscription_plan: userData.subscription_plan,
            fitness_level: userData.fitness_level
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
          subscription_plan: userData.subscription_plan,
          fitness_level: userData.fitness_level
        }]);

      if (profileError) throw profileError;

      console.log('Registration successful');
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
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
      console.log('Attempting logout');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout failed:', err);
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
    authChecked,
    error,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
