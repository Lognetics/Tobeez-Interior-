export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryuedzhmpljlmaoveoef.supabase.co";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_BsQshkTeLeto7RQdsRCaYQ_R-nICc6m";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
