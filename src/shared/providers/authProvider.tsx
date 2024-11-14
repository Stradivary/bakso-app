import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Database } from '../models/supabase';
import { signInUser } from '../services/authService';
import { supabase } from '../services/supabaseService';
import { AuthContext } from '../hooks/useAuth';

type UserDetails = Database['public']['Tables']['user_profiles']['Row'];

export interface AuthContextType {
  session: Session | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  error: string | null;
  login: (name: string, role: string, latitude: number, longitude: number) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (name: string, role: string, latitude: number, longitude: number) => {
    setIsLoading(true);
    try {
      const { session, error } = await signInUser(name, role, latitude, longitude);
      if (error) throw error;
      setSession(session);
      setError(null);
    } catch (error) {
      console.error('Error during login:', error);
      setError('Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setError(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout');
    }
  };

  const handleAuthStateChange = useCallback((_event: string, newSession: Session | null) => {
    setSession(newSession);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
          setError('Failed to get initial session');
        } else {
          setSession(initialSession);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setError('Failed to get initial session');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider value={{
      session,
      userDetails: null,
      isLoading,
      error,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
