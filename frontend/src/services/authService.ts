
import { createContext, useContext } from 'react';
import { User } from '../models/user';
import { supabase } from './supabaseService';

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const authService = {
  registerOrLogin: async (
    name: string,
    role: 'customer' | 'seller',
    location: { latitude: number; longitude: number; }
  ): Promise<User> => {
    const email = `${name.replace(/\s/g, '').toLowerCase()}@${role}.com`;
    const password = 'abangBakso123';

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users_new')
      .select('*')
      .eq('email', email)
      .single();

    let existingUserData = {
      id: existingUser?.id ?? "", email, name, role, location, distance: 0
    };

    if (existingUser === null) {
      // Register new user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      await supabase.from('users_new').insert([
        {
          id: user?.id ?? "",
          email,
          name,
          role,
          location: `POINT(${location.longitude} ${location.latitude})`,
        },
      ]);

      existingUserData = {
        id: user?.id ?? "", email, name, role, location, distance: 0
      };
    }

    // Auto-login
    return existingUserData;
  },
};
