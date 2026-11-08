import { NextResponse, type NextRequest } from "next/server";
import { DEV_TUNNEL_HOST } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const appUrl =
    process.env.NODE_ENV === "development" && forwardedHost === DEV_TUNNEL_HOST
      ? `https://${DEV_TUNNEL_HOST}`
      : request.url;
  const authError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = request.nextUrl.searchParams.get("next");
  const safeNextPath = nextPath === "/reset-password" ? nextPath : "/";

  if (authError) {
    return NextResponse.redirect(
      new URL("/login?error=Google%20sign-in%20wasn%E2%80%99t%20completed.%20Please%20try%20again.", appUrl),
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=The%20confirmation%20link%20is%20invalid.", appUrl));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase auth callback failed:", error.message);
    return NextResponse.redirect(new URL("/login?error=The%20confirmation%20link%20has%20expired.", appUrl));
  }

  return NextResponse.redirect(new URL(safeNextPath, appUrl));
}
