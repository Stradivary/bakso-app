import { Database } from "@/data/models/supabase.types";
import { supabaseAnonKey, supabaseUrl } from "@/shared/utils/constants";
import { SecureStorage } from "@/data/storage/SecureStorage";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: "abangbakso-session",
    storage: SecureStorage,
    detectSessionInUrl: false,
  },
});
