import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/cookie";

/**
 * Optimistic auth gate (Next.js 16 proxy — the middleware successor). The
 * Supabase session lives client-side, so this checks a presence-only mirror
 * cookie and bounces signed-out visitors to /login before a protected page
 * renders. It is a UX gate, not authorization: every protected API route
 * independently verifies the Supabase access token.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(AUTH_COOKIE)) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/designer/:path*"],
};
