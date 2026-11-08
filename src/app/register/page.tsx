import { AuthCard } from "@/components/auth-card";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import Link from "next/link";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signUpAction } from "../auth/actions";

type SearchParams = Promise<{ error?: string }>;

export const instant = false;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

  if (!isSupabaseConfigured()) {
    return <main className="auth-page"><SupabaseSetupNotice /></main>;
  }

  return (
    <AuthCard
      description="Create an account to keep your job search organized."
      title="Create your account"
    >
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      <GoogleSignInButton />
      <form action={signUpAction} className="auth-form">
        <label htmlFor="email">Email address</label>
        <input autoComplete="email" id="email" name="email" required type="email" />
        <label htmlFor="password">Password</label>
        <input autoComplete="new-password" id="password" minLength={8} name="password" required type="password" />
        <label htmlFor="confirm-password">Confirm password</label>
        <input autoComplete="new-password" id="confirm-password" minLength={8} name="confirmPassword" required type="password" />
        <button className="primary-button auth-submit" type="submit">Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
    </AuthCard>
  );
}
