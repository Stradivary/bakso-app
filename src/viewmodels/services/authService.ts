import { AuthResponse } from "@/models/user.types";
import { supabase } from "./supabaseService";
import { generatePassword, generateEmail } from "@/shared/utils";

export const signInUser = async (
  name: string,
  role: string,
  latitude: number,
  longitude: number,
): Promise<AuthResponse> => {
  try {
    const password = generatePassword(name, role);
    const email = generateEmail(name, role, latitude, longitude);

    // Try to sign in first
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    // If user doesn't exist, sign them up
    if (signInError?.message?.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
              role,
              latitude,
              longitude,
            },
          },
        });
      if (signUpError) throw signUpError;

      return { ...signUpData, error: null };
    }
    if (signInData.user) {
      return { ...signInData, error: null };
    }

    throw new Error("Failed to authenticate");
  } catch (error: unknown) {
    return { session: null, user: null, error: error as Error };
  }
};
