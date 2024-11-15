import { createClient } from "@supabase/supabase-js";
import { Database } from "../models/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://tfqnagzgyzfspmbladso.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getTabStorageKey() {
  const rand = Math.random().toString(36).substring(4);
  const token = `supabase-auth-token-${rand}`;

  sessionStorage.setItem('supabase.auth.key', token);

  return token;
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {

  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: sessionStorage,
    storageKey: getTabStorageKey(),
    detectSessionInUrl: false,

  }
});
