import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage CDN — required for Avatar and course thumbnail images
        protocol: "https",
        hostname: "omgdjkzkervioonhcpvh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Google profile photos (for Google OAuth users)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // GitHub avatars (for future GitHub OAuth)
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
  // NOTE: The /api/lms/:path* rewrite to the old Express bridge has been removed.
  // All data access now goes directly through Supabase.
};

export default nextConfig;
