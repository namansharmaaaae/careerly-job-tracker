import Link from "next/link";

export function SupabaseSetupNotice() {
  return (
    <section className="setup-notice">
      <span className="setup-notice-mark">!</span>
      <p className="panel-kicker">ONE-TIME SETUP</p>
      <h1>Connect your Supabase project</h1>
      <p>
        Create a project, copy <code>.env.example</code> to{" "}
        <code>.env.local</code>, and add your project URL and publishable key.
        Then run the database migration from the README.
      </p>
      <Link className="text-link" href="/">
        Return to the sample preview <span>→</span>
      </Link>
    </section>
  );
}
