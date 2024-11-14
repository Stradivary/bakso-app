import { createClient } from "@supabase/supabase-js";
import { Database } from "../models/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://tfqnagzgyzfspmbladso.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getTabStorageKey() {
  if (!window.name) {
    window.name = Math.random().toString(36).substring(4);
  }
  return `supabase-auth-token-${window.name}`;
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
