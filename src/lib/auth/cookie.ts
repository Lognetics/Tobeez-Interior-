/**
 * Presence-only cookie that mirrors the client-side Supabase session so the
 * proxy can redirect signed-out visitors before a protected page loads. It
 * carries no token and grants nothing — protected API routes always verify
 * the real Supabase access token themselves.
 */
export const AUTH_COOKIE = "tobeez-auth";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export function mirrorAuthCookie(signedIn: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = signedIn
    ? `${AUTH_COOKIE}=1; path=/; max-age=${THIRTY_DAYS}; samesite=lax`
    : `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
