import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, useCallback, useEffect, useState, useRef } from 'react';
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
  
  const validSessionRef = useRef<string | null>(null);
  
  const validateSessionIntegrity = useCallback(async () => {
    try {

      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      const storedSession = window.sessionStorage.getItem('supabase.auth.token');
      
      if (storedSession && validSessionRef.current && storedSession !== validSessionRef.current) {
        console.error('Session storage tampering detected');
        await logout();
        setError('Security violation detected. Please login again.');
        return false;
      }
      
      if (currentSession?.access_token) {
        validSessionRef.current = currentSession.access_token;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating session integrity:', error);
      return false;
    }
  }, []);

  const login = async (name: string, role: string, latitude: number, longitude: number) => {
    setIsLoading(true);
    try {
      const { session, error } = await signInUser(name, role, latitude, longitude);
      if (error) throw error;
      
      if (session?.access_token) {
        validSessionRef.current = session.access_token;
      }
      
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
      validSessionRef.current = null;
      
      window.sessionStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout');
    }
  };

  const handleAuthStateChange = useCallback(async (_event: string, newSession: Session | null) => {
    const isValid = await validateSessionIntegrity();
    if (isValid) {
      setSession(newSession);
    } else {
      await logout();
    }
  }, [validateSessionIntegrity]);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
          setError('Failed to get initial session');
        } else {
          if (initialSession?.access_token) {
            validSessionRef.current = initialSession.access_token;
          }
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

    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key && event.key.includes('supabase.auth')) {
        const isValid = await validateSessionIntegrity();
        if (!isValid) {
          await logout();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const validationInterval = setInterval(validateSessionIntegrity, 30000); // Check every 30 seconds

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(validationInterval);
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, validateSessionIntegrity]);

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