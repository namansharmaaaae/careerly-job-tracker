import { AuthCard } from "@/components/auth-card";
import Link from "next/link";
import { SupabaseSetupNotice } from "@/components/supabase-setup-notice";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updatePasswordAction } from "../auth/actions";

type SearchParams = Promise<{ error?: string }>;

export const instant = false;

export default async function ResetPasswordPage({
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
      description="Choose a new password with at least 8 characters."
      title="Choose a new password"
    >
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      <form action={updatePasswordAction} className="auth-form">
        <label htmlFor="password">New password</label>
        <input autoComplete="new-password" id="password" minLength={8} name="password" required type="password" />
        <button className="primary-button auth-submit" type="submit">Update password</button>
      </form>
      <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
    </AuthCard>
  );
}
