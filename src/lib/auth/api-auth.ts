import "server-only";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export type ApiIdentity = {
  id: string;
  email: string | null;
  accessToken: string;
};

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function authenticateApiRequest(request: Request): Promise<ApiIdentity | null> {
  const accessToken = bearerToken(request);
  if (!accessToken) return null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getClaims(accessToken);
  const subject = data?.claims?.sub;
  if (error || typeof subject !== "string" || !subject) return null;

  return {
    id: subject,
    email: typeof data.claims.email === "string" ? data.claims.email : null,
    accessToken,
  };
}

export function authenticationRequired() {
  return Response.json(
    { error: "Authentication required", code: "AUTH_REQUIRED" },
    { status: 401 },
  );
}
