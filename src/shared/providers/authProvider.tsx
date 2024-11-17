import { Session } from "@supabase/supabase-js";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Database } from "../models/supabase.types";
import { signInUser } from "../services/authService";
import { supabase } from "../services/supabaseService";
import { AuthContext } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const login = useCallback(
    async (name: string, role: string, latitude: number, longitude: number) => {
      setIsLoading(true);
      try {
        const { session, error } = await signInUser(
          name,
          role,
          latitude,
          longitude,
        );
        if (error) throw error;

        setSession(session);
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
      setSession(null);
      await supabase.auth.signOut({
        scope: "local",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Failed to logout");
    }
  }, [navigate]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: Session | null) => {
        if (event === "SIGNED_IN") {
          if (newSession?.user.id === session?.user.id) setSession(newSession);
        }
        if (event === "SIGNED_OUT") {
          if (newSession?.user.id === session?.user.id) {
            await supabase.auth.signOut({
              scope: "local",
            });

            setSession(null);
          }
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [session?.user.id]);

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
