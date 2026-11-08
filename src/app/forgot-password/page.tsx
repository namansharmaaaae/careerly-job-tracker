import { AuthCard } from "@/components/auth-card";
import Link from "next/link";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requestPasswordResetAction } from "../auth/actions";

type SearchParams = Promise<{ error?: string }>;

export const instant = false;

export default async function ForgotPasswordPage({
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
      description="We’ll send a secure link if an account matches that email."
      title="Reset your password"
    >
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      <form action={requestPasswordResetAction} className="auth-form">
        <label htmlFor="email">Email address</label>
        <input autoComplete="email" id="email" name="email" required type="email" />
        <button className="primary-button auth-submit" type="submit">Send reset link</button>
      </form>
      <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    </AuthCard>
  );
}
