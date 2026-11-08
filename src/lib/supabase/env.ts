export const DEV_TUNNEL_HOST = "dk2qvf7w-3000.inc1.devtunnels.ms";

const SUPABASE_URL_NAME = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY_NAME = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const SITE_URL_NAME = "NEXT_PUBLIC_SITE_URL";

export function isSupabaseConfigured() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (hasUrl !== hasKey) {
    throw new Error(`${SUPABASE_URL_NAME} and ${SUPABASE_PUBLISHABLE_KEY_NAME} must both be set.`);
  }

  return hasUrl && hasKey;
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error(`${SUPABASE_URL_NAME} is missing. Copy .env.example to .env.local and set your Supabase project URL.`);
  }

  if (!publishableKey) {
    throw new Error(`${SUPABASE_PUBLISHABLE_KEY_NAME} is missing. Copy .env.example to .env.local and set your Supabase publishable key.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`${SUPABASE_URL_NAME} must be a valid absolute URL.`);
  }

  const isLocalHttp =
    parsedUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error(`${SUPABASE_URL_NAME} must use https:// (http:// is allowed only for a local URL).`);
  }

  return { url, publishableKey };
}

export function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error(`${SITE_URL_NAME} is missing. Set it in .env.local before requesting password recovery.`);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(siteUrl);
  } catch {
    throw new Error(`${SITE_URL_NAME} must be a valid absolute URL.`);
  }

  const isLocalHttp =
    parsedUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error(`${SITE_URL_NAME} must use https:// (http:// is allowed only for a local URL).`);
  }

  return parsedUrl.origin;
}
