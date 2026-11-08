import { NextResponse, type NextRequest } from "next/server";
import { DEV_TUNNEL_HOST, getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const appUrl = process.env.NODE_ENV === "development" && forwardedHost === DEV_TUNNEL_HOST
    ? `https://${DEV_TUNNEL_HOST}`
    : getSiteUrl();
  const redirectTo = new URL("/auth/callback", appUrl).toString();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    console.error("Supabase Google sign-in could not start:", error.message);
    return NextResponse.redirect(
      new URL("/login?error=Google%20sign-in%20couldn%E2%80%99t%20start.%20Please%20try%20again.", appUrl),
    );
  }

  if (!data.url) {
    console.error("Supabase Google sign-in did not return an authorization URL.");
    return NextResponse.redirect(
      new URL("/login?error=Google%20sign-in%20couldn%E2%80%99t%20start.%20Please%20try%20again.", appUrl),
    );
  }

  return NextResponse.redirect(data.url);
}
