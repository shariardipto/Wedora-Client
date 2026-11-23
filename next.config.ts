import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Image uploads (max 4 MB) go through a Server Action; leave room for multipart overhead.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Service and profile images are hosted on ImgBB.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ibb.co", pathname: "/**" }],
    // 75 is the default; the large brand photos (hero arch, sign-in/up panel) use 90 so dark, soft
    // tones don't show compression.
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
