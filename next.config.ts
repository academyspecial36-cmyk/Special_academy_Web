import type { NextConfig } from "next";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval'`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://plus.unsplash.com https://maps.gstatic.com https://*.googleapis.com https://i.ytimg.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `connect-src 'self' https://*.supabase.co https://api.resend.com https://www.youtube.com`,
  `frame-src 'self' https://docs.google.com https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
].join("; ");

const nextConfig: NextConfig = {
  images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "plus.unsplash.com" },
    {
      protocol: "https",
      hostname: "svpvvbtrxozaocllhqqk.supabase.co",
      port: "",
      pathname: "/storage/v1/object/public/**",
    },
    { protocol: "https", hostname: "utvcmeilvvebjfpetolu.supabase.co" }, 
  ],
},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), display-capture=(self)" },
        ],
      },
    ];
  },
};

export default async function getConfig() {
  if (process.env.ANALYZE === "true") {
    const withBundleAnalyzer = (await import("@next/bundle-analyzer")).default;
    return withBundleAnalyzer({ enabled: true })(nextConfig);
  }
  return nextConfig;
}
