import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client. URL + publishable (anon) key are safe to expose in the
 * browser — the database is protected by Row Level Security. Env vars override
 * the committed public defaults so you can point at a different project.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryuedzhmpljlmaoveoef.supabase.co";
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_BsQshkTeLeto7RQdsRCaYQ_R-nICc6m";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
