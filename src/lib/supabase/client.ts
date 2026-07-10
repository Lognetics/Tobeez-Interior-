import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from "./config";

/**
 * Supabase client. URL + publishable (anon) key are safe to expose in the
 * browser — the database is protected by Row Level Security. Env vars override
 * the committed public defaults so you can point at a different project.
 */
export { supabaseConfigured };

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
