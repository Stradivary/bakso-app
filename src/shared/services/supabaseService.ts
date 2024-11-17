import { createClient } from "@supabase/supabase-js";
import { Database } from "../models/supabase.types";
import { supabaseAnonKey, supabaseUrl } from "../utils/constants";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "abangbakso-session",
    storage: sessionStorage,
    detectSessionInUrl: false,
  },
});
