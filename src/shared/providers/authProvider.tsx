import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, useCallback, useEffect, useState, useRef, useMemo } from 'react';
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

  const login =  useCallback(async (name: string, role: string, latitude: number, longitude: number) => {
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setError(null);
      validSessionRef.current = null;
      const hashedKey = window.sessionStorage.getItem('supabase.auth.key');
      if (hashedKey) {
        window.sessionStorage.removeItem(hashedKey);
      }
      window.sessionStorage.removeItem('supabase.auth.key');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout');
    }
  }, []);

  const validateSessionIntegrity = useCallback(async () => {
    try {

      const hashedKey = window.sessionStorage.getItem('supabase.auth.key');

      if (!hashedKey) {
        console.error('Session key missing.');
        setError('Session key missing. Please login again.');
        await logout();
        return false;
      }


      const storedSession = window.sessionStorage.getItem(hashedKey);

      if (!storedSession) {
        console.error('Session token not found.');
        setError('Session token not found. Please login again.');
        await logout();
        return false;
      }

      const parsedSession = JSON.parse(storedSession);
      const { access_token } = parsedSession;

      if (!access_token) {
        console.error('Invalid session token structure.');
        setError('Invalid session token. Please login again.');
        await logout();
        return false;
      }

      if (validSessionRef.current && access_token !== validSessionRef.current) {
        console.error('Session storage tampering detected.');
        setError('Security violation detected. Please login again.');
        await logout();
        return false;
      }

      validSessionRef.current = access_token;

      return true;
    } catch (error) {
      console.error('Error validating session integrity:', error);
      setError('Error validating session integrity. Please login again.');
      await logout();
      return false;
    }
  }, [logout]);


  const handleAuthStateChange = useCallback(async (_event: string, newSession: Session | null) => {
    const isValid = await validateSessionIntegrity();
    if (isValid) {
      setSession(newSession);
    } else {
      await logout();
    }
  }, [validateSessionIntegrity, logout]);

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
      if (event.key && event.key.includes('supabase-auth-token')) {
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
  }, [handleAuthStateChange, validateSessionIntegrity, logout]);

  const isAuthenticated = !!session;

  const values = useMemo(()=> ({
    session,
    userDetails: null,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated
  }), [
    session,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated])

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  );
};