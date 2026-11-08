import type { NextConfig } from "next";
import { DEV_TUNNEL_HOST } from "./src/lib/supabase/env";

const nextConfig: NextConfig = {
  /* config options here */
  ...(process.env.NODE_ENV === "development"
    ? {
        allowedDevOrigins: [DEV_TUNNEL_HOST],
        experimental: {
          serverActions: {
            allowedOrigins: [DEV_TUNNEL_HOST],
          },
        },
      }
    : {}),
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
