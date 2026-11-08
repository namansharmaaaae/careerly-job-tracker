"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use a password with at least 8 characters."),
});

function credentialsFrom(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signInAction(formData: FormData) {
  const credentials = credentialsFrom(formData);
  if (!credentials.success) {
    redirect(`/login?error=${encodeURIComponent(credentials.error.issues[0]?.message ?? "Check your details.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);
  if (error) {
    console.error("Supabase sign-in failed:", error.message);
    redirect("/login?error=Email%20or%20password%20was%20not%20accepted.");
  }

  redirect("/");
}

export async function signUpAction(formData: FormData) {
  const credentials = credentialsFrom(formData);
  if (!credentials.success) {
    redirect(`/register?error=${encodeURIComponent(credentials.error.issues[0]?.message ?? "Check your details.")}`);
  }

  const confirmation = z.string().safeParse(formData.get("confirmPassword"));
  if (!confirmation.success || confirmation.data !== credentials.data.password) {
    redirect("/register?error=Passwords%20do%20not%20match.");
  }

  const supabase = await createClient();
  const emailRedirectTo = new URL("/auth/callback", getSiteUrl()).toString();
  const { data, error } = await supabase.auth.signUp({
    ...credentials.data,
    options: { emailRedirectTo },
  });
  if (error) {
    console.error("Supabase sign-up failed:", error.message);
    redirect("/register?error=We%20couldn%E2%80%99t%20create%20your%20account.%20Try%20again.");
  }

  if (data.session) redirect("/");
  redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account.");
}

export async function requestPasswordResetAction(formData: FormData) {
  const emailResult = z.string().trim().email("Enter a valid email address.").safeParse(formData.get("email"));
  if (!emailResult.success) {
    redirect(`/forgot-password?error=${encodeURIComponent(emailResult.error.issues[0]?.message ?? "Enter a valid email address.")}`);
  }

  const supabase = await createClient();
  const redirectTo = new URL("/auth/callback?next=/reset-password", getSiteUrl()).toString();
  const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, { redirectTo });
  if (error) {
    console.error("Supabase password reset request failed:", error.message);
    redirect("/forgot-password?error=We%20couldn%E2%80%99t%20send%20a%20reset%20email.%20Try%20again.");
  }

  redirect("/login?message=If%20an%20account%20exists%20for%20that%20email%2C%20a%20reset%20link%20is%20on%20the%20way.");
}

export async function updatePasswordAction(formData: FormData) {
  const password = z.string().min(8, "Use a password with at least 8 characters.").safeParse(formData.get("password"));
  if (!password.success) {
    redirect(`/reset-password?error=${encodeURIComponent(password.error.issues[0]?.message ?? "Choose a stronger password.")}`);
  }

  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError) {
    console.error("Could not verify the password reset session:", claimsError.message);
    redirect("/login?error=Your%20reset%20link%20could%20not%20be%20verified.%20Request%20a%20new%20one.");
  }
  if (!data?.claims) redirect("/login?error=Your%20reset%20link%20has%20expired.%20Request%20a%20new%20one.");

  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) {
    console.error("Supabase password update failed:", error.message);
    redirect("/reset-password?error=We%20couldn%E2%80%99t%20update%20your%20password.%20Try%20again.");
  }

  redirect("/?message=Your%20password%20has%20been%20updated.");
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase sign-out failed:", error.message);
    redirect("/login?error=We%20couldn%E2%80%99t%20sign%20you%20out.%20Try%20again.");
  }

  redirect("/login?message=You%20have%20signed%20out.");
}
