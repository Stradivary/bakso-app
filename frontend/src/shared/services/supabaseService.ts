import { createClient } from "@supabase/supabase-js";
import { Database } from "../models/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://tfqnagzgyzfspmbladso.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {

  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "cheesecake",
    storage: sessionStorage,
    detectSessionInUrl: false
  }
});
