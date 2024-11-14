/* eslint-disable @typescript-eslint/no-explicit-any */


// authService.ts
import { supabase } from "@/shared/services/supabaseService";

interface AuthResponse {
  session: any | null;
  user: any | null;
  error: any | null;
}

const generatePassword = (name: string, role: string): string => {
  const combined = `${name.toLowerCase()}_${role}`;
  return Buffer.from(combined).toString("base64");
};

const generateEmail = (name: string, role: string, latitude: number, longitude: number): string => {
  const sanitizedName = name.replace(/\s/g, "_");
  return `${sanitizedName.toLowerCase()}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${role}@bakso.local`;
};


export const signInUser = async (
  name: string,
  role: string,
  latitude: number,
  longitude: number
): Promise<AuthResponse> => {
  try {
    const password = generatePassword(name, role);
    const email = generateEmail(name, role, latitude, longitude);

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    sessionStorage.setItem('role', role);
    // If user doesn't exist, sign them up
    if (signInError?.message?.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });
      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Sign in immediately after signup
        const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (newSignInError) throw newSignInError;

        return { ...newSignInData, error: null };
      }

    }
    if (signInData.user) {
      return { ...signInData, error: null }
    }

    throw new Error('Failed to authenticate');
  } catch (error) {
    console.error('Auth error:', error);
    return { session: null, user: null, error };
  }
};