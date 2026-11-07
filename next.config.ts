import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Dashboard forms upload images (validated to 2 MB) through server actions; the default limit is 1 MB.
    serverActions: { bodySizeLimit: "3mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
