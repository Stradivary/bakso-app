import { createClient } from "@supabase/supabase-js";
import { Database } from "../models/supabase.types";
import { supabaseAnonKey, supabaseUrl } from "../utils/constants";

function getTabStorageKey() {
  const rand = Math.random().toString(36).substring(4);
  const token = `supabase-auth-token-${rand}`;
  sessionStorage.setItem("supabase.auth.key", token);
  return token;
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: sessionStorage,
    storageKey: getTabStorageKey(),
    detectSessionInUrl: false,
  },
});
