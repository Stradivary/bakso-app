import { PropsWithChildren, useEffect, useState } from "react";
import { User } from "../models/user.types";
import { AuthContext } from "../contexts/useAuth";


export function AuthProvider({ children }: Readonly<PropsWithChildren>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // watch user from session storage

    const userFromSession = sessionStorage.getItem("user");
    if (userFromSession) {
      setUser(JSON.parse(userFromSession));
    }

    // create storage watcher
    const storageListener = (e: StorageEvent) => {
      if (e.key === "user") {
        setUser(JSON.parse(e.newValue!));
      }
    };

    window.addEventListener("storage", storageListener);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
