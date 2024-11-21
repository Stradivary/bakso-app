import { Database } from "@/data/models/supabase.types";
import { signInUser } from "@/domain/services/authService";
import { supabase } from "@/domain/services/supabaseService";
import { notifications } from "@mantine/notifications";
import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError("Failed to fetch user profile");
    }
  }, []);

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
          console.error("failed to set session, log in again");
          throw sessionError;
        }

        if (existingSession) {
          setSession(existingSession);
          await fetchUserProfile(existingSession.user.id);
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
  }, [fetchUserProfile]);
  const login = useCallback(
    async (name: string, role: string, latitude: number, longitude: number) => {
     
      try {
        setIsLoading(true);
        const { session: newSession, error: signInError } = await signInUser(
          name,
          role,
          latitude,
          longitude,
        );
        if (signInError) throw signInError;

        setSession(newSession);
        if (newSession) {
          await fetchUserProfile(newSession.user.id);
        }
        setError(null);
      } catch (error) {
        console.error("Error during login:", error);
        setError("Failed to login");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserProfile],
  );

  const logout = useCallback(async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) throw signOutError;
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Failed to logout");
    }
  }, []);

  // Storage change observer
  useEffect(() => {
    if (!initialized) return;

    const handleStorageChange = (event: StorageEvent) => {
      const currentSession = event.newValue;
      const previousSession = event.oldValue;

      if (event.key === "abangbakso-session") {
        if (!previousSession) {
          notifications.show({
            title: "Warning",
            message: "Possible session injection detected",
            color: "orange",
          });
          logout();
          setError("Session security violation detected");
          return;
        }

        if (!currentSession) {
          notifications.show({
            title: "Warning",
            message: "Possible session removal detected",
            color: "orange",
          });
          logout();
          setError("Session security violation detected");
          return;
        }
        // If session was changed externally
        if (currentSession !== previousSession) {
          notifications.show({
            title: "Warning",
            message: "Possible session tampering detected",
            color: "orange",
          });
          logout();
          setError("Session security violation detected");
        }
      }
    };

    // Add storage event listener
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [initialized, logout, session?.user.id]);

  useEffect(() => {
    if (!initialized) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => { 

      if (!newSession?.user.id) return;
      if ((newSession?.user.id && newSession?.user.id) && newSession?.user.id !== session?.user.id) {
        return;
      }
      switch (event) {
        case "INITIAL_SESSION":
          break;
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
        case "USER_UPDATED":
          setSession(newSession);
          if (newSession) {
            await fetchUserProfile(newSession.user.id);
          }
          break;
        case "SIGNED_OUT":
          setSession(null);
          setUser(null);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, fetchUserProfile]);

  const isAuthenticated = !!session?.user?.id && !isLoading;

  const values = useMemo(
    () => ({
      session,
      user,
      isLoading,
      error,
      login,
      logout,
      isAuthenticated,
    }),
    [session, user, isLoading, error, login, logout, isAuthenticated],
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
