# Careerly — Job Application Tracker

A responsive job-search dashboard built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Current progress

- The dashboard currently shows sample applications.
- Without Supabase settings, add, edit, and delete work only in the temporary sample preview.
- Login, registration, password recovery, per-user database access, and persistent application actions are implemented. They become available after connecting a Supabase project.
- Signed-in users can request an on-demand Gemini summary of a job description. The description is sent to Google only when the user clicks the AI button; summaries are not automatically saved.
- The database migration and typed Supabase clients are in place; the migration must be applied to your own project before using the live dashboard.

## Run locally

1. Install [Node.js LTS](https://nodejs.org/) and open this folder in VS Code.
2. In the VS Code terminal, install packages and start the app:

   ```powershell
   npm install
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000).

To test on a phone through the current VS Code Dev Tunnel, open its forwarded HTTPS URL on the phone. The tunnel hostname is allowed for development assets and Server Actions in `next.config.ts`; this exception is development-only. If VS Code gives you a different tunnel hostname, update it there and restart `npm run dev`.

## Supabase setup (when ready to connect)

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`20261108000000_create_applications.sql`](./supabase/migrations/20261108000000_create_applications.sql).
3. Copy `.env.example` to `.env.local`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. In `.env.local`, replace the example values with your Supabase project URL and **publishable** key.
5. To enable Google login:
   - In [Google Cloud Console](https://console.cloud.google.com/auth/clients), create an OAuth client with type **Web application**.
   - Add `http://localhost:3000` as an authorized JavaScript origin for local testing.
   - Add the callback URL shown on Supabase **Authentication → Providers → Google** as an authorized redirect URI in Google Cloud.
   - Enable Google on the Supabase provider page and enter the Google client ID and client secret there. Do not put the Google client secret in `.env.local` or frontend code.
6. In Supabase **Authentication → URL Configuration**, set the Site URL to your production origin (for example, `https://careerly-job-tracker-phi.vercel.app`) and add both `http://localhost:3000/auth/callback` and `https://careerly-job-tracker-phi.vercel.app/auth/callback` to the Redirect URLs list. The Site URL is the fallback; the production callback must be explicitly allowed.
7. Restart the development server after changing environment variables.

For Vercel, set `NEXT_PUBLIC_SITE_URL` to the production origin (without a trailing path), and add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and any optional `GEMINI_API_KEY` in the project’s Environment Variables settings. After changing variables, redeploy so the production build uses them. Keep `.env.local` and provider secrets out of Git.

When signing in through the VS Code Dev Tunnel, also add the tunnel's exact callback URL (for example, `https://dk2qvf7w-3000.inc1.devtunnels.ms/auth/callback`) to Supabase **Authentication → URL Configuration → Redirect URLs**. Google sign-in starts through `/auth/google` and returns to the same host used to open the app, rather than redirecting to the server's internal `localhost` URL.

## Gemini AI summaries

1. Create a Gemini API key in [Google AI Studio](https://aistudio.google.com/app/apikey). This key is separate from the Google OAuth Client ID and Client Secret.
2. Put it in `.env.local` as `GEMINI_API_KEY=...`. Do not add a `NEXT_PUBLIC_` prefix, commit the key, or share it in chat.
3. Restart the development server. A signed-in user can open an application, enter its job description, and click **Summarize with AI**.

The summary request is made server-side with the `gemini-3.8-flash` model. Only the job description is sent; generated output is displayed but not stored automatically. Check Google AI Studio for current availability, quotas, and pricing for your account before using it regularly.

`.env.local` is ignored by Git. Never put a Supabase `service_role` key in a `NEXT_PUBLIC_` variable or in browser code. The publishable key is intended for app use; Row Level Security protects each user's rows.

## Useful commands

```powershell
npm run dev
npm run lint
npm run build
```
