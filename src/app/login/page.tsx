import { AuthCard } from "@/components/auth-card";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import Link from "next/link";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signInAction } from "../auth/actions";

type SearchParams = Promise<{ error?: string; message?: string }>;

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, message } = await searchParams;

  if (!isSupabaseConfigured()) {
    return <main className="auth-page"><SupabaseSetupNotice /></main>;
  }

  return (
    <AuthCard
      description="Sign in to pick up right where you left off."
      title="Welcome back"
    >
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      {message && <p className="auth-feedback success" role="status">{message}</p>}
      <GoogleSignInButton />
      <form action={signInAction} className="auth-form">
        <label htmlFor="email">Email address</label>
        <input autoComplete="email" id="email" name="email" required type="email" />
        <label htmlFor="password">Password</label>
        <input autoComplete="current-password" id="password" minLength={8} name="password" required type="password" />
        <div className="auth-form-meta">
          <span />
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <button className="primary-button auth-submit" type="submit">Sign in</button>
      </form>
      <p className="auth-switch">New to Careerly? <Link href="/register">Create an account</Link></p>
    </AuthCard>
  );
}
