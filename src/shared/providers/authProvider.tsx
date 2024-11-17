import { Session } from "@supabase/supabase-js";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "../hooks/useAuth";
import { Database } from "../models/supabase.types";
import { signInUser } from "../services/authService";
import { supabase } from "../services/supabaseService";

type UserDetails = Database["public"]["Tables"]["user_profiles"]["Row"];

export interface AuthContextType {
  session: Session | null;
  user: UserDetails | null;
  isLoading: boolean;
  error: string | null;
  login: (
    name: string,
    role: string,
    latitude: number,
    longitude: number,
  ) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const {
          data: { session: existingSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("failed to set session", existingSession);
          throw sessionError;
        }

        if (existingSession) {
          console.log("existingSession -> set to", existingSession);
          setSession(existingSession);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError("Failed to initialize authentication");
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (name: string, role: string, latitude: number, longitude: number) => {
      setIsLoading(true);
      try {
        const { session: newSession, error: signInError } = await signInUser(
          name,
          role,
          latitude,
          longitude,
        );
        if (signInError) throw signInError;

        setSession(newSession);
        setError(null);
      } catch (error) {
        console.error("Error during login:", error);
        setError("Failed to login");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) throw signOutError;

      setSession(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Failed to logout");
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", newSession?.user?.id, event);

      switch (event) {
        case "INITIAL_SESSION":
          break;
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          setSession(newSession);
          break;
        case "SIGNED_OUT":
          setSession(null);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const isAuthenticated = !!session?.user;

  const values = useMemo(
    () => ({
      session,
      user: null,
      isLoading,
      error,
      login,
      logout,
      isAuthenticated,
    }),
    [session, isLoading, error, login, logout, isAuthenticated],
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
